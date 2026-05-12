const { createClient } = require('@supabase/supabase-js');
const SB_URL = 'https://tjxyxasorunhrtvstwpa.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeHl4YXNvcnVuaHJ0dnN0d3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA3NTc1NCwiZXhwIjoyMDkyNjUxNzU0fQ.e8QO80wgYuglMJ5ariqu6xaFVEzWUY2MHWGtJoRM9-c';
const sb = createClient(SB_URL, SB_KEY);

async function fix() {
    // We only want to update the records that are 'active' but have no real project budget/data
    const { data: convos } = await sb.from('conversations').select('*').eq('status', 'active');
    for (const c of convos) {
        if (!c.projects || !c.projects.budget || c.projects.title === 'New Project') {
            console.log('Fixing conversation:', c.id);
            await sb.from('conversations').update({ status: 'new_lead' }).eq('id', c.id);
        }
    }
    console.log('Done!');
}
fix();
