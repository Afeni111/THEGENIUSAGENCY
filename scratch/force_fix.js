const { createClient } = require('@supabase/supabase-js');
const SB_URL = 'https://tjxyxasorunhrtvstwpa.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeHl4YXNvcnVuaHJ0dnN0d3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA3NTc1NCwiZXhwIjoyMDkyNjUxNzU0fQ.e8QO80wgYuglMJ5ariqu6xaFVEzWUY2MHWGtJoRM9-c';
const sb = createClient(SB_URL, SB_KEY);

async function force() {
    const { data, error } = await sb.from('conversations').update({ status: 'new_lead' }).eq('status', 'active');
    console.log('Update Error:', error);
    console.log('Update Data:', data);
}
force();
