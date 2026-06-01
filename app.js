// ====== KANZIDATA YA NDANI (STATE MANAGEMENT) ======
let players = JSON.parse(localStorage.getItem('eftPlayers')) || [];
let fixtures = JSON.parse(localStorage.getItem('eftFixtures')) || [];

// Kupakia data mara ya kwanza kabisa app ikifunguka
document.addEventListener("DOMContentLoaded", () => {
    renderPlayerLists();
    renderFixturesList();
    updateMatchSelectDropdown();
    renderLiveScores();
    renderStandings();
    
    // Kusikiliza mabadiliko ya chujio la dropdown ili kubadili label
    const matchSelect = document.getElementById('match-select');
    if (matchSelect) {
        matchSelect.addEventListener('change', handleMatchSelectChange);
    }
});

// ====== 1. MENU ROUTING ======
function showPage(pageId) {
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
}

function togglePaymentFields() {
    const method = document.getElementById('pay-method').value;
    const txField = document.getElementById('transaction-field');
    if (txField) txField.style.display = (method === 'manual') ? 'block' : 'none';
}

// ====== 2. MTAMBO WA SIRI WA PREMIUM ======
let secretClicks = 0;
function triggerSecretEngine() {
    secretClicks++;
    if (secretClicks >= 3) {
        document.getElementById('secret-input-container').style.display = 'block';
        alert("🚨 Mtambo wa siri wa Eft-V13 umewashwa! Ingiza 'premium' chini ili kukwepa malipo.");
        secretClicks = 0;
    }
}

// ====== 3. MTAMBO WA USAJILI ======
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
    renderStandings(); // Update table upya
    if (document.getElementById('admin-dashboard-area').style.display === 'block') {
        adminVerifyPayments(); 
    }

    if (newPlayer.status === 'Verified') {
        msgDiv.innerHTML = `🟢 Hongera ${name}! [🔑 PREMIUM] Umesajiliwa na Kudhinishwa kiotomatiki kwenye ${assignedLeague}!`;
        msgDiv.style.color = "#10b981";
    } else {
        msgDiv.innerHTML = `🟡 Hongera ${name}! Umesajiliwa kwenye ${assignedLeague}. Subiri Admin ahakiki malipo yako ili uingizwe kwenye ratiba.`;
        msgDiv.style.color = "#f59e0b";
    }

    document.getElementById('reg-form').reset();
    if (document.getElementById('secret-input-container')) document.getElementById('secret-input-container').style.display = 'none';
}

function renderPlayerLists() {
    const listDiv = document.getElementById('contacts-list');
    if (!listDiv) return;

    if (players.length === 0) {
        listDiv.innerHTML = "<p style='color: #9ca3af;'>Bado hakuna mchezaji yeyote aliyejisajili.</p>";
        return;
    }

    let html = `<table class='admin-table'>
        <tr><th>Mchezaji</th><th>Namba ya Simu</th><th>Ligi Iliyopangwa</th><th>Hali ya Usajili</th></tr>`;
    
    players.forEach(p => {
        const badgeClass = p.status === 'Verified' ? 'status-verified' : 'status-pending';
        const statusText = p.status === 'Verified' ? '🟢 VERIFIED' : '🟡 PENDING';
        html += `<tr>
            <td><strong>${p.name}</strong></td>
            <td>${p.phone}</td>
            <td><span style='color: #3b82f6; font-weight:bold;'>${p.league}</span></td>
            <td><span class='status-badge ${badgeClass}'>${statusText}</span></td>
        </tr>`;
    });
    html += "</table>";
    listDiv.innerHTML = html;
}

// ====== 4. MTAMBO MPYA WA KUTUMA MATOKEO (AUTOMATIC SUBMISSION ENGINE) ======

// A. Kusasisha Dropdown ya kuchagua mechi kwenye fomu ya wachezaji
function updateMatchSelectDropdown() {
    const select = document.getElementById('match-select');
    if (!select) return;

    // Chuja mechi ambazo bado hazijachezwa (score === null)
    const activeFixtures = fixtures.filter(f => f.score === null);

    if (activeFixtures.length === 0) {
        select.innerHTML = "<option value=''>-- Hakuna mechi amilifu zilizopangwa kwa sasa --</option>";
        return;
    }

    let html = "<option value=''>-- Chagua Mechi Yako Hapa --</option>";
    activeFixtures.forEach(f => {
        html += `<option value="${f.matchId}" data-home="${f.home}" data-away="${f.away}">[${f.league}] ${f.home} VS ${f.away}</option>`;
    });
    select.innerHTML = html;
}

