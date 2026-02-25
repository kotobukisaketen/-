import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const customerName = 'Mark様';
const rawData = `
【飲料】ウィルキンソン　ジンジャエール　190ml
【飲料】ウィルキンソン　トニックウォーター　190ml
【飲料】コーラ　500PET
【飲料】スプライト　470ペット
【飲料】三国　コカ・コーラゼロ　500ペット
【飲料】三国 ミニッツメイドオレンジ　1000ml
【ウイスキー】サントリー　シングルモルト　新・山崎　700ml
【ウイスキー】デュワーズ　ホワイトラベル　1750ml
【果実酒】BG　ファウンダースE　カベルネ　750ml
【果実酒】BG　ファウンダースE　シャルドネ　750ml
【果実酒】クロード・ヴァル　赤　750ml
【果実酒】シックス・エイト・ナイン ナパ・ヴァレー レッド　750ml
【果実酒】シャブリ ラ・ピエレレ ラ・シャブリジェンヌ　750ｍｌ
【果実酒】ハートリーフ　カベルネ　3000ml
【果実酒】ハートリーフ　シャルドネ　3000ml
【果実酒】ヒドゥン・パール　カベルネメルロー　750ml
【果実酒】ヒドゥン・ポスト カベルネメルロー　750ml
【焼酎】25°サッポロ業務用焼酎　4L
【スピリッツ】ウィルキンソンウォッカ　720ml
【スピリッツ】越後薬草 YASO GIN 700ml
【スピリッツ】ビーフィータージン　700ml
【清酒】吟田川　特別本醸造　300ml
【清酒】千代の光　1800ml
【清酒】千代の光　真　300ml
【その他】5キロガスボンベ
【ビール】サッポロ　黒ラベル樽　10000ml
【ビール】サッポロ　黒ラベル樽　20000ml
【ビール】サッポロ　プレミアムアルコールフリー　334ml
【リキュール】梅乃宿　あらごしゆず酒　1800ml
【リキュール】カルーアコーヒー　700ml
【リキュール】サッポロ　濃い目のグレフルサワーの素　1800ml
【リキュール】デカイパーバタースコッチキャラメル　700ml
【リキュール】ベイリーズ　アイリッシュクリーム
【リキュール】ミドリ　700ml
`;

function parseLine(line) {
    const cleanLine = line.trim();
    if (!cleanLine) return null;

    // Remove the category tag 【...】 as requested
    let content = cleanLine.replace(/^【.*?】\s*/, '');

    const parts = content.split(/[\s　]+/);

    let name = '';
    let volume = '-';

    if (parts.length === 1) {
        name = parts[0];
    } else {
        const lastPart = parts[parts.length - 1];

        // Check if the last part looks like a volume (ml, l, ℓ, numbers, or specific units)
        if (/[0-9a-zA-Z]+|タル|ガロン|ボンベ|缶|箱|瓶|ペット|PET/.test(lastPart) || lastPart.includes('ml') || lastPart.includes('l') || lastPart.includes('ℓ')) {
            // Exclude parts that look like years (e.g. 2024)
            if (/^(19|20)\d{2}$/.test(lastPart)) {
                name = parts.join(' ');
                volume = '-';
            } else {
                volume = lastPart;
                name = parts.slice(0, -1).join(' ');
            }
        } else {
            name = parts.join(' ');
        }
    }

    return { name, volume };
}

async function main() {
    console.log(`Registering customer: ${customerName}`);

    const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('name', customerName)
        .single();

    let customerId;

    if (existingCustomer) {
        console.log(`Customer exists: ${existingCustomer.id}`);
        customerId = existingCustomer.id;

        console.log('Deleting existing products to clean update...');
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('customer_id', customerId);

        if (deleteError) {
            console.error('Error deleting products:', deleteError);
            return;
        }
    } else {
        const { data: newCustomer, error: createError } = await supabase
            .from('customers')
            .insert({ name: customerName })
            .select('id')
            .single();

        if (createError) {
            console.error('Error creating customer:', createError);
            return;
        }
        console.log(`Created new customer: ${newCustomer.id}`);
        customerId = newCustomer.id;
    }

    const products = rawData
        .split('\n')
        .map(parseLine)
        .filter(p => p !== null);

    console.log(`Found ${products.length} products to register.`);

    const productInserts = products.map((p) => ({
        customer_id: customerId,
        name: p.name,
        volume: p.volume
    }));

    const { error: insertError } = await supabase
        .from('products')
        .insert(productInserts);

    if (insertError) {
        console.error('Failed to insert products:', insertError);
    } else {
        console.log('Successfully registered all products.');
    }

    console.log('\nDone!');
}

main();
