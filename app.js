// ====== 1. MENU ROUTING (IMEWEKWA JUU KABISA ILI ISICRASH) ======
function showPage(pageId) {
    try {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active-page');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const targetPage = document.getElementById(pageId);
        if (targetPage) targetPage.classList.add('active-page');
        
        const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            return onclickAttr && onclickAttr.includes(pageId);
        });
        if (activeBtn) activeBtn.classList.add('active');

        if (window.innerWidth <= 768) {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    } catch(e) {
        console.error("Menu Navigation Error:", e);
    }
}

// ====== 2. KANZIDATA YA NDANI YENYE ULINZI WA ERROR (BULLETPROOF) ======
let players = [];
let fixtures = [];

try {
    const savedPlayers = localStorage.getItem('eftPlayers');
    if (savedPlayers) players = JSON.parse(savedPlayers);
} catch(e) {
    console.error("Data za wachezaji zilikuwa mbovu, zimesafishwa.");
    localStorage.removeItem('eftPlayers');
}

try {
    const savedFixtures = localStorage.getItem('eftFixtures');
    if (savedFixtures) fixtures = JSON.parse(savedFixtures);
} catch(e) {
    console.error("Data za ratiba zilikuwa mbovu, zimesafishwa.");
    localStorage.removeItem('eftFixtures');
}

// Kupakia data mara ya kwanza kabisa app ikifunguka
document.addEventListener("DOMContentLoaded", () => {
    renderPlayerLists();
    renderFixturesList();
    updateMatchSelectDropdown();
    renderLiveScores();
    renderStandings();
    
    const matchSelect = document.getElementById('match-select');
    if (matchSelect) matchSelect.addEventListener('change', handleMatchSelectChange);
});

// ====== 3. MTAMBO WA USAJILI ======
function togglePaymentFields() {
    const method = document.getElementById('pay-method').value;
    const txField = document.getElementById('transaction-field');
    if (txField) txField.style.display = (method === 'manual') ? 'block' : 'none';
}

let secretClicks = 0;
function triggerSecretEngine() {
    secretClicks++;
    if (secretClicks >= 3) {
        const sc = document.getElementById('secret-input-container');
        if (sc) sc.style.display = 'block';
        alert("🚨 Mtambo wa siri wa Eft-V13 umewashwa! Ingiza 'premium'.");
        secretClicks = 0;
    }
}

function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const bypassKey = document.getElementById('secret-bypass-key') ? document.getElementById('secret-bypass-key').value.trim() : '';
    const msgDiv = document.getElementById('reg-message');

    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        msgDiv.innerHTML = "❌ Jina hili lishajisajili kwenye mfumo!";
        msgDiv.style.color = "#ef4444";
        return;
    }

    const league1Count = players.filter(p => p.league === 'League 1').length;
    const assignedLeague = league1Count < 16 ? 'League 1' : 'League 2';

    const newPlayer = {
        id: 'PLY-' + Date.now(),
        name: name,
        phone: phone,
        league: assignedLeague,
        status: (bypassKey.toLowerCase() === 'premium') ? 'Verified' : 'Pending',
        registeredAt: new Date().toLocaleDateString()
    };

    players.push(newPlayer);
    localStorage.setItem('eftPlayers', JSON.stringify(players));
    
    renderPlayerLists();
    renderStandings(); 

    if (newPlayer.status === 'Verified') {
        msgDiv.innerHTML = `🟢 Hongera ${name}! [🔑 PREMIUM] Umesajiliwa kiotomatiki kwenye ${assignedLeague}!`;
        msgDiv.style.color = "#10b981";
    } else {
        msgDiv.innerHTML = `🟡 Hongera ${name}! Umesajiliwa ${assignedLeague}. Subiri Admin ahakiki malipo yako.`;
        msgDiv.style.color = "#f59e0b";
    }

    document.getElementById('reg-form').reset();
    const sec = document.getElementById('secret-input-container');
    if (sec) sec.style.display = 'none';
}

function renderPlayerLists() {
    const listDiv = document.getElementById('contacts-list');
    if (!listDiv) return;
    if (players.length === 0) {
        listDiv.innerHTML = "<p style='color: #9ca3af;'>Bado hakuna mchezaji yeyote aliyejisajili.</p>";
        return;
    }
    let html = `<table class='admin-table'><tr><th>Mchezaji</th><th>Simu</th><th>Ligi</th><th>Hali</th></tr>`;
    players.forEach(p => {
        const badgeClass = p.status === 'Verified' ? 'status-verified' : 'status-pending';
        const statusText = p.status === 'Verified' ? '🟢 VERIFIED' : '🟡 PENDING';
        html += `<tr><td><strong>${p.name}</strong></td><td>${p.phone}</td>
            <td><span style='color: #3b82f6;'>${p.league}</span></td>
            <td><span class='status-badge ${badgeClass}'>${statusText}</span></td></tr>`;
    });
    listDiv.innerHTML = html + "</table>";
}

