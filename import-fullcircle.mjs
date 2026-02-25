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

const customerName = 'フルサークル様';
const rawData = `
【飲料】アサヒシロップ　シークワーサー　600ml
【飲料】アサヒシロップ　レモン　600ml
【飲料】ウィルキンソン　タンサン　500ml
【飲料】エトナライムジュース　600ml
【飲料】エトナレモンジュース　600ml
【飲料】コカコーラ　PET　1500ml
【飲料】すっきりおいしい梅酒　2000紙パック
【飲料】スミダ飲料ジンジャシロップ　1000ml
【飲料】デルモンテ　パイナップルパック　1000ml
【飲料】三国　スプライト　1500ml
【飲料】三国　トニックウォーター　500ペット
【飲料】三国　ミニッツメイド　業務用　オレンジ　1000ml
【ウイスキー】江井ヶ島　あかしレッド　500ml
【ウイスキー】カナディアンクラブ　700ml
【ウイスキー】サントリー　シングルモルト　新・山崎　700ml
【ウイスキー】サントリーウイスキー知多　700ml
【ウイスキー】サントリー新角瓶　700ml
【ウイスキー】サントリー響BLENDERS CHOICE　700ml
【ウイスキー】ジェムソン　700ml
【ウイスキー】ジャックダニエルブラック　700ml
【ウイスキー】ニッカ　フロム・ザ・バレル　500ml
【ウイスキー】メーカーズマークレッドトップ　700ml
【果実酒】サンタヘレナ　アルパカカベルネメルロー　750ml
【果実酒】サンタヘレナ　アルパカシャルドネセミ　750ml
【果実酒】サントリー　ストーンズ　ジンジャーワイン　700ml
【果実酒】白鶴　グートロイトハウス　グリューワイン　1000ml
【スピリッツ】キャプテンモルガン　スパイストラム　700ml
).
【スピリッツ】クエルボテキーラゴールド　750ml
【スピリッツ】桜尾ジン　オリジナル　700ml
【スピリッツ】サントリースカイウォッカ　750ml
【スピリッツ】ジャパニーズクラフトジン　ROKU 六　700ml
【スピリッツ】タンカレー　750ml
【スピリッツ】ビーフィータージン　700ml
【スピリッツ】ペルノアブサン　700ml
【スピリッツ】マイヤーズラムダーク　700ml
【清酒】君の井　酔鬼　1800ml
【清酒】君の井　普通　1800ml
【清酒】妙高山　普通　1800ml
【その他】5キロガスボンベ
【ビール】キリン　一番搾り　樽15000ml
【ビール】サッポロ黒ラベル　樽　20000ml
【リキュール】アマレット　デイ　サローノ　700ml
【リキュール】イェーガーマイスター　700ml
【リキュール】カルーアコーヒー　700ml
【リキュール】カンパリ　1000ml
【リキュール】コアントロー　700ml
【リキュール】サッポロ白加賀でつくった梅酒　1800ml
【リキュール】サッポロ氷彩サワー　10000ml
【リキュール】シャンボ―ル　リキュール　500ml
【リキュール】デカイパーバタースコッチキャラメル　700ml
【リキュール】ファイアーボール　750ml
【リキュール】フェルネブランカ　700ml
【リキュール】フランジェリコ　700ml
【リキュール】ベイリーズアイリッシュクリーム　700ml
【リキュール】ボルス　クレーム・ド・カカオブラウン　700ml
【リキュール】ボルス　トリプルセック　700ml
`;

