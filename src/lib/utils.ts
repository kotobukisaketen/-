import { Customer, Order, OrderItem, FreeInputItem } from './types';

/**
 * 顧客データをIDで取得
 */
export function getCustomerById(customers: Customer[], customerId: string): Customer | undefined {
    return customers.find(c => c.id === customerId);
}

/**
 * 注文内容を整形してテキストに変換
 */
export function formatOrderText(order: Order): string {
    const lines: string[] = [];
    lines.push('【注文内容】');
    lines.push(`顧客名: ${order.customerName}`);
    if (order.deliveryDate) {
        lines.push(`配送希望日: ${order.deliveryDate}`);
    }
    lines.push('');

    // お気に入り商品
    const activeItems = order.items.filter(i => i.quantity > 0);
    if (activeItems.length > 0) {
        lines.push('-- 商品 --');
        for (const item of activeItems) {
            lines.push('----------------------------');
            lines.push(`・${item.product.name}${item.product.volume !== '-' ? ` / ${item.product.volume}` : ''}`);
            lines.push(`　数量：【${item.quantity}】（${item.unit}）`);
        }
        lines.push('----------------------------');
        lines.push('');
    }

    // 自由入力
    const activeFreeItems = order.freeInputItems.filter(i => i.description.trim() && i.quantity > 0);
    if (activeFreeItems.length > 0) {
        lines.push('-- 備考 --');
        for (const item of activeFreeItems) {
            lines.push('----------------------------');
            const volumeText = item.volume ? ` / ${item.volume}` : '';
            lines.push(`・${item.description}${volumeText}`);
            const unitText = item.unit ? `（${item.unit}）` : '';
            lines.push(`　数量：【${item.quantity}】${unitText}`);
        }
        lines.push('----------------------------');
    }

    return lines.join('\n');
}

/**
 * LINE共有URLを生成
 */
export function generateLineShareUrl(text: string): string {
    return `https://line.me/R/share?text=${encodeURIComponent(text)}`;
}

/**
 * クリップボードにコピー
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('クリップボードへのコピーに失敗しました:', err);
        return false;
    }
}

/**
 * 顧客注文URLを生成
 */
export function generateCustomerOrderUrl(customerId: string, baseUrl: string = ''): string {
    return `${baseUrl}/order/${customerId}`;
}