// ====== 4. MATOKEO NA MSIMAMO ======
function updateMatchSelectDropdown() {
    const select = document.getElementById('match-select');
    if (!select) return;
    const activeFixtures = fixtures.filter(f => f.score === null);
    if (activeFixtures.length === 0) {
        select.innerHTML = "<option value=''>-- Hakuna mechi amilifu zilizopangwa --</option>";
        return;
    }
    let html = "<option value=''>-- Chagua Mechi Yako Hapa --</option>";
    activeFixtures.forEach(f => {
        html += `<option value="${f.matchId}" data-home="${f.home}" data-away="${f.away}">[${f.league}] ${f.home} VS ${f.away}</option>`;
    });
    select.innerHTML = html;
}

function handleMatchSelectChange() {
    const select = document.getElementById('match-select');
    if(!select) return;
    const selectedOption = select.options[select.selectedIndex];
    const homeLabel = document.getElementById('home-label');
    const awayLabel = document.getElementById('away-label');
    if (selectedOption && selectedOption.value !== "") {
        homeLabel.innerHTML = `Magoli ya 🏠 <strong>${selectedOption.getAttribute('data-home')}</strong>:`;
        awayLabel.innerHTML = `Magoli ya 🚀 <strong>${selectedOption.getAttribute('data-away')}</strong>:`;
    } else {
        homeLabel.innerHTML = "Magoli ya Home:";
        awayLabel.innerHTML = "Magoli ya Away:";
    }
}

function handleResultSubmission(event) {
    event.preventDefault();
    const matchId = document.getElementById('match-select').value;
    const homeScore = parseInt(document.getElementById('home-score').value);
    const awayScore = parseInt(document.getElementById('away-score').value);
    const msg = document.getElementById('submit-msg');
    if (!matchId) { alert("Chagua mechi kwanza!"); return; }

    fixtures = fixtures.map(f => {
        if (f.matchId === matchId) f.score = { home: homeScore, away: awayScore };
        return f;
    });
    localStorage.setItem('eftFixtures', JSON.stringify(fixtures));

    updateMatchSelectDropdown();
    renderLiveScores();
    renderStandings(); 
    renderFixturesList();

    msg.innerHTML = "🟢 Matokeo yametumwa na msimamo umesasishwa kiotomatiki!";
    msg.style.color = "#10b981";
    document.getElementById('results-form').reset();
    document.getElementById('home-label').innerHTML = "Magoli ya Home:";
    document.getElementById('away-label').innerHTML = "Magoli ya Away:";
    setTimeout(() => { msg.innerHTML = ""; }, 4000);
}

function renderLiveScores() {
    const container = document.getElementById('live-scores-container');
    if (!container) return;
    const playedMatches = fixtures.filter(f => f.score !== null);
    if (playedMatches.length === 0) {
        container.innerHTML = "<p style='color: #9ca3af;'>Bado hakuna mechi zilizochezwa.</p>";
        return;
    }
    let html = "<div style='display:grid; gap:12px;'>";
    playedMatches.forEach(m => {
        html += `<div style='background-color:#1f2937; padding:15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; border-left: 4px solid #10b981;'>
            <div style='font-size:12px; color:#9ca3af;'>${m.league}<br><span class="score-display">FT</span></div>
            <div style='flex:1; text-align:right; font-weight:bold; padding-right:15px;'>${m.home}</div>
            <div style='background-color:#374151; padding:6px 16px; border-radius:4px; font-weight:bold; color:#10b981; font-size:18px;'>
                ${m.score.home} - ${m.score.away}</div>
            <div style='flex:1; text-align:left; font-weight:bold; padding-left:15px;'>${m.away}</div></div>`;
    });
    container.innerHTML = html + "</div>";
}

