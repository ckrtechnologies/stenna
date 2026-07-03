import { supabase } from '../config/supabase.js';

async function createWAUser() {
    const email = 'wa@stenna.com';
    const password = 'password@1';

    console.log(`Creating user ${email}...`);

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            console.error('Error creating user auth:', error.message);
            // If user already exists, we will still try to update the profile role
            if (!error.message.includes('already registered')) {
                return;
            }
        }

        const userId = data.user?.id;
        
        let targetId = userId;

        if (!userId) {
            // Fetch user ID if already existed
            console.log('User might already exist, attempting to update profile role...');
            // Need to sign in to get the user ID if not returned, or we can use admin API but we only have anon client here likely
            // So we'll try signing in
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (signInError) {
                console.error('Could not sign in to get ID:', signInError.message);
                return;
            }
            targetId = signInData.user.id;
        }

        if (targetId) {
            console.log(`Setting role WA_InventoryManager for user ID: ${targetId}`);
            
            // Assuming profiles table has a 'role' column
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({ id: targetId, email: email, role: 'WA_InventoryManager' });

            if (profileError) {
                console.error('Error updating profile:', profileError.message);
            } else {
                console.log('Successfully set user role to WA_InventoryManager');
            }
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

createWAUser();