const englishNames = {
    "アサヒシロップ　シークワーサー": "Asahi Syrup Shekwasha",
    "アサヒシロップ　レモン": "Asahi Syrup Lemon",
    "ウィルキンソン　タンサン": "Wilkinson Tansan (Sparkling Water)",
    "エトナライムジュース": "Etna Lime Juice",
    "エトナレモンジュース": "Etna Lemon Juice",
    "コカコーラ　PET": "Coca-Cola PET",
    "すっきりおいしい梅酒": "Refreshing Delicious Umeshu (Plum Wine)",
    "スミダ飲料ジンジャシロップ": "Sumida Beverage Ginger Syrup",
    "デルモンテ　パイナップルパック": "Del Monte Pineapple Pack",
    "三国　スプライト": "Mikuni Sprite",
    "三国　トニックウォーター": "Mikuni Tonic Water",
    "三国　ミニッツメイド　業務用　オレンジ": "Mikuni Minute Maid Commercial Orange",
    "江井ヶ島　あかしレッド": "Eigashima Akashi Red",
    "カナディアンクラブ": "Canadian Club",
    "サントリー　シングルモルト　新・山崎": "Suntory Single Malt New Yamazaki",
    "サントリーウイスキー知多": "Suntory Whisky Chita",
    "サントリー新角瓶": "Suntory New Kaku-bin",
    "サントリー響BLENDERS CHOICE": "Suntory Hibiki Blender's Choice",
    "ジェムソン": "Jameson",
    "ジャックダニエルブラック": "Jack Daniel's Black",
    "ニッカ　フロム・ザ・バレル": "Nikka From The Barrel",
    "メーカーズマークレッドトップ": "Maker's Mark Red Top",
    "サンタヘレナ　アルパカカベルネメルロー": "Santa Helena Alpaca Cabernet Merlot",
    "サンタヘレナ　アルパカシャルドネセミ": "Santa Helena Alpaca Chardonnay Semillon",
    "サントリー　ストーンズ　ジンジャーワイン": "Suntory Stone's Ginger Wine",
    "白鶴　グートロイトハウス　グリューワイン": "Hakutsuru Gutleuthaus Glühwein",
    "キャプテンモルガン　スパイストラム": "Captain Morgan Spiced Rum",
    "クエルボテキーラゴールド": "Cuervo Tequila Gold",
    "桜尾ジン　オリジナル": "Sakurao Gin Original",
    "サントリースカイウォッカ": "Suntory Skyy Vodka",
    "ジャパニーズクラフトジン　ROKU 六": "Japanese Craft Gin ROKU",
    "タンカレー": "Tanqueray",
    "ビーフィータージン": "Beefeater Gin",
    "ペルノアブサン": "Pernod Absinthe",
    "マイヤーズラムダーク": "Myers's Rum Dark",
    "君の井　酔鬼": "Kiminoi Suiki (Sake)",
    "君の井　普通": "Kiminoi Regular (Sake)",
    "妙高山　普通": "Myokosan Regular (Sake)",
    "5キロガスボンベ": "5kg Gas Cylinder",
    "キリン　一番搾り　樽": "Kirin Ichiban Shibori Draft",
    "サッポロ黒ラベル　樽": "Sapporo Black Label Draft",
    "アマレット　デイ　サローノ": "Amaretto di Saronno",
    "イェーガーマイスター": "Jägermeister",
    "カルーアコーヒー": "Kahlúa Coffee",
    "カンパリ": "Campari",
    "コアントロー": "Cointreau",
    "サッポロ白加賀でつくった梅酒": "Sapporo Umeshu made with Shirakaga",
    "サッポロ氷彩サワー": "Sapporo Hyosai Sour",
    "シャンボ―ル　リキュール": "Chambord Liqueur",
    "デカイパーバタースコッチキャラメル": "De Kuyper Butterscotch Caramel",
    "ファイアーボール": "Fireball",
    "フェルネブランカ": "Fernet-Branca",
    "フランジェリコ": "Frangelico",
    "ベイリーズアイリッシュクリーム": "Baileys Irish Cream",
    "ボルス　クレーム・ド・カカオブラウン": "Bols Crème de Cacao Brown",
    "ボルス　トリプルセック": "Bols Triple Sec"
};

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

        // Check if the last part looks like a volume
        if (/[0-9a-zA-Z]+|タル|ガロン|ボンベ|缶|箱|瓶|ペット|PET|紙パック/.test(lastPart) || lastPart.includes('ml') || lastPart.includes('l') || lastPart.includes('ℓ')) {
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

    // Add English name if available
    const engName = englishNames[name];
    if (engName) {
        name = `${name} (${engName})`;
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