function renderStandings() {
    const container = document.getElementById('standings-container');
    if (!container) return;
    const verifiedPlayers = players.filter(p => p.status === 'Verified');
    if (verifiedPlayers.length === 0) {
        container.innerHTML = "<p style='color: #9ca3af;'>Msimamo utatengenezwa mechi zikianza kuchezwa.</p>";
        return;
    }

    let finalHtml = "";
    ['League 1', 'League 2'].forEach(lg => {
        const lgPlayers = verifiedPlayers.filter(p => p.league === lg);
        if (lgPlayers.length === 0) return;

        let tableData = {};
        lgPlayers.forEach(p => {
            tableData[p.name] = { name: p.name, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
        });

        const lgMatches = fixtures.filter(f => f.league === lg && f.score !== null);
        lgMatches.forEach(m => {
            if (tableData[m.home] && tableData[m.away]) {
                tableData[m.home].pld += 1; tableData[m.away].pld += 1;
                tableData[m.home].gf += m.score.home; tableData[m.home].ga += m.score.away;
                tableData[m.away].gf += m.score.away; tableData[m.away].ga += m.score.home;
                tableData[m.home].gd = tableData[m.home].gf - tableData[m.home].ga;
                tableData[m.away].gd = tableData[m.away].gf - tableData[m.away].ga;

                if (m.score.home > m.score.away) { tableData[m.home].w += 1; tableData[m.home].pts += 3; tableData[m.away].l += 1; } 
                else if (m.score.home < m.score.away) { tableData[m.away].w += 1; tableData[m.away].pts += 3; tableData[m.home].l += 1; } 
                else { tableData[m.home].d += 1; tableData[m.home].pts += 1; tableData[m.away].d += 1; tableData[m.away].pts += 1; }
            }
        });

        let sortedData = Object.values(tableData).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            return b.gd - a.gd;
        });

        finalHtml += `<h3 style='color: #10b981; margin-top:25px; border-left: 4px solid #10b981; padding-left:10px;'>📊 Msimamo - ${lg}</h3>
        <div class="card info" style="overflow-x: auto; margin-top:10px; padding:0;">
            <table style="width: 100%; min-width: 600px; border-collapse: collapse; text-align: center; color: white;">
                <tr style="background-color: #374151; border-bottom: 2px solid #1f2937;">
                    <th style="padding: 12px; text-align: left;">Timu/Mchezaji</th>
                    <th>Pld</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th style="color: #10b981;">Pts</th>
                </tr>`;
        sortedData.forEach((row, idx) => {
            finalHtml += `<tr style="border-bottom: 1px solid #374151;">
                <td style="padding: 12px; text-align: left;"><strong>${idx + 1}. ${row.name}</strong></td>
                <td>${row.pld}</td><td>${row.w}</td><td>${row.d}</td><td>${row.l}</td><td>${row.gf}</td><td>${row.ga}</td>
                <td style="color: ${row.gd >= 0 ? '#10b981' : '#ef4444'}">${row.gd > 0 ? '+'+row.gd : row.gd}</td>
                <td style="color: #10b981; font-weight: bold; font-size:16px;">${row.pts}</td></tr>`;
        });
        finalHtml += `</table></div>`;
    });
    container.innerHTML = finalHtml;
}

function renderFixturesList() {
    const container = document.getElementById('fixtures-list');
    if (!container) return;
    if (fixtures.length === 0) {
        container.innerHTML = "<p style='color: #9ca3af;'>Bado hakuna ratiba iliyotengenezwa.</p>";
        return;
    }
    let html = "";
    ['League 1', 'League 2'].forEach(lg => {
        const lgMatches = fixtures.filter(f => f.league === lg);
        if (lgMatches.length > 0) {
            html += `<h3 style='color: #3b82f6; margin-top:20px;'>🗓️ ${lg} - Mechi Zilizopangwa</h3><div style='display:grid; gap:10px; margin-top:10px;'>`;
            lgMatches.forEach(m => {
                const statusStr = m.score !== null ? `<span style="color:#10b981; font-weight:bold;">${m.score.home} - ${m.score.away} (FT)</span>` : "<span style='color:#6b7280;'>Haijachezwa</span>";
                html += `<div style='background-color:#1f2937; padding:12px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;'>
                    <span style='flex:1; text-align:right; font-weight:bold;'>${m.home}</span>
                    <span style='background-color:#374151; padding:4px 12px; border-radius:4px; margin: 0 15px;'>${statusStr}</span>
                    <span style='flex:1; text-align:left; font-weight:bold;'>${m.away}</span></div>`;
            });
            html += `</div>`;
        }
    });
    container.innerHTML = html;
}

// ====== 5. ADMIN HUB YENYE KUSAFIHSA ERROR (RESET) ======
function adminVerifyPayments() {
    const zone = document.getElementById('admin-dynamic-content');
    const pendingPlayers = players.filter(p => p.status === 'Pending');
    if (pendingPlayers.length === 0) {
        zone.innerHTML = "<h4 style='color: #10b981; text-align:center;'>🎉 Hakuna maombi yanayosubiri uhakiki!</h4>";
        return;
    }
    let html = `<h3>📋 Yanayosubiri (${pendingPlayers.length})</h3><table class='admin-table'><tr><th>Mchezaji</th><th>Kitendo</th></tr>`;
    pendingPlayers.forEach(p => {
        html += `<tr><td><strong>${p.name}</strong> (${p.phone})</td>
        <td><button onclick="clickVerifyPlayer('${p.id}')" class='mini-btn' style='background-color:#10b981;color:white;'>Verify ✅</button></td></tr>`;
    });
    zone.innerHTML = html + "</table>";
}

