// 1. Mfumo wa Kubadili Kurasa (Menu Routing)
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
    document.getElementById(pageId).classList.add('active-page');
    
    // Weka muonekano wa active kwenye button iliyobonyezwa
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => btn.getAttribute('onclick').includes(pageId));
    if (activeBtn) activeBtn.classList.add('active');
}

// 2. Kuchuja muonekano wa fomu ya malipo
function togglePaymentFields() {
    const method = document.getElementById('pay-method').value;
    const txField = document.getElementById('transaction-field');
    if (method === 'manual') {
        txField.style.display = 'block';
    } else {
        txField.style.display = 'none';
    }
}

// 3. MTAMBO WA SIRI (Easter Egg Engine)
let secretClicks = 0;
function triggerSecretEngine() {
    secretClicks++;
    if (secretClicks >= 3) {
        document.getElementById('secret-input-container').style.display = 'block';
        alert("🚨 Mtambo wa siri wa Eft-V13 umewashwa! Ingiza neno la siri kwenye kisanduku chini.");
        secretClicks = 0; // reresh counter
    }
}

// 4. Kushughulikia Usajili (Ule wa Kawaida na wa Siri)
async function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;
    const method = document.getElementById('pay-method').value;
    const transactionId = document.getElementById('reg-payid').value;
    const bypassKey = document.getElementById('secret-bypass-key').value;
    const msgDiv = document.getElementById('reg-message');

    msgDiv.innerHTML = "Inatuma maombi...";
    msgDiv.style.color = "#3b82f6";

    let payload = {
        name: name,
        phone: phone,
        payment_method: method,
        transaction_id: transactionId,
        is_premium_bypass: false
    };

    // Angalia kama mtumiaji amegundua na kuandika neno la siri "premium"
    if (bypassKey.trim().toLowerCase() === "premium") {
        payload.is_premium_bypass = true;
        payload.transaction_id = "BYPASS-PREMIUM-USER";
    }

    try {
        // Hapa tutaitofautisha na kuipandisha Vercel API baadae
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
        } else {
            msgDiv.innerHTML = `🔴 Kosa: ${result.message}`;
            msgDiv.style.color = "#ef4444";
        }
    } catch (error) {
        // Kwa sasa hivi itafeli kwa sababu hatujaweka Vercel API, hii ni kawaida
        msgDiv.innerHTML = "🔴 Mfumo unajiandaa kuunganishwa na seva kuu ya Vercel...";
        msgDiv.style.color = "#f59e0b";
    }
}

// Jisajili kwa ajili ya PWA Service Worker (Ili iweze kudownloadika Chrome)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
    });
      }
