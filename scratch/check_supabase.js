const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const URL = 'https://tjxyxasorunhrtvstwpa.supabase.co';
const KEY_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeHl4YXNvcnVuaHJ0dnN0d3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzU3NTQsImV4cCI6MjA5MjY1MTc1NH0.YEZPhnJmFAk4IDxd-6LlhKAZfGTkODfGr1FJteA99vo';
const KEY_PUB = 'sb_publishable_d3YtyYkTynAVyTEVIN19dQ_-4wZkGHV';

async function check(name, key) {
    console.log(`Checking key: ${name}...`);
    const supabase = createClient(URL, key);
    try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (error) {
            console.error(`  [${name}] Error:`, error.message);
        } else {
            console.log(`  [${name}] Success! Profiles count:`, data);
        }
    } catch (e) {
        console.error(`  [${name}] Exception:`, e.message);
    }
}

async function run() {
    await check('JWT (from login.js)', KEY_JWT);
    await check('PUB (from .env)', KEY_PUB);
}

run();
