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

const customerName = '黒蜜 様';
const rawData = `
【飲料】LDC　お茶屋さんの緑茶　2000ml
【飲料】ウィルキンソン　ジンジャエール　190ml
【飲料】コカ・コーラ　レギュラー　190ml
【飲料】サントリー　ウーロン茶業務用PET　2000ml
【飲料】ポッカ　お酒にプラス　GF　540ml
【飲料】ポッカ　お酒にプラス　ライム　540ml
【飲料】ポッカ　お酒にプラス　レモン　540ml
【ウイスキー】サントリー　ウイスキー　知多　700ml
【ウイスキー】サントリー　新角瓶　700ml
【ウイスキー】サントリー　シングルモルト　新・白州　700ml
【ウイスキー】サントリー　スペシャルリザーブ  700ml
【ウイスキー】サントリー　ピュアモルト山崎12年　700ml
【ウイスキー】サントリーニューローヤルスリム　660ml
【ウイスキー】サントリー響　ジャパニーズハーモニー　700ml
【ウイスキー】ジャックダニエルブラック　700ml
【ウイスキー】ニッカ　竹鶴　ピュアモルト　700ml
【ウイスキー】ブラックニッカクリアブレンド　700ml
【ウイスキー】メーカーズマークレッドトップ　700ml
【果実酒】アン　プルミエ・アムール　スイートロゼ(橙)　750ml
【果実酒】ペティアン・ド・リステル　パイン　750ml
【果実酒】ポンパドール　マスカット　750ml
【果実酒】深雪花　赤　720ml
【果実酒】モエ・エ・シャンドン　ブリュアンペリアル　750ml
【果実酒】モエ・エ・シャンドン　ロゼ　750ml
【果実酒】モエ・エ・シャンドン・ネクター・インペリアル・ロゼ　750ml
【焼酎】25°　トライアングルインディゴ　700ml
【焼酎】赤霧島　900ml
【焼酎】茜霧島　900ml
【焼酎】いいちこシルエット　720ml
【焼酎】神の河　720ml
【焼酎】鏡月グリーン　700ml
【焼酎】黒霧島　芋　900ml
【焼酎】刻の一滴　ピノノワール樽貯蔵　麦 720ml
【焼酎】眞露　25°　700ml
【焼酎】赤兎馬　720ml
【焼酎】二階堂　吉四六　つぼ　720ml
【焼酎】白岳　白　720ml
【清酒】獺祭　発砲  720ml
【ビール】アサヒ　スーパードライ　小瓶　334ml
【ビール】アサヒ　スーパードライ　中瓶　500ml
【ビール】キリン　クラシックラガー　中瓶　500ml
【ブランデー】ヘネシー　VSOＰ　700ml
【ブランデー】レミーマルタン　VSOP　丸瓶　700ml
【リキュール】白鶴　梅酒　1800ml
【リキュール】ルジェ　クレームド　ピーチ　700ml
`;

function parseLine(line) {
    const cleanLine = line.trim();
    if (!cleanLine) return null;

    let content = cleanLine.replace(/^【.*?】\s*/, '');

    const parts = content.split(/[\s　]+/);

    let name = '';
    let volume = '-';

    if (parts.length === 1) {
        name = parts[0];
    } else {
        const lastPart = parts[parts.length - 1];

        if (/[0-9a-zA-Z]+|タル|ガロン|ボンベ|缶/.test(lastPart) || lastPart.includes('ml') || lastPart.includes('l') || lastPart.includes('ℓ')) {
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
