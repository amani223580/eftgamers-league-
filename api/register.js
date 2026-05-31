import { createClient } from '@supabase/supabase-js';

// Vercel itachukua hizi funguo kwa siri bila watu kuona
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Njia hii hairuhusiwi (Method Not Allowed)' });
    }

    const { name, phone, payment_method, transaction_id, is_premium_bypass } = req.body;

    try {
        // 1. ANGALIA KAMA NI "PREMIUM" BYPASS (MTAMBO WA SIRI)
        if (is_premium_bypass === true && transaction_id === "BYPASS-PREMIUM-USER") {
            // Sajili moja kwa moja bila kuuliza AzamPay na weka status 'Verified'
            const { data, error } = await supabase
                .from('players')
                .insert([{ league_id: 1, name: name, phone: phone, payment_id: 'PREMIUM-BYPASS', status: 'Verified' }]);

            if (error) throw error;
            return res.status(200).json({ success: true, message: 'Umesajiliwa kikamilifu kupitia mfumo wa Eft-V13 Engine!' });
        }

        // 2. KAMA NI USAJILI WA KAWAIDA (AzamPay/Manual)
        // Hapa anasajiliwa kama 'Pending'. Mfumo wa AzamPay utaunganishwa hapa badae.
        const { data, error } = await supabase
            .from('players')
            .insert([{ league_id: 1, name: name, phone: phone, payment_id: transaction_id, status: 'Pending' }]);

        if (error) throw error;
        return res.status(200).json({ success: true, message: 'Taarifa zako zimepokelewa. Usajili unasubiri uhakiki wa malipo yako.' });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Hitilafu kwenye Database: ' + error.message });
    }
}
