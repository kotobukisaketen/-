const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: customers, error } = await supabase
        .from('customers')
        .select('id, name')
        .limit(1);

    if (error) {
        console.error('Error fetching customers:', error);
        return;
    }

    if (customers && customers.length > 0) {
        const customer = customers[0];
        console.log(`Customer: ${customer.name}`);
        console.log(`URL: http://localhost:3000/order/${customer.id}`);
    } else {
        console.log('No customers found.');
    }
}

main();
