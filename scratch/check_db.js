const { createClient } = require('@supabase/supabase-js');
const SB_URL = 'https://tjxyxasorunhrtvstwpa.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeHl4YXNvcnVuaHJ0dnN0d3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA3NTc1NCwiZXhwIjoyMDkyNjUxNzU0fQ.e8QO80wgYuglMJ5ariqu6xaFVEzWUY2MHWGtJoRM9-c';
const sb = createClient(SB_URL, SB_KEY);

async function check() {
    const { data: convos } = await sb.from('conversations').select('*');
    console.log(JSON.stringify(convos, null, 2));
}
check();
