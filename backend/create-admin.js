import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from your .env file.");
  process.exit(1);
}

// Initialize Supabase with the SERVICE ROLE KEY to bypass RLS and Auth rules
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  // You can change these credentials before running the script
  const adminEmail = 'admin@stenna.in';
  const adminPassword = 'SuperSecretPassword123!'; 

  console.log(`\n⏳ Attempting to create admin user: ${adminEmail}...`);

  // 1. Create the user in auth.users (auto-confirms email because we use the admin API)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true, // Bypass email verification
    user_metadata: { full_name: 'Stenna Admin' }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
        console.log(`⚠️ User ${adminEmail} already exists. Attempting to promote to admin...`);
        
        // Find existing user ID
        const { data: users, error: findError } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === adminEmail);
        
        if (existingUser) {
            await promoteToAdmin(existingUser.id);
        } else {
            console.error("❌ Could not find existing user ID.");
        }
    } else {
        console.error("❌ Error creating user:", authError.message);
    }
    return;
  }

  console.log("✅ User created successfully in auth.users!");
  const userId = authData.user.id;

  // 2. Wait a brief moment for the Supabase database trigger to auto-create the public.profile
  await new Promise(resolve => setTimeout(resolve, 1500));

  await promoteToAdmin(userId);
}

async function promoteToAdmin(userId) {
    console.log(`⏳ Promoting user ID ${userId} to 'admin' role in public.profiles...`);
    
    // Update the profile role to 'admin'
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select();
  
    if (profileError) {
      console.error("❌ Error updating profile role:", profileError.message);
      return;
    }
  
    if (profileData && profileData.length > 0) {
      console.log("🎉 SUCCESS! Admin profile is ready.");
      console.log(`\nYou can now log into the admin panel with:`);
      console.log(`Email: admin@stenna.in`);
      console.log(`Password: SuperSecretPassword123!\n`);
    } else {
        console.error("❌ Profile update failed. The user profile might not have been created by the trigger yet.");
    }
}

createAdmin();
