/**
 * ==========================================================================
 * EFT GAMERS LEAGUE - CORE ENGINE (V13)
 * Developed by: Amani Maba (Polymath Tech Scientist)
 * Description: Automated eSports League Management System with bulletproof 
 *              error catching, dynamic filtering, and real-time standings calculations.
 * ==========================================================================
 */

// ====== 1. GLOBAL STATE & DATA STORAGE (BULLETPROOF INITIALIZATION) ======
let players = [];
let fixtures = [];

try {
    const savedPlayers = localStorage.getItem('eftPlayers');
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
    }
} catch (e) {
    console.error("🚨 Error kusoma data za wachezaji kutoka LocalStorage. Data zimesafishwa.", e);
    players = [];
    localStorage.removeItem('eftPlayers');
}

try {
    const savedFixtures = localStorage.getItem('eftFixtures');
    if (savedFixtures) {
        fixtures = JSON.parse(savedFixtures);
    }
} catch (e) {
    console.error("🚨 Error kusoma data za ratiba kutoka LocalStorage. Data zimesafishwa.", e);
    fixtures = [];
    localStorage.removeItem('eftFixtures');
}

// ====== 2. APPLICATION INITIALIZATION (DOM CONTENT LOADED) ======
document.addEventListener("DOMContentLoaded", () => {
    // Pakia na uonyeshe data zote mara ya kwanza kabisa programu ikifunguka
    renderPlayerLists();
    renderFixturesList();
    updateMatchSelectDropdown();
    renderLiveScores();
    renderStandings();
    
    // Unganisha usikilizaji wa mabadiliko ya kuchagua mechi kwenye kikokotoo cha admin
    const matchSelect = document.getElementById('match-select');
    if (matchSelect) {
        matchSelect.addEventListener('change', handleMatchSelectChange);
    }
});

// ====== 3. MENU ROUTING ENGINE (DYNAMIC PAGE SWITCHER) ======
function showPage(pageId) {
    try {
        // Ficha kurasa zote kwanza
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active-page');
        });
        
        // Ondoa weusi/mwangaza kwenye vifungo vyote vya menu
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Washa ukurasa ulioteuliwa
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active-page');
        } else {
            console.warn(`Page with ID '${pageId}' does not exist.`);
            return;
        }
        
        // Washa kitufe cha menu kinachoendana na ukurasa husika
        const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            return onclickAttr && onclickAttr.includes(pageId);
        });
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Kama mtumiaji yuko kwenye simu, mpeleke juu kabisa ya maudhui mapya (UX Smooth Scroll)
        if (window.innerWidth <= 768) {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (e) {
        console.error("Menu Navigation Error Caught:", e);
    }
}

// ====== 4. WIZARD WA USAJILI NA MBINU ZA SIRI ======
function togglePaymentFields() {
    const method = document.getElementById('pay-method').value;
    const txField = document.getElementById('transaction-field');
    if (txField) {
        txField.style.display = (method === 'manual') ? 'block' : 'none';
    }
}

let secretClicks = 0;
function triggerSecretEngine() {
    secretClicks++;
    if (secretClicks >= 3) {
        const sc = document.getElementById('secret-input-container');
        if (sc) {
            sc.style.display = 'block';
        }
        alert("🚨 MTAMBO WA SIRI WA EFT-V13 UMEWASHWA!\n\nIngiza neno 'premium' kwenye kisanduku cha siri ili kujisajili moja kwa moja bila uhakiki wa Admin.");
        secretClicks = 0;
    }
}

