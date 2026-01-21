
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
    console.log('Testing connection to:', supabaseUrl);

    // Using one from previous output: 190f5df2-1db4-4393-aa13-64c65d0a716c (田中酒店)
    const validId = '190f5df2-1db4-4393-aa13-64c65d0a716c';
    console.log(`Fetching customer ${validId} with products...`);

    const { data, error } = await supabase
        .from('customers')
        .select(`
            *,
            products (*)
        `)
        .eq('id', validId)
        .single();

    if (error) {
        console.error('❌ Connection or Query Error:', error.message);
        console.error('Details:', error);
    } else {
        console.log('✅ Success!');
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

checkConnection();
