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

const customerName = 'popcorn様';
const rawData = `
【ビール】アサヒ　グローシュプレミアムラガー　450ml
【ビール】アサヒ　ピルスナー　ウルケル瓶　330ml
【ビール】アサヒ　ペローニ　ナストロアズーロ　330ml
【ビール】アサヒスーパードライ樽生　10000ml
【ビール】アサヒスーパードライ樽生　19000ml
【ビール】キリン　ハートランド　中瓶
【ビール】コロナエキストラ瓶　330ml
【ビール】サッポロ黒ラベル　20000ml
【ビール】ドラフトギネスサージャ用ボトル
【ビール】新潟限定ビイル　風味爽快ニシテ　20000ml
【ビール】ハイネケンビールロングネック瓶　330ml
【飲料】アサヒシロップ　青りんご　600ml
【飲料】アサヒシロップ　巨峰　600ml
【飲料】アサヒシロップ　桃　600ml
【飲料】アサヒシロップ　ゆず　600ml
【飲料】アサヒシロップ　レモン　600ml
【飲料】三国　コカコーラ　タル
【飲料】三国　ジンジャーエール　タル
【飲料】三国　トニックウォーター　タル
【飲料】レッドブルエナジードリンク　250缶
【ウイスキー】サントリー　シングルモルト　新・山崎　700ml
【ウイスキー】サントリー　山崎12年　700ml
【ウイスキー】サントリー　ワールドウイスキー　碧Ao
【ウイスキー】サントリー響　ジャパニーズハーモ二ー
【ウイスキー】ジャックダニエルブラック　700ml
【ウイスキー】竹鶴
【ウイスキー】チョーヤブランデーVO　紙パック　1800ml
【ウイスキー】ニッカ　シングルモルト　新・宮城峡　700ml
【ウイスキー】バランタイン　ファイネスト　700ml
【ウイスキー】メーカーズマークレッドトップ
【果実酒】ヴーヴクリコイエロー　750ml
【果実酒】キリンハードシードル　290ml
【スピリッツ】キャプテンモルガン　スパイストラム　700ml
【スピリッツ】キャプテンモルガン　スパイストラム　750ml
【スピリッツ】クエルボテキーラゴールド　750ml
【スピリッツ】ジムビームホワイト　700ml
【スピリッツ】ジャパニーズクラフトジン　ROKU　六
【スピリッツ】スミノフウォッカ　40°
【スピリッツ】ビーフィータージン　700ml
【スピリッツ】ホセクエルボ　1800　レポサド
【スピリッツ】ボンベイサファイア　750ml
【清酒】妙高山　普通　1800ml
【清酒】妙高山　二段酵母仕込　特別純米　1800ml
【その他】5キロガスボンベ

【リキュール】アサヒ樽ハイ倶楽部　10000ml
【リキュール】アマレット　デイ　サローノ　700ml
【リキュール】イエーガーマイスター　700ml
【リキュール】梅乃宿　あらごしみかん酒　1800ml
【リキュール】梅乃宿　あらごしもも酒　1800ml
【リキュール】梅乃宿　あらごしゆず酒　1800ml
【リキュール】梅乃宿　あらごしゆず酒　720ml
【リキュール】梅乃宿　あらごしれもん　1800ml
【リキュール】カルーアコーヒー　700ml
【リキュール】カンパリ　750ml
【リキュール】キリン　スミノフアイス　275ml
【リキュール】コカレロ　クラシコ　700ml
【リキュール】サッポロ氷彩サワー　10000ml
【リキュール】サントリーカクテルレモン　780ml
【リキュール】チョーヤ梅酒　エクセレント　750ml
【リキュール】デカイパーバタースコッチキャラメル
【リキュール】ファイアーボール　750ml
【リキュール】フランジェリコ　700ml
【リキュール】ベイリーズアイリッシュクリーム
【リキュール】マザリンクレームドカシスドディ
【リキュール】マリブ　700ml
【リキュール】ミドリ　700ml
`;

function parseLine(line) {
    const cleanLine = line.trim();
    if (!cleanLine) return null;

    // Get the category tag if it exists
    const categoryMatch = cleanLine.match(/^【(.*?)】/);
    const category = categoryMatch ? categoryMatch[1] : null;

    let content = cleanLine.replace(/^【.*?】\s*/, '');

    const parts = content.split(/[\s　]+/);

    let name = '';
    let volume = '-';

    if (parts.length === 1) {
        name = parts[0];
    } else {
        const lastPart = parts[parts.length - 1];

        // Check if the last part looks like a volume (ml, l, ℓ, numbers, or specific units)
        if (/[0-9a-zA-Z]+|タル|ガロン|ボンベ|缶|箱|瓶/.test(lastPart) || lastPart.includes('ml') || lastPart.includes('l') || lastPart.includes('ℓ')) {
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

    // Prepend category if found
    if (category) {
        name = `【${category}】${name}`;
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
