// ====== 1. MFUMO WA KUBADILI KURASA (MENU ROUTING) + AUTO SCROLL ======
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active-page');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active-page');
    }
    
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        return onclickAttr && onclickAttr.includes(pageId);
    });
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    if (window.innerWidth <= 768) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// ====== 2. KUCHUJA FOMU YA MALIPO ======
function togglePaymentFields() {
    const method = document.getElementById('pay-method').value;
    const txField = document.getElementById('transaction-field');
    if (txField) {
        txField.style.display = (method === 'manual') ? 'block' : 'none';
    }
}

// ====== 3. MTAMBO WA SIRI WA PREMIUM ======
let secretClicks = 0;
function triggerSecretEngine() {
    secretClicks++;
    if (secretClicks >= 3) {
        const secretContainer = document.getElementById('secret-input-container');
        if (secretContainer) {
            secretContainer.style.display = 'block';
        }
        alert("🚨 Mtambo wa siri wa Eft-V13 umewashwa! Ingiza neno la siri.");
        secretClicks = 0;
    }
}

// ====== 4. USHAHIDI WA USAJILI ======
async function handleRegistration(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('reg-name');
    const phoneInput = document.getElementById('reg-phone');
    const methodInput = document.getElementById('pay-method');
    const txInput = document.getElementById('reg-payid');
    const bypassInput = document.getElementById('secret-bypass-key');
    const msgDiv = document.getElementById('reg-message');

    if (!nameInput || !phoneInput || !msgDiv) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const method = methodInput ? methodInput.value : 'azampay';
    const transactionId = txInput ? txInput.value.trim() : '';
    const bypassKey = bypassInput ? bypassInput.value.trim() : '';

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
            const regForm = document.getElementById('reg-form');
            if (regForm) regForm.reset();
            const secretContainer = document.getElementById('secret-input-container');
            if (secretContainer) secretContainer.style.display = 'none';
        } else {
            msgDiv.innerHTML = `🔴 Kosa: ${result.message}`;
            msgDiv.style.color = "#ef4444";
        }
    } catch (error) {
        msgDiv.innerHTML = "🔴 Hitilafu imetokea wakati wa kuwasiliana na seva.";
        msgDiv.style.color = "#f59e0b";
    }
}

// ====== 5. UTARATIBU WA PWA INSTALLATION ======
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installContainer = document.getElementById('install-container');
    if (installContainer) {
        installContainer.style.display = 'block';
    }
});

const installBtn = document.getElementById('install-btn');
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                const installContainer = document.getElementById('install-container');
                if (installContainer) installContainer.style.display = 'none';
            }
            deferredPrompt = null;
        }
    });
}

// ====== 6. USIMAMIZI WA PASSWORD YA ADMIN ======
function togglePasswordReset() {
    const area = document.getElementById('password-reset-area');
    if (area) {
        area.style.display = area.style.display === 'none' ? 'block' : 'none';
    }
}

function changeAdminPassword() {
    const secretWord = document.getElementById('secret-senior-word').value.trim();
    const newPass = document.getElementById('new-admin-pass').value.trim();
    const msg = document.getElementById('admin-reset-msg');

    if (!msg) return;

    if (secretWord.toLowerCase() === "senior") {
        if (newPass.length >= 4) {
            localStorage.setItem('eftAdminPassword', newPass);
            msg.innerHTML = "✅ Nenosiri la Admin limebadilishwa kikamilifu!";
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

// ====== 7. LOGIN NA KUFUNGUA JOPO LA ADMIN ======
function loginAdmin() {
    const inputPass = document.getElementById('admin-login-pass').value;
    const currentAdminPass = localStorage.getItem('eftAdminPassword') || "tinka2026";

    if (inputPass === currentAdminPass) {
        alert("🛡️ Karibu Kwenye Jopo la Usimamizi la Tinka Tech!");
        
        const loginArea = document.getElementById('admin-login-area');
        const dashboardArea = document.getElementById('admin-dashboard-area');
        
        if (loginArea && dashboardArea) {
            loginArea.style.display = 'none';
            dashboardArea.style.display = 'block';
        }
    } else {
        alert("❌ Nenosiri si sahihi!");
    }
        }
        
