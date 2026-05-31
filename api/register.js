import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

    const { name, phone, payment_method, transaction_id, is_premium_bypass } = req.body;

    try {
        // 1. ZUIA USAJILI WA MARA MBILI KWA JINA AU NAMBA (Anti-Duplicate System)
        const { data: existingUser } = await supabase
            .from('players')
            .select('id, name, phone')
            .or(`name.eq.${name},phone.eq.${phone}`)
            .single();

        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: `Kosa: Jina (${existingUser.name}) au Namba (${existingUser.phone}) imeshajisajili kwenye ligi hii!` 
            });
        }

        // 2. KAMA NI PREMIUM BYPASS
        if (is_premium_bypass === true && transaction_id === "BYPASS-PREMIUM-USER") {
            const { error } = await supabase.from('players').insert([{ league_id: 1, name, phone, payment_id: 'PREMIUM', status: 'Verified' }]);
            if (error) throw error;
            return res.status(200).json({ success: true, message: 'Umesajiliwa kikamilifu (Premium).' });
        }

        // 3. USAJILI WA KAWAIDA
        const { error } = await supabase.from('players').insert([{ league_id: 1, name, phone, payment_id: transaction_id, status: 'Pending' }]);
        if (error) throw error;
        
        return res.status(200).json({ success: true, message: 'Usajili umepokelewa. Tunasubiri uhakiki wa malipo yako.' });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Hitilafu: ' + error.message });
    }
}
