'use client';

import { useState } from 'react';
import { Order } from '@/lib/types';
import { formatOrderText, copyToClipboard, generateLineShareUrl } from '@/lib/utils';

interface OrderSummaryProps {
    order: Order;
    onClose: () => void;
}

export default function OrderSummary({ order, onClose }: OrderSummaryProps) {
    const [copied, setCopied] = useState(false);
    const orderText = formatOrderText(order);

    const activeItems = order.items.filter(i => i.quantity > 0);
    const activeFreeItems = order.freeInputItems.filter(i => i.description.trim() && i.quantity > 0);
    const totalCount = activeItems.length + activeFreeItems.length;

    const handleCopy = async () => {
        const success = await copyToClipboard(orderText);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLineShare = () => {
        window.open(generateLineShareUrl(orderText), '_blank');
    };

    if (totalCount === 0) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                    <p className="text-center text-gray-800 mb-4">注文する商品がありません</p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-200 text-gray-900 rounded-xl font-medium"
                    >
                        戻る
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    注文内容の確認
                </h2>

                <div className="bg-gray-100 rounded-xl p-4 mb-4 font-mono text-sm whitespace-pre-wrap text-gray-900">
                    {orderText}
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleCopy}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${copied
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                            }`}
                    >
                        <span className="text-xl">{copied ? '✓' : '📋'}</span>
                        {copied ? 'コピーしました！' : 'テキストをコピー'}
                    </button>

                    <button
                        onClick={handleLineShare}
                        className="w-full py-4 bg-[#06C755] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#05b34d] transition-colors"
                    >
                        <span className="text-xl">💬</span>
                        LINEで送る
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full py-3 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        戻る
                    </button>
                </div>
            </div>
        </div>
    );
}
