'use client';

import { FreeInputItem } from '@/lib/types';
import { useSpeechToText } from '@/hooks/useSpeechToText';

interface FreeInputFieldProps {
    freeInputItems: FreeInputItem[];
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    onUpdateItem: (index: number, field: 'description' | 'quantity' | 'volume' | 'unit', value: string | number) => void;
}

export default function FreeInputField({
    freeInputItems,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
}: FreeInputFieldProps) {
    const { isListening, startListening, stopListening } = useSpeechToText();

    const handleSpeechInput = (index: number) => {
        const fieldId = `free-item-${index}`;
        if (isListening === fieldId) {
            stopListening();
        } else {
            startListening(fieldId, (text) => {
                onUpdateItem(index, 'description', text);
            });
        }
    };
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
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="商品名を入力..."
                                value={item.description}
                                onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                            />
                            <button
                                onClick={() => handleSpeechInput(index)}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${isListening === `free-item-${index}`
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'text-gray-400 hover:bg-gray-100 hover:text-blue-500'
                                    }`}
                                aria-label="音声入力"
                            >
                                {isListening === `free-item-${index}` ? '🛑' : '🎤'}
                            </button>
                        </div>
                        <button
                            onClick={() => onRemoveItem(index)}
                            className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                            aria-label="削除"
                        >
                            ✕
                        </button>
                    </div>
                    {/* 容量入力 */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500 w-12">容量:</span>
                        <input
                            type="text"
                            placeholder="例: 720ml"
                            value={item.volume || ''}
                            onChange={(e) => onUpdateItem(index, 'volume', e.target.value)}
                            className="flex-1 px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    {/* 数量と単位 */}
                    <div className="flex items-center justify-between">
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
                                className="w-12 h-8 text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => onUpdateItem(index, 'quantity', item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all"
                            >
                                +
                            </button>
                        </div>
                        {/* 単位選択 */}
                        <div className="flex bg-gray-100 p-0.5 rounded-lg">
                            <button
                                onClick={() => onUpdateItem(index, 'unit', 'バラ')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${(item.unit || 'バラ') === 'バラ'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                バラ
                            </button>
                            <button
                                onClick={() => onUpdateItem(index, 'unit', 'ケース')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${item.unit === 'ケース'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                ケース
                            </button>
                        </div>
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
