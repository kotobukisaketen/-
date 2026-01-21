
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkErrors() {
    console.log('Testing error scenarios...');

    // Scenario 1: Valid UUID but not found
    console.log('\n--- Scenario 1: Non-existent UUID ---');
    const { error: error1 } = await supabase
        .from('customers')
        .select('*, products (*)')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();
    console.log('Error 1:', JSON.stringify(error1, null, 2));

    // Scenario 2: Invalid UUID string
    console.log('\n--- Scenario 2: Invalid UUID string ---');
    const { error: error2 } = await supabase
        .from('customers')
        .select('*, products (*)')
        .eq('id', 'customer-001')
        .single();
    console.log('Error 2:', JSON.stringify(error2, null, 2));
}

checkErrors();