function handleRegistration(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('reg-name');
    const phoneInput = document.getElementById('reg-phone');
    const bypassKeyInput = document.getElementById('secret-bypass-key');
    const msgDiv = document.getElementById('reg-message');
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const bypassKey = bypassKeyInput ? bypassKeyInput.value.trim() : '';

    // Kuzuia majina yanayofanana kwenye mfumo
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        msgDiv.innerHTML = "❌ Jina hili la eFootball tayari limesajiliwa kwenye mfumo!";
        msgDiv.style.color = "#ef4444";
        return;
    }

    // Mgawanyo wa Kiotomatiki wa Ligi (League 1 ikijaa wachezaji 16, inayofuata ni League 2)
    const league1Count = players.filter(p => p.league === 'League 1').length;
    const assignedLeague = league1Count < 16 ? 'League 1' : 'League 2';

    // Kutengeneza mchezaji mpya
    const newPlayer = {
        id: 'PLY-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: name,
        phone: phone,
        league: assignedLeague,
        status: (bypassKey.toLowerCase() === 'premium') ? 'Verified' : 'Pending',
        registeredAt: new Date().toLocaleDateString()
    };

    players.push(newPlayer);
    localStorage.setItem('eftPlayers', JSON.stringify(players));
    
    // Sasisha maonyesho yote ya kiwingu papo hapo
    renderPlayerLists();
    renderStandings(); 

    // Ujumbe kulingana na hadhi ya usajili
    if (newPlayer.status === 'Verified') {
        msgDiv.innerHTML = `🟢 Hongera ${name}! [🔑 BYPASS PREMIUM] Umesajiliwa moja kwa moja kwenye ${assignedLeague}!`;
        msgDiv.style.color = "#10b981";
    } else {
        msgDiv.innerHTML = `🟡 Hongera ${name}! Ombi lako la kujiunga na ${assignedLeague} limepokelewa. Subiri Admin ahakiki malipo yako.`;
        msgDiv.style.color = "#f59e0b";
    }

    // Kusafisha fomu baada ya kukamilisha
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
    
    let html = `<table class='admin-table'><tr><th>Mchezaji</th><th>Simu</th><th>Ligi Iliyopangwa</th><th>Hali ya Usajili</th></tr>`;
    players.forEach(p => {
        const badgeClass = p.status === 'Verified' ? 'status-verified' : 'status-pending';
        const statusText = p.status === 'Verified' ? '🟢 VERIFIED' : '🟡 PENDING';
        html += `<tr>
            <td><strong>${p.name}</strong></td>
            <td>${p.phone}</td>
            <td><span style='color: #3b82f6; font-weight:600;'>${p.league}</span></td>
            <td><span class='status-badge ${badgeClass}'>${statusText}</span></td>
        </tr>`;
    });
    listDiv.innerHTML = html + "</table>";
}

