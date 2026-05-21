require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- Checking Profiles ---');
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, email, role, full_name');
    if (pErr) console.error('Profiles Error:', pErr);
    else console.table(profiles);

    console.log('\n--- Checking Experts ---');
    const { data: experts, error: eErr } = await supabase.from('experts').select('id, name, profile_id');
    if (eErr) console.error('Experts Error:', eErr);
    else console.table(experts);

    console.log('\n--- Checking Conversations ---');
    const { data: convos, error: cErr } = await supabase.from('conversations').select('id, client_id, expert_id, status').limit(5);
    if (cErr) console.error('Convos Error:', cErr);
    else console.table(convos);
}

checkData();
