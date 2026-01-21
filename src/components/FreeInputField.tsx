'use client';

import { FreeInputItem } from '@/lib/types';

interface FreeInputFieldProps {
    freeInputItems: FreeInputItem[];
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    onUpdateItem: (index: number, field: 'description' | 'quantity', value: string | number) => void;
}

export default function FreeInputField({
    freeInputItems,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
}: FreeInputFieldProps) {
    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                その他の商品（自由入力）
            </h2>

            {freeInputItems.map((item, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="商品名を入力..."
                            value={item.description}
                            onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => onRemoveItem(index)}
                            className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                            aria-label="削除"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">数量:</span>
                        <button
                            onClick={() => onUpdateItem(index, 'quantity', Math.max(0, item.quantity - 1))}
                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
                        >
                            −
                        </button>
                        <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => onUpdateItem(index, 'quantity', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-12 h-8 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => onUpdateItem(index, 'quantity', item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all"
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={onAddItem}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
                <span className="text-xl">+</span>
                商品を追加
            </button>
        </div>
    );
}