// B. Kubadili herufi za Label kulingana na mechi iliyochaguliwa
function handleMatchSelectChange() {
    const select = document.getElementById('match-select');
    const selectedOption = select.options[select.selectedIndex];
    
    const homeLabel = document.getElementById('home-label');
    const awayLabel = document.getElementById('away-label');

    if (selectedOption && selectedOption.value !== "") {
        const homeName = selectedOption.getAttribute('data-home');
        const awayName = selectedOption.getAttribute('data-away');
        homeLabel.innerHTML = `Magoli ya 🏠 <strong>${homeName}</strong>:`;
        awayLabel.innerHTML = `Magoli ya 🚀 <strong>${awayName}</strong>:`;
    } else {
        homeLabel.innerHTML = "Magoli ya Home:";
        awayLabel.innerHTML = "Magoli ya Away:";
    }
}

// C. Kushughulikia kitendo cha kutuma matokeo ya Mechi kiotomatiki
function handleResultSubmission(event) {
    event.preventDefault();

    const matchId = document.getElementById('match-select').value;
    const homeScore = parseInt(document.getElementById('home-score').value);
    const awayScore = parseInt(document.getElementById('away-score').value);
    const msg = document.getElementById('submit-msg');

    if (!matchId) {
        alert("Tafadhali chagua mechi kwanza!");
        return;
    }

    // Sasisha score ya mechi kwenye array kuu
    fixtures = fixtures.map(f => {
        if (f.matchId === matchId) {
            f.score = { home: homeScore, away: awayScore };
        }
        return f;
    });

    // Hifadhi kwenye LocalStorage
    localStorage.setItem('eftFixtures', JSON.stringify(fixtures));

    // Refresha kurasa zote zinazotegemea matokeo papo hapo!
    updateMatchSelectDropdown();
    renderLiveScores();
    renderStandings(); // Mtambo unapiga hesabu za pointi upya hapa hapa!
    renderFixturesList();

    msg.innerHTML = "🟢 Matokeo yametumwa na msimamo umesasishwa kiotomatiki!";
    msg.style.color = "#10b981";
    document.getElementById('results-form').reset();
    document.getElementById('home-label').innerHTML = "Magoli ya Home:";
    document.getElementById('away-label').innerHTML = "Magoli ya Away:";

    setTimeout(() => { msg.innerHTML = ""; }, 4000);
}