// ====== 5. MTAMBO WA KUINGIZA MATOKEO & AUTOMATION YA REDIRECT ======
function updateMatchSelectDropdown() {
    const select = document.getElementById('match-select');
    if (!select) return;
    
    // Chukua mechi ambazo bado hazijachezwa tu (score === null)
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

function handleMatchSelectChange() {
    const select = document.getElementById('match-select');
    if (!select) return;
    
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
    
    if (!matchId) { 
        alert("⚠️ Tafadhali chagua mechi kwanza kabla ya kutuma matokeo!"); 
        return; 
    }

    // Hifadhi matokeo kwenye mechi husika
    fixtures = fixtures.map(f => {
        if (f.matchId === matchId) {
            f.score = { home: homeScore, away: awayScore };
        }
        return f;
    });
    localStorage.setItem('eftFixtures', JSON.stringify(fixtures));

    // Re-render mifumo yote inayotegemea matokeo hayo papo hapo
    updateMatchSelectDropdown();
    renderLiveScores();
    renderStandings(); 
    renderFixturesList();

    // Safisha fomu ya matokeo baada ya kutuma
    document.getElementById('results-form').reset();
    document.getElementById('home-label').innerHTML = "Magoli ya Home:";
    document.getElementById('away-label').innerHTML = "Magoli ya Away:";

    // UX Alert ya mafanikio
    alert("✅ MATOKEO YAMETUMWA KIKAMILIFU!\n\nMsimamo na ubao wa matokeo vimesasishwa kiotomatiki.");
    
    // MTAMBO WA TELEPORT: Mpeleke mtumiaji moja kwa moja kwenye ukurasa wa Matokeo (Live Scores)
    showPage('live-scores');
}

// ====== 6. CHUJIO LA MATOKEO (DYNAMIC FILTERING SYSTEM) ======
function renderLiveScores() {
    const container = document.getElementById('live-scores-container');
    const filterDropdown = document.getElementById('score-filter');
    if (!container) return;

    const filterValue = filterDropdown ? filterDropdown.value : 'all';
    
    // Chuja mechi zilizochezwa pekee zenye magoli
    let playedMatches = fixtures.filter(f => f.score !== null);
    
    // Chukua kulingana na kundi au ligi kama sio 'all'
    if (filterValue !== 'all') {
        playedMatches = playedMatches.filter(m => m.league === filterValue);
    }

    if (playedMatches.length === 0) {
        container.innerHTML = `<p style='color: #f59e0b; padding: 15px; background: #1f2937; border-radius: 8px; text-align: center; border: 1px solid var(--bg-tertiary);'>Hakuna matokeo yaliyopatikana kwa chaguo la <strong>${filterValue}</strong> kwa sasa.</p>`;
        return;
    }

    let html = "<div style='display:grid; gap:12px;'>";
    playedMatches.forEach(m => {
        html += `<div style='background-color:#1f2937; padding:15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; border-left: 4px solid #10b981; box-shadow: 0 4px 6px rgba(0,0,0,0.3);'>
            <div style='font-size:12px; color:#9ca3af;'>${m.league}<br><span style="background:#10b981; color:white; padding:2px 6px; border-radius:3px; font-weight:bold; display:inline-block; margin-top:4px;">FT</span></div>
            <div style='flex:1; text-align:right; font-weight:bold; padding-right:15px; font-size:15px; color:white;'>${m.home}</div>
            <div style='background-color:#111827; border: 1px solid #374151; padding:6px 16px; border-radius:4px; font-weight:bold; color:#10b981; font-size:18px; min-width:70px; text-align:center;'>
                ${m.score.home} - ${m.score.away}</div>
            <div style='flex:1; text-align:left; font-weight:bold; padding-left:15px; font-size:15px; color:white;'>${m.away}</div>
        </div>`;
    });
    container.innerHTML = html + "</div>";
}

// ====== 7. ALGORITHM YA HESABU ZA MSIMAMO WA LIGI (STANDINGS ENGINE) ======
function renderStandings() {
    const container = document.getElementById('standings-container');
    if (!container) return;
    
    // Wachezaji walioidhinishwa tu (Verified) ndio wanaoingia kwenye msimamo
    const verifiedPlayers = players.filter(p => p.status === 'Verified');
    
    if (verifiedPlayers.length === 0) {
        container.innerHTML = "<p style='color: #9ca3af;'>Msimamo utatengenezwa pindi wachezaji watakapothibitishwa na kuanza kucheza.</p>";
        return;
    }

    let finalHtml = "";
    
    // Piga mahesabu kwa kila Ligi kivyake kwa ufanisi wa hali ya juu
    ['League 1', 'League 2'].forEach(lg => {
        const lgPlayers = verifiedPlayers.filter(p => p.league === lg);
        if (lgPlayers.length === 0) return;

        // Kuanzisha jedwali tupu la hesabu kwa kila mchezaji wa ligi hii
        let tableData = {};
        lgPlayers.forEach(p => {
            tableData[p.name] = { name: p.name, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
        });

        // Kusoma mechi zote zilizochezwa kwenye ligi hii na kupandisha hesabu
        const lgMatches = fixtures.filter(f => f.league === lg && f.score !== null);
        lgMatches.forEach(m => {
            if (tableData[m.home] && tableData[m.away]) {
                // Ongeza idadi ya mechi zilizochezwa (Played)
                tableData[m.home].pld += 1; 
                tableData[m.away].pld += 1;
                
                // Magoli ya kufunga (Goals For) na kufungwa (Goals Against)
                tableData[m.home].gf += m.score.home; 
                tableData[m.home].ga += m.score.away;
                tableData[m.away].gf += m.score.away; 
                tableData[m.away].ga += m.score.home;
                
                // Tofauti ya Magoli (Goal Difference)
                tableData[m.home].gd = tableData[m.home].gf - tableData[m.home].ga;
                tableData[m.away].gd = tableData[m.away].gf - tableData[m.away].ga;

                // Ugawaji wa Pointi (W=3, D=1, L=0)
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

        // Panga safu za msimamo (Sort) kwa kigezo cha Pointi kwanza, kisha Goal Difference
        let sortedData = Object.values(tableData).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            return b.gd - a.gd;
        });

        // Muundo wa muonekano wa jedwali la msimamo
        finalHtml += `<h3 style='color: #10b981; margin-top:25px; border-left: 4px solid #10b981; padding-left:10px; margin-bottom:10px;'>📊 Jedwali la Msimamo - ${lg}</h3>
        <div class="card" style="overflow-x: auto; padding:0; border-radius:8px;">
            <table style="width: 100%; min-width: 600px; border-collapse: collapse; text-align: center; color: white;">
                <tr style="background-color: #374151; border-bottom: 2px solid #1f2937;">
                    <th style="padding: 12px; text-align: left; width: 200px;">Timu / Mchezaji</th>
                    <th>Pld</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th style="color: #10b981;">Pts</th>
                </tr>`;
                
        sortedData.forEach((row, idx) => {
            const gdStyle = row.gd > 0 ? 'color: #10b981;' : (row.gd < 0 ? 'color: #ef4444;' : 'color: white;');
            const gdSign = row.gd > 0 ? '+' : '';
            finalHtml += `<tr style="border-bottom: 1px solid #374151; background-color: ${idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'};">
                <td style="padding: 12px; text-align: left;"><strong>${idx + 1}. ${row.name}</strong></td>
                <td>${row.pld}</td>
                <td>${row.w}</td>
                <td>${row.d}</td>
                <td>${row.l}</td>
                <td>${row.gf}</td>
                <td>${row.ga}</td>
                <td style="${gdStyle} font-weight:bold;">${gdSign}${row.gd}</td>
                <td style="color: #10b981; font-weight: bold; font-size:16px;">${row.pts}</td>
            </tr>`;
        });
        finalHtml += `</table></div>`;
    });
    
    container.innerHTML = finalHtml;
}

function renderFixturesList() {
    const container = document.getElementById('fixtures-list');
    if (!container) return;
    
    if (fixtures.length === 0) {
        container.innerHTML = "<p style='color: #9ca3af;'>Bado hakuna ratiba yoyote iliyotengenezwa kwenye mfumo.</p>";
        return;
    }
    
    let html = "";
    ['League 1', 'League 2'].forEach(lg => {
        const lgMatches = fixtures.filter(f => f.league === lg);
        if (lgMatches.length > 0) {
            html += `<h3 style='color: #3b82f6; margin-top:20px; margin-bottom:10px; font-size:16px;'>🗓️ ${lg} - Orodha ya Mechi</h3><div style='display:grid; gap:10px; margin-bottom:15px;'>`;
            lgMatches.forEach(m => {
                const statusStr = m.score !== null ? 
                    `<span style="color:#10b981; font-weight:bold; font-size:14px;">${m.score.home} - ${m.score.away} (FT)</span>` : 
                    "<span style='color:#6b7280; font-size:13px;'>Bado kuchezwa</span>";
                html += `<div style='background-color:#1f2937; padding:12px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; border: 1px solid #2d3748;'>
                    <span style='flex:1; text-align:right; font-weight:bold; color:white;'>${m.home}</span>
                    <span style='background-color:#111827; border: 1px solid #374151; padding:4px 14px; border-radius:4px; margin: 0 15px; min-width:110px; text-align:center;'>${statusStr}</span>
                    <span style='flex:1; text-align:left; font-weight:bold; color:white;'>${m.away}</span>
                </div>`;
            });
            html += `</div>`;
        }
    });
    container.innerHTML = html;
}

// ====== 8. ADMIN INTERFACE FUNCTIONS (KUDHIBITI MSIMU) ======
function loginAdmin() {
    const inputPass = document.getElementById('admin-login-pass').value;
    const currentAdminPass = localStorage.getItem('eftAdminPassword') || "tinka2026";
    
    if (inputPass === currentAdminPass) {
        document.getElementById('admin-login-area').style.display = 'none';
        document.getElementById('admin-dashboard-area').style.display = 'block';
    } else {
        alert("❌ Nenosiri la ulinzi si sahihi! Jaribu tena.");
    }
}

function togglePasswordReset() {
    const area = document.getElementById('password-reset-area');
    if (area) {
        area.style.display = (area.style.display === 'none') ? 'block' : 'none';
    }
}

function changeAdminPassword() {
    const secretWord = document.getElementById('secret-senior-word').value.trim();
    const newPass = document.getElementById('new-admin-pass').value.trim();
    const msg = document.getElementById('admin-reset-msg');
    
    if (secretWord.toLowerCase() === "senior") {
        if (newPass.length >= 4) {
            localStorage.setItem('eftAdminPassword', newPass);
            if (msg) msg.innerHTML = "✅ Nenosiri jipya limehifadhiwa kikamilifu!";
            document.getElementById('secret-senior-word').value = "";
            document.getElementById('new-admin-pass').value = "";
            setTimeout(() => { togglePasswordReset(); if(msg) msg.innerHTML = ""; }, 2000);
        } else {
            alert("❌ Paswedi mpya lazima iwe na herufi au namba kuanzia 4!");
        }
    } else {
        alert("❌ Neno la siri la Mkuu (Senior Word) sio sahihi!");
    }
}

function adminVerifyPayments() {
    const zone = document.getElementById('admin-dynamic-content');
    const pendingPlayers = players.filter(p => p.status === 'Pending');
    
    if (pendingPlayers.length === 0) {
        zone.innerHTML = "<h4 style='color: #10b981; text-align:center; padding:15px;'>🎉 Hakuna maombi mapya yanayosubiri uhakiki!</h4>";
        return;
    }
    
    let html = `<h4 style='margin-bottom:10px; color:var(--warning);'>📋 Maombi Yanayosubiri (${pendingPlayers.length})</h4>
    <table class='admin-table'><tr><th>Mchezaji</th><th>Simu</th><th>Kitendo</th></tr>`;
    
    pendingPlayers.forEach(p => {
        html += `<tr>
            <td><strong>${p.name}</strong> (${p.league})</td>
            <td>${p.phone}</td>
            <td><button onclick="clickVerifyPlayer('${p.id}')" class='mini-btn' style='background-color:#10b981; color:white;'>Verify ✅</button></td>
        </tr>`;
    });
    zone.innerHTML = html + "</table>";
}

function clickVerifyPlayer(id) {
    players = players.map(p => { 
        if (p.id === id) p.status = 'Verified'; 
        return p; 
    });
    localStorage.setItem('eftPlayers', JSON.stringify(players));
    
    // Sasisha skrini zote papo hapo
    renderPlayerLists(); 
    adminVerifyPayments(); 
    renderStandings(); 
    updateMatchSelectDropdown();
}

function adminOpenFixtureControl() {
    const zone = document.getElementById('admin-dynamic-content');
    const verifiedPlayers = players.filter(p => p.status === 'Verified');
    
    if (verifiedPlayers.length < 2) {
        zone.innerHTML = `<h4 style='color: #ef4444; text-align:center; padding:15px;'>⚠️ Mfumo unahitaji angalau wachezaji 2 waliothibitishwa (Verified) ili kutengeneza ratiba. Kwa sasa wapo: ${verifiedPlayers.length}</h4>`;
        return;
    }
    
    const l1 = verifiedPlayers.filter(p => p.league === 'League 1');
    const l2 = verifiedPlayers.filter(p => p.league === 'League 2');
    
    let html = `<h4 style='margin-bottom:10px;'>🗓️ Mtambo wa Kupanga Mechi za Msimu (Round Robin)</h4>
    <p style='font-size:13px; color:#9ca3af; margin-bottom:15px;'>Zingatia: Ukibonyeza kitufe, ratiba ya zamani ya ligi hiyo itafutwa na kutengenezwa upya kulingana na wachezaji waliopo sasa hivi.</p>
    <div style='display:flex; gap:15px; flex-wrap:wrap;'>`;
    
    if (l1.length >= 2) {
        html += `<button onclick="generateLeagueFixtures('League 1')" class='submit-btn' style='background-color:#10b981; margin:0; width:auto; padding:10px 20px;'>Tengeneza Ratiba ya League 1 (${l1.length} Players)</button>`;
    } else {
        html += `<p style='color:#ef4444; font-size:12px;'>League 1 haina wachezaji wa kutosha bado.</p>`;
    }
    
    if (l2.length >= 2) {
        html += `<button onclick="generateLeagueFixtures('League 2')" class='submit-btn' style='background-color:#3b82f6; margin:0; width:auto; padding:10px 20px;'>Tengeneza Ratiba ya League 2 (${l2.length} Players)</button>`;
    }
    
    zone.innerHTML = html + `</div>`;
}

function generateLeagueFixtures(leagueName) {
    const pool = players.filter(p => p.status === 'Verified' && p.league === leagueName);
    
    // Safisha ratiba ya zamani ya ligi hii mahususi pekee ili isivuruge ligi nyingine
    fixtures = fixtures.filter(f => f.league !== leagueName);
    
    // Algorithm ya Round Robin (Kila mtu kucheza na kila mtu mechi moja)
    for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
            fixtures.push({
                matchId: 'MCH-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                league: leagueName,
                home: pool[i].name,
                away: pool[j].name,
                score: null // Mechi haina magoli bado
            });
        }
    }
    
    localStorage.setItem('eftFixtures', JSON.stringify(fixtures));
    
    // Sasisha ulimwengu wote wa data
    renderFixturesList(); 
    updateMatchSelectDropdown(); 
    renderLiveScores(); 
    renderStandings();
    
    alert(`🎯 MECHI ZIMEPANGWA!\n\nRatiba ya ${leagueName} imekamilika. Wachezaji wanaweza kuanza kucheza sasa hivi.`);
    adminOpenFixtureControl(); // Refresh view ya admin control
}

function adminClearAllData() {
    if (confirm("🚨 ONYO KALI!\n\nJe, una uhakika unataka KUFUTA LIGI YOTE ianze upya? Kitendo hiki kitafuta wachezaji wote, ratiba zote, na matokeo yote kwenye kifaa hiki na hakirudishiki!")) {
        localStorage.removeItem('eftPlayers');
        localStorage.removeItem('eftFixtures');
        players = []; 
        fixtures = [];
        
        // Safisha kurasa zote za mbele
        renderPlayerLists(); 
        renderFixturesList(); 
        updateMatchSelectDropdown(); 
        renderLiveScores(); 
        renderStandings();
        
        document.getElementById('admin-dynamic-content').innerHTML = "<p style='color:#10b981; text-align:center; padding:15px;'>Mfumo mzima umesafishwa kikamilifu! Kila kitu kiko safi kuanza msimu mpya.</p>";
        alert("Mfumo umerudishwa sifuri (Reset Successful)!");
    }
}

// ====== 9. PROGRESSIVE WEB APP (PWA) DISPATCHER ENGINE ======
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e;
    const installBanner = document.getElementById('install-container');
    if (installBanner) {
        installBanner.style.display = 'block';
    }
});

const installBtn = document.getElementById('install-btn');
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            const installBanner = document.getElementById('install-container');
            if (installBanner) {
                installBanner.style.display = 'none';
            }
            deferredPrompt = null;
        }
    });
}
