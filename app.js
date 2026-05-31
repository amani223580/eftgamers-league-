// ====== KANZIDATA YA NDANI (STATE MANAGEMENT) ======
let players = JSON.parse(localStorage.getItem('eftPlayers')) || [];
let fixtures = JSON.parse(localStorage.getItem('eftFixtures')) || [];

// Kupakia data mara ya kwanza kabisa app ikifunguka
document.addEventListener("DOMContentLoaded", () => {
    renderPlayerLists();
    renderFixturesList();
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

// ====== 3. MTAMBO WA USAJILI + AUTO LEAGUE OVERFLOW ======
function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const bypassKey = document.getElementById('secret-bypass-key') ? document.getElementById('secret-bypass-key').value.trim() : '';
    const msgDiv = document.getElementById('reg-message');

    // Angalia jina kama tayari lipo
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        msgDiv.innerHTML = "❌ Jina hili lishajisajili kwenye mfumo!";
        msgDiv.style.color = "#ef4444";
        return;
    }

    // MAPANGO YA LIGI YA KIOTOMATIKI (Max 16 kwa kila Ligi)
    const league1Count = players.filter(p => p.league === 'League 1').length;
    const assignedLeague = league1Count < 16 ? 'League 1' : 'League 2';

    // Tengeneza profile mpya ya mchezaji
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
    
    // Sasisha kurasa zote papo hapo (Live Update)
    renderPlayerLists();
    if (document.getElementById('admin-dashboard-area').style.display === 'block') {
        adminVerifyPayments(); 
    }

    // Ujumbe wa mafanikio
    if (newPlayer.status === 'Verified') {
        msgDiv.innerHTML = `🟢 Hongera ${name}! [🔑 PREMIUM BYPASS] Umesajiliwa na Kudhinishwa kiotomatiki kwenye ${assignedLeague}!`;
        msgDiv.style.color = "#10b981";
    } else {
        msgDiv.innerHTML = `🟡 Hongera ${name}! Umesajiliwa kwenye ${assignedLeague}. Subiri Admin ahakiki malipo yako ili uingizwe kwenye ratiba.`;
        msgDiv.style.color = "#f59e0b";
    }

    document.getElementById('reg-form').reset();
    if (document.getElementById('secret-input-container')) document.getElementById('secret-input-container').style.display = 'none';
}

// ====== 4. RENDERING YA LIVE ROSTER YA WACHEZAJI (PUBLIC VIEW) ======
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

// ====== 5. INTERACTIVE ADMIN HUB FUNCTIONALITIES ======

// A. Kitufe cha Hakiki Malipo (Inaleta list na kitufe cha Verify kwa kila mmoja)
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

// Amri inayotekelezwa admin akibonyeza "Verify ✅" mbele ya mchezaji
function clickVerifyPlayer(id) {
    players = players.map(p => {
        if (p.id === id) p.status = 'Verified';
        return p;
    });
    localStorage.setItem('eftPlayers', JSON.stringify(players));
    
    // Live refresh ya views zote zote mbili hapo hapo!
    renderPlayerLists();
    adminVerifyPayments();
}

// B. Kitufe cha Kuandaa na Kuanzisha Ratiba (Soma Verified Tu kuanzia wawili)
function adminOpenFixtureControl() {
    const zone = document.getElementById('admin-dynamic-content');
    const verifiedPlayers = players.filter(p => p.status === 'Verified');

    if (verifiedPlayers.length < 2) {
        zone.innerHTML = `<h4 style='color: #ef4444; text-align:center;'>⚠️ Ligi haiwezi kuanza! Inahitajika angalau wachezaji wawili (2) waliothibitishwa (VERIFIED). <br> Hivi sasa wapo: ${verifiedPlayers.length} tu.</h4>`;
        return;
    }

    // Panga wachezaji kwa ligi zao
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

// Algorithm ya kuzalisha Mechi za mzunguko (Round Robin Generator)
function generateLeagueFixtures(leagueName) {
    const pool = players.filter(p => p.status === 'Verified' && p.league === leagueName);
    
    // Futa ratiba ya zamani ya ligi hii tu kama ipo
    fixtures = fixtures.filter(f => f.league !== leagueName);

    // Kizalisha Mechi (Round Robin algorithm)
    for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
            fixtures.push({
                matchId: 'MCH-' + Math.random().toString(36).substr(2, 9),
                league: leagueName,
                home: pool[i].name,
                away: pool[j].name,
                score: null // Bado haijachezwa
            });
        }
    }

    localStorage.setItem('eftFixtures', JSON.stringify(fixtures));
    renderFixturesList();
    alert(`🎯 Hongera! Mechi za ${leagueName} zimepangwa kiotomatiki na kutupwa ratibani!`);
    adminOpenFixtureControl();
}

// C. Kushusha orodha ya Mechi kule kwenye "Ratiba Kamili"
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
            html += `<h3 style='color: #3b82f6; margin-top:20px; border-bottom: 1px solid #374151; padding-bottom:5px;'>🗓️ ${lg} - Mechi Rasmi</h3>
            <div style='display:grid; gap:10px; margin-top:10px;'>`;
            
            lgMatches.forEach(m => {
                html += `<div style='background-color:#1f2937; padding:12px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;'>
                    <span style='flex:1; text-align:right; font-weight:bold;'>${m.home}</span>
                    <span style='background-color:#374151; padding:4px 12px; border-radius:4px; margin: 0 15px; font-size:12px; color:#10b981;'>VS</span>
                    <span style='flex:1; text-align:left; font-weight:bold;'>${m.away}</span>
                </div>`;
            });
            html += `</div>`;
        }
    });

    container.innerHTML = html;
}

// D. Reset System (Kusafisha Data kwa Msimu Mpya)
function adminClearAllData() {
    if (confirm("🚨 Je, una uhakika unataka kufuta wachezaji na ratiba zote kuanza upya?")) {
        localStorage.clear();
        players = [];
        fixtures = [];
        renderPlayerLists();
        renderFixturesList();
        document.getElementById('admin-dynamic-content').innerHTML = "<p style='color:#10b981; text-align:center;'>Mfumo umesafishwa kabisa!</p>";
    }
}

// ====== 6. ADMIN SYSTEM ACCESS AUTH ======
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
    if (area) area.style.display = area.style.display === 'none' ? 'block' : 'none';
}

function changeAdminPassword() {
    const secretWord = document.getElementById('secret-senior-word').value.trim();
    const newPass = document.getElementById('new-admin-pass').value.trim();
    const msg = document.getElementById('admin-reset-msg');

    if (secretWord.toLowerCase() === "senior") {
        if (newPass.length >= 4) {
            localStorage.setItem('eftAdminPassword', newPass);
            msg.innerHTML = "✅ Nenosiri la Admin limebadilishwa!";
            msg.style.color = "#10b981";
        } else {
            msg.innerHTML = "⚠️ Nenosiri liwe refu kidogo.";
            msg.style.color = "#f59e0b";
        }
    } else {
        msg.innerHTML = "❌ Neno la siri si sahihi!";
        msg.style.color = "#ef4444";
    }
            }
