const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('--- Applying Project Deadline Patch ---');
    
    const queries = [
        // 1. Change deadline column to TIMESTAMPTZ for precision
        `ALTER TABLE projects ALTER COLUMN deadline TYPE TIMESTAMPTZ USING deadline::TIMESTAMPTZ;`,
        
        // 2. Add deadline_notified column to prevent duplicate emails
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline_notified BOOLEAN DEFAULT false;`
    ];

    for (const sql of queries) {
        console.log(`Executing: ${sql}`);
        const { error } = await sb.rpc('exec_sql', { sql_query: sql });
        if (error) {
            console.error('Error executing query:', error);
            // Fallback: If exec_sql is not available, we might need to ask the user to run it
        } else {
            console.log('Success.');
        }
    }
}

// Note: This script assumes 'exec_sql' RPC is available. 
// If not, I will provide the SQL to the user.
run();