// D. Kuonyesha orodha ya matokeo yote ya Live Scores yaliyochezwa
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
            <div style='font-size:12px; color:#9ca3af;'>${m.league} <br><span class="score-display">FT</span></div>
            <div style='flex:1; text-align:right; font-weight:bold; padding-right:15px;'>${m.home}</div>
            <div style='background-color:#374151; padding:6px 16px; border-radius:4px; font-weight:bold; color:#10b981; font-size:18px;'>
                ${m.score.home} - ${m.score.away}
            </div>
            <div style='flex:1; text-align:left; font-weight:bold; padding-left:15px;'>${m.away}</div>
        </div>`;
    });
    html += "</div>";
    container.innerHTML = html;
}

// ====== 5. ENGINE YA MSIMAMO WA LIGI (AUTOMATIC STANDINGS CALCULATOR) ======
function renderStandings() {
    const container = document.getElementById('standings-container');
    if (!container) return;

    const verifiedPlayers = players.filter(p => p.status === 'Verified');

    if (verifiedPlayers.length === 0) {
        container.innerHTML = "<p style='color: #9ca3af;'>Msimamo utatengenezwa mechi zikianza kuchezwa.</p>";
        return;
    }

    const leagues = ['League 1', 'League 2'];
    let finalHtml = "";

    leagues.forEach(lg => {
        const lgPlayers = verifiedPlayers.filter(p => p.league === lg);
        if (lgPlayers.length === 0) return;

        // Tengeneza muundo wa msimamo kwa kila timu ya ligi hii
        let tableData = {};
        lgPlayers.forEach(p => {
            tableData[p.name] = { name: p.name, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
        });

        // Soma mechi zote zilizochezwa kwenye ligi hii na kukokotoa pointi
        const lgMatches = fixtures.filter(f => f.league === lg && f.score !== null);
        lgMatches.forEach(m => {
            if (tableData[m.home] && tableData[m.away]) {
                tableData[m.home].pld += 1;
                tableData[m.away].pld += 1;
                tableData[m.home].gf += m.score.home;
                tableData[m.home].ga += m.score.away;
                tableData[m.away].gf += m.score.away;
                tableData[m.away].ga += m.score.home;
                tableData[m.home].gd = tableData[m.home].gf - tableData[m.home].ga;
                tableData[m.away].gd = tableData[m.away].gf - tableData[m.away].ga;

                if (m.score.home > m.score.away) {
                    tableData[m.home].w += 1;
                    tableData[m.home].pts += 3;
                    tableData[m.away].l += 1;
                } else if (m.score.home < m.score.away) {
                    tableData[m.away].w += 1;
                    tableData[m.away].pts += 3;
                    tableData[m.home].l += 1;
                } else {
                    tableData[m.home].d += 1;
                    tableData[m.home].pts += 1;
                    tableData[m.away].d += 1;
                    tableData[m.away].pts += 1;
                }
            }
        });

        // Badilisha kuwa array na panga kwa Pointi, kisha Tofauti ya Magoli (Goal Difference)
        let sortedData = Object.values(tableData).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            return b.gd - a.gd;
        });

        // Tengeneza Jedwali la HTML
        finalHtml += `<h3 style='color: #10b981; margin-top:25px; border-left: 4px solid #10b981; padding-left:10px;'>📊 Msimamo Rasmi - ${lg}</h3>
        <div class="card info" style="overflow-x: auto; margin-top:10px; padding:0;">
            <table style="width: 100%; min-width: 600px; border-collapse: collapse; text-align: center; color: white;">
                <tr style="background-color: #374151; border-bottom: 2px solid #1f2937;">
                    <th style="padding: 12px; text-align: left;">Nafasi & Mchezaji</th>
                    <th>Pld</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th style="color: #10b981;">Pts</th>
                </tr>`;
        
        sortedData.forEach((row, index) => {
            finalHtml += `<tr style="border-bottom: 1px solid #374151; background-color: ${index < 4 ? 'rgba(16,185,129,0.05)' : 'transparent'}">
                <td style="padding: 12px; text-align: left;"><strong>${index + 1}. ${row.name}</strong></td>
                <td>${row.pld}</td><td>${row.w}</td><td>${row.d}</td><td>${row.l}</td>
                <td>${row.gf}</td><td>${row.ga}</td>
                <td style="color: ${row.gd >= 0 ? '#10b981' : '#ef4444'}">${row.gd > 0 ? '+' + row.gd : row.gd}</td>
                <td style="color: #10b981; font-weight: bold; font-size:16px;">${row.pts}</td>
            </tr>`;
        });

        finalHtml += `</table></div>`;
    });

    container.innerHTML = finalHtml;
}

// ====== 6. INTERACTIVE ADMIN HUB ======
function adminVerifyPayments() {
    const zone = document.getElementById('admin-dynamic-content');
    const pendingPlayers = players.filter(p => p.status === 'Pending');

    if (pendingPlayers.length === 0) {
        zone.innerHTML = "<h4 style='color: #10b981; text-align:center;'>🎉 Hakuna maombi mapya ya usajili yanayosubiri uhakiki kwa sasa!</h4>";
        return;
    }

    let html = `<h3>📋 Maombi Yanayosubiri Uhakiki (${pendingPlayers.length})</h3>
    <table class='admin-table'>
        <tr><th>Mchezaji</th><th>Ligi</th><th>Kitendo</th></tr>`;
    
    pendingPlayers.forEach(p => {
        html += `<tr>
            <td><strong>${p.name}</strong> (${p.phone})</td>
            <td>${p.league}</td>
            <td><button onclick="clickVerifyPlayer('${p.id}')" class='mini-btn' style='background-color: #10b981; color: white;'>Verify ✅</button></td>
        </tr>`;
    });
    html += "</table>";
    zone.innerHTML = html;
}

function clickVerifyPlayer(id) {
    players = players.map(p => {
        if (p.id === id) p.status = 'Verified';
        return p;
    });
    localStorage.setItem('eftPlayers', JSON.stringify(players));
    
    renderPlayerLists();
    adminVerifyPayments();
    renderStandings(); 
    updateMatchSelectDropdown();
}

function adminOpenFixtureControl() {
    const zone = document.getElementById('admin-dynamic-content');
    const verifiedPlayers = players.filter(p => p.status === 'Verified');

    if (verifiedPlayers.length < 2) {
        zone.innerHTML = `<h4 style='color: #ef4444; text-align:center;'>⚠️ Ligi haiwezi kuanza! Inahitajika angalau wachezaji wawili (2) waliothibitishwa (VERIFIED). <br> Hivi sasa wapo: ${verifiedPlayers.length} tu.</h4>`;
        return;
    }

    const l1 = verifiedPlayers.filter(p => p.league === 'League 1');
    const l2 = verifiedPlayers.filter(p => p.league === 'League 2');

    let html = `<h3>🎲 Mtambo wa Kuzalisha Ratiba (Fixtures Engine)</h3>
    <p style='color: #9ca3af; font-size:13px;'>Mfumo utazalisha mechi za mzunguko (Round Robin) kwa wachezaji waliolipia pekee.</p>
    <div style='margin-top: 15px; display:flex; gap:15px;'>`;
    
    if (l1.length >= 2) {
        html += `<button onclick="generateLeagueFixtures('League 1')" class='submit-btn' style='background-color:#10b981; margin:0;'>Tengeneza Ratiba ya League 1 (${l1.length} Players)</button>`;
    }
    if (l2.length >= 2) {
        html += `<button onclick="generateLeagueFixtures('League 2')" class='submit-btn' style='background-color:#3b82f6; margin:0;'>Tengeneza Ratiba ya League 2 (${l2.length} Players)</button>`;
    }
    
    html += `</div>`;
    zone.innerHTML = html;
}

function generateLeagueFixtures(leagueName) {
    const pool = players.filter(p => p.status === 'Verified' && p.league === leagueName);
    
    // Futa mechi za zamani za ligi hii tu
    fixtures = fixtures.filter(f => f.league !== leagueName);

    for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
            fixtures.push({
                matchId: 'MCH-' + Math.random().toString(36).substr(2, 9),
                league: leagueName,
                home: pool[i].name,
                away: pool[j].name,
                score: null
            });
        }
    }

    localStorage.setItem('eftFixtures', JSON.stringify(fixtures));
    renderFixturesList();
    updateMatchSelectDropdown();
    renderLiveScores();
    renderStandings();
    alert(`🎯 Hongera! Mechi za ${leagueName} zimepangwa na kusasishwa kwenye menyu zote!`);
    adminOpenFixtureControl();
}

function renderFixturesList() {
    const container = document.getElementById('fixtures-list');
    if (!container) return;

    if (fixtures.length === 0) {
        container.innerHTML = "<p style='color: #9ca3af;'>Bado hakuna ratiba iliyotengenezwa kwa msimu huu.</p>";
        return;
    }

    let html = "";
    const leagues = ['League 1', 'League 2'];

    leagues.forEach(lg => {
        const lgMatches = fixtures.filter(f => f.league === lg);
        if (lgMatches.length > 0) {
            html += `<h3 style='color: #3b82f6; margin-top:20px; border-bottom: 1px solid #374151; padding-bottom:5px;'>🗓️ ${lg} - Mechi Zilizopangwa</h3>
            <div style='display:grid; gap:10px; margin-top:10px;'>`;
            
            lgMatches.forEach(m => {
                const statusStr = m.score !== null ? `<span style="color:#10b981; font-weight:bold;">${m.score.home} - ${m.score.away} (FT)</span>` : "<span style='color:#6b7280;'>Haijachezwa</span>";
                html += `<div style='background-color:#1f2937; padding:12px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;'>
                    <span style='flex:1; text-align:right; font-weight:bold;'>${m.home}</span>
                    <span style='background-color:#374151; padding:4px 12px; border-radius:4px; margin: 0 15px; font-size:12px;'>${statusStr}</span>
                    <span style='flex:1; text-align:left; font-weight:bold;'>${m.away}</span>
                </div>`;
            });
            html += `</div>`;
        }
    });

    container.innerHTML = html;
}

function adminClearAllData() {
    if (confirm("🚨 Je, una uhakika unataka kufuta wachezaji na ratiba zote kuanza upya?")) {
        localStorage.clear();
        players = [];
        fixtures = [];
        renderPlayerLists();
        renderFixturesList();
        updateMatchSelectDropdown();
        renderLiveScores();
        renderStandings();
        document.getElementById('admin-dynamic-content').innerHTML = "<p style='color:#10b981; text-align:center;'>Mfumo umesafishwa kabisa!</p>";
    }
}

// ====== 7. ADMIN SYSTEM ACCESS AUTH ======
function loginAdmin() {
    const inputPass = document.getElementById('admin-login-pass').value;
    const currentAdminPass = localStorage.getItem('eftAdminPassword') || "tinka2026";

    if (inputPass === currentAdminPass) {
        alert("🛡️ Karibu Kwenye Jopo la Usimamizi la Tinka Tech!");
        document.getElementById('admin-login-area').style.display = 'none';
        document.getElementById('admin-dashboard-area').style.display = 'block';
    } else {
        alert("❌ Nenosiri si sahihi!");
    }
}

function togglePasswordReset() {
    const area = document.getElementById('password-reset-area');
    if (area) area.style.display = area.style.
