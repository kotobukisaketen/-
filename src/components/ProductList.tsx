'use client';

import { Product, OrderItem } from '@/lib/types';

interface ProductListProps {
    products: Product[];
    orderItems: OrderItem[];
    onQuantityChange: (productId: string, quantity: number) => void;
    onUnitChange: (productId: string, unit: 'バラ' | 'ケース') => void;
}

export default function ProductList({ products, orderItems, onQuantityChange, onUnitChange }: ProductListProps) {
    const getQuantity = (productId: string): number => {
        const item = orderItems.find(i => i.product.id === productId);
        return item?.quantity || 0;
    };

    const getUnit = (productId: string): 'バラ' | 'ケース' => {
        const item = orderItems.find(i => i.product.id === productId);
        return item?.unit || 'バラ';
    };

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                お気に入り商品
            </h2>
            {products.map((product) => (
                <div
                    key={product.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
                >
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.volume}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {/* 数量入力 */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onQuantityChange(product.id, Math.max(0, getQuantity(product.id) - 1))}
                                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-bold text-xl flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
                                aria-label="数量を減らす"
                            >
                                −
                            </button>
                            <input
                                type="number"
                                min="0"
                                value={getQuantity(product.id)}
                                onChange={(e) => onQuantityChange(product.id, Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-14 h-10 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => onQuantityChange(product.id, getQuantity(product.id) + 1)}
                                className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold text-xl flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all"
                                aria-label="数量を増やす"
                            >
                                +
                            </button>
                        </div>

                        {/* 単位選択 */}
                        <div className="flex bg-gray-100 p-0.5 rounded-lg">
                            <button
                                onClick={() => onUnitChange(product.id, 'バラ')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${getUnit(product.id) === 'バラ'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                バラ
                            </button>
                            <button
                                onClick={() => onUnitChange(product.id, 'ケース')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${getUnit(product.id) === 'ケース'
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
        </div>
    );
}
