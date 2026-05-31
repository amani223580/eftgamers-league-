// ====== 1. MFUMO WA KU-DOWNLOAD APP (PWA INSTALL) ======
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Zuia Chrome isilete kimulimuli chake kiotomatiki
    e.preventDefault();
    deferredPrompt = e;
    // Onyesha kitufe chetu na Icon tuliyotengeneza kwenye HTML
    document.getElementById('install-container').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', async () => {
    if (deferredPrompt !== null) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('Mtumiaji amekubali ku-install EftGamers');
            document.getElementById('install-container').style.display = 'none';
        }
        deferredPrompt = null;
    }
});


// ====== 2. MFUMO WA KUBADILI PASSWORD YA ADMIN ("senior") ======
function togglePasswordReset() {
    const area = document.getElementById('password-reset-area');
    area.style.display = area.style.display === 'none' ? 'block' : 'none';
}

function changeAdminPassword() {
    const secretWord = document.getElementById('secret-senior-word').value;
    const newPass = document.getElementById('new-admin-pass').value;
    const msg = document.getElementById('admin-reset-msg');

    if (secretWord.toLowerCase() === "senior") {
        if (newPass.length >= 4) {
            // Hifadhi password mpya kwenye simu/browser (Local Storage)
            localStorage.setItem('eftAdminPassword', newPass);
            msg.innerHTML = "✅ Password imebadilishwa kikamilifu!";
            msg.style.color = "#10b981";
            document.getElementById('secret-senior-word').value = "";
            document.getElementById('new-admin-pass').value = "";
        } else {
            msg.innerHTML = "⚠️ Password mpya lazima iwe na herufi/tarakimu 4 au zaidi.";
            msg.style.color = "#f59e0b";
        }
    } else {
        msg.innerHTML = "❌ Neno la siri la mfumo si sahihi!";
        msg.style.color = "#ef4444";
    }
}

// Function ya Login inayoangalia Password Mpya au ya Zamani
function loginAdmin() {
    const inputPass = document.getElementById('admin-login-pass').value;
    // Angalia kama alishawahi kubadili, kama hajabadili tumia 'tinka2026'
    const currentAdminPass = localStorage.getItem('eftAdminPassword') || "tinka2026";

    if (inputPass === currentAdminPass) {
        alert("Karibu Msimamizi Mkuu!");
        // Hapa utafungua menu za admin za ndani baadae
    } else {
        alert("Nenosiri si sahihi!");
    }
}