function clickVerifyPlayer(id) {
    players = players.map(p => { if (p.id === id) p.status = 'Verified'; return p; });
    localStorage.setItem('eftPlayers', JSON.stringify(players));
    renderPlayerLists(); adminVerifyPayments(); renderStandings(); updateMatchSelectDropdown();
}

function adminOpenFixtureControl() {
    const zone = document.getElementById('admin-dynamic-content');
    const verifiedPlayers = players.filter(p => p.status === 'Verified');
    if (verifiedPlayers.length < 2) {
        zone.innerHTML = `<h4 style='color: #ef4444; text-align:center;'>⚠️ Ligi inahitaji wachezaji 2+ waliothibitishwa. Wapo: ${verifiedPlayers.length} tu.</h4>`;
        return;
    }
    let html = `<div style='margin-top: 15px; display:flex; gap:15px;'>`;
    const l1 = verifiedPlayers.filter(p => p.league === 'League 1');
    const l2 = verifiedPlayers.filter(p => p.league === 'League 2');
    if (l1.length >= 2) html += `<button onclick="generateLeagueFixtures('League 1')" class='submit-btn' style='background-color:#10b981; margin:0;'>Tengeneza League 1</button>`;
    if (l2.length >= 2) html += `<button onclick="generateLeagueFixtures('League 2')" class='submit-btn' style='background-color:#3b82f6; margin:0;'>Tengeneza League 2</button>`;
    zone.innerHTML = html + `</div>`;
}

function generateLeagueFixtures(leagueName) {
    const pool = players.filter(p => p.status === 'Verified' && p.league === leagueName);
    fixtures = fixtures.filter(f => f.league !== leagueName);
    for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
            fixtures.push({ matchId: 'MCH-' + Math.random().toString(36).substr(2, 9), league: leagueName, home: pool[i].name, away: pool[j].name, score: null });
        }
    }
    localStorage.setItem('eftFixtures', JSON.stringify(fixtures));
    renderFixturesList(); updateMatchSelectDropdown(); renderLiveScores(); renderStandings();
    alert(`🎯 Mechi za ${leagueName} zimepangwa!`);
    adminOpenFixtureControl();
}

function adminClearAllData() {
    if (confirm("🚨 Una uhakika unataka kusafisha LIGI YOTE ianze upya? (Hii inafuta Errors zote pia)")) {
        localStorage.removeItem('eftPlayers');
        localStorage.removeItem('eftFixtures');
        players = []; fixtures = [];
        renderPlayerLists(); renderFixturesList(); updateMatchSelectDropdown(); renderLiveScores(); renderStandings();
        document.getElementById('admin-dynamic-content').innerHTML = "<p style='color:#10b981; text-align:center;'>Mfumo umesafishwa na uko Safi kabisa!</p>";
        alert("Ligi imeanza upya kikamilifu!");
    }
}

function loginAdmin() {
    const inputPass = document.getElementById('admin-login-pass').value;
    const currentAdminPass = localStorage.getItem('eftAdminPassword') || "tinka2026";
    if (inputPass === currentAdminPass) {
        document.getElementById('admin-login-area').style.display = 'none';
        document.getElementById('admin-dashboard-area').style.display = 'block';
    } else {
        alert("❌ Nenosiri si sahihi!");
    }
}

function togglePasswordReset() {
    const area = document.getElementById('password-reset-area');
    if (area) area.style.display = area.style.display === 'none' ? 'block' : 'none';
}

function changeAdminPassword() {
    const secretWord = document.getElementById('secret-senior-word').value.trim();
    const newPass = document.getElementById('new-admin-pass').value.trim();
    if (secretWord.toLowerCase() === "senior") {
        if (newPass.length >= 4) {
            localStorage.setItem('eftAdminPassword', newPass);
            document.getElementById('admin-reset-msg').innerHTML = "✅ Imebadilishwa!";
        }
    } else { alert("❌ Neno la siri si sahihi!"); }
}

// PWA Install
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e;
    const btn = document.getElementById('install-container');
    if (btn) btn.style.display = 'block';
});
const installBtn = document.getElementById('install-btn');
if(installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            document.getElementById('install-container').style.display = 'none';
            deferredPrompt = null;
        }
    });
}
