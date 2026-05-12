require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createAdmin() {
    console.log("Creating Admin Account...");
    
    // Create the Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@thegeniusagency.com',
        password: 'AdminPassword123!',
        email_confirm: true,
        user_metadata: { name: 'Agency Admin' }
    });

    if (authError) {
        console.error("Error creating auth user:", authError.message);
        return;
    }

    const userId = authData.user.id;
    console.log("Auth user created with ID:", userId);

    // Insert into the public.users table as admin
    const { error: dbError } = await supabase.from('users').insert([{
        id: userId,
        email: 'admin@thegeniusagency.com',
        name: 'Agency Admin',
        role: 'admin'
    }]);

    if (dbError) {
        console.error("Error inserting into public.users:", dbError.message);
    } else {
        console.log("Successfully created Admin account!");
        console.log("-----------------------------------------");
        console.log("Email: admin@thegeniusagency.com");
        console.log("Password: AdminPassword123!");
        console.log("-----------------------------------------");
    }
}

createAdmin();
