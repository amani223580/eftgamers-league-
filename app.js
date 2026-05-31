// ====== 1. MFUMO WA KUBADILI KURASA (MENU ROUTING) + AUTO SCROLL ======
function showPage(pageId) {
    // Ondoa active class kwenye kurasa zote
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active-page');
    });
    // Ondoa active class kwenye buttons zote za menu
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Washa ukurasa husika
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.add('active-page'); // Inatakiwa classList.add, imerekebishwa chini
        targetPage.classList.add('active-page');
    }
    
    // Weka muonekano wa active kwenye button iliyobonyezwa
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => btn.getAttribute('onclick').includes(pageId));
    if (activeBtn) activeBtn.classList.add('active');

    // Mbinu ya Polymath: Kama yuko kwenye simu, ishushie app kiotomatiki hadi kwenye content
    if (window.innerWidth <= 768) {
        document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
    }
}

// ====== 2. KUCHUJA FOMU YA MALIPO ======
function togglePaymentFields() {
    const method = document.getElementById('pay-method').value;
    const txField = document.getElementById('transaction-field');
    if (method === 'manual') {
        txField.style.display = 'block';
    } else {
        txField.style.display = 'none';
    }
}

// ====== 3. MTAMBO WA SIRI WA PREMIUM (Easter Egg) ======
let secretClicks = 0;
function triggerSecretEngine() {
    secretClicks++;
    if (secretClicks >= 3) {
        document.getElementById('secret-input-container').style.display = 'block';
        alert("🚨 Mtambo wa siri wa Eft-V13 umewashwa! Ingiza neno la siri kwenye kisanduku chini.");
        secretClicks = 0;
    }
}

// ====== 4. USHAHIDI WA USAJILI (Kutuma Vercel API) ======
async function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const method = document.getElementById('pay-method').value;
    const transactionId = document.getElementById('reg-payid').value.trim();
    const bypassKey = document.getElementById('secret-bypass-key').value.trim();
    const msgDiv = document.getElementById('reg-message');

    msgDiv.innerHTML = "Inatuma maombi ya usajili...";
    msgDiv.style.color = "#3b82f6";

    let payload = {
        name: name,
        phone: phone,
        payment_method: method,
        transaction_id: transactionId,
        is_premium_bypass: false
    };

    if (bypassKey.toLowerCase() === "premium") {
        payload.is_premium_bypass = true;
        payload.transaction_id = "BYPASS-PREMIUM-USER";
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            msgDiv.innerHTML = `🟢 Hongera ${name}! ${result.message}`;
            msgDiv.style.color = "#10b981";
            document.getElementById('reg-form').reset();
            document.getElementById('secret-input-container').style.display = 'none';
        } else {
            msgDiv.innerHTML = `🔴 Kosa: ${result.message}`;
            msgDiv.style.color = "#ef4444";
        }
    } catch (error) {
        msgDiv.innerHTML = "🔴 Hitilafu imetokea wakati wa kuwasiliana na seva.";
        msgDiv.style.color = "#f59e0b";
    }
}

// ====== 5. UTARATIBU WA PWA & ICON DOWNLOAD ======
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-container').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            document.getElementById('install-container').style.display = 'none';
        }
        deferredPrompt = null;
    }
});

// ====== 6. USIMAMIZI WA PASSWORD YA ADMIN ("senior") ======
function togglePasswordReset() {
    const area = document.getElementById('password-reset-area');
    area.style.display = area.style.display === 'none' ? 'block' : 'none';
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
            document.getElementById('secret-senior-word').value = "";
            document.getElementById('new-admin-pass').value = "";
        } else {
            msg.innerHTML = "⚠️ Nenosiri jipya liwe na herufi/namba 4 au zaidi.";
            msg.style.color = "#f59e0b";
        }
    } else {
        msg.innerHTML = "❌ Neno la siri la mfumo ('senior') si sahihi!";
        msg.style.color = "#ef4444";
    }
}

function loginAdmin() {
    const inputPass = document.getElementById('admin-login-pass').value;
    const currentAdminPass = localStorage.getItem('eftAdminPassword') || "tinka2026";[span_0](start_span)[span_0](end_span)

    if (inputPass === currentAdminPass) {
        alert("🛡️ Karibu Kwenye Jopo la Usimamizi la Tinka Tech!");
        // Hapa panajifungua baada ya login sahihi
    } else {
        alert("❌ Nenosiri si sahihi!");
    }
                                 }
        
