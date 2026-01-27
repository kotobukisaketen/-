'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Customer, OrderItem, FreeInputItem, Order, Product } from '@/lib/types';
import ProductList from '@/components/ProductList';
import FreeInputField from '@/components/FreeInputField';
import OrderSummary from '@/components/OrderSummary';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

export default function OrderPage() {
    const params = useParams();
    const customerId = params.customerId as string;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [freeInputItems, setFreeInputItems] = useState<FreeInputItem[]>([]);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [showSummary, setShowSummary] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!customerId) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    products (*)
                `)
                .eq('id', customerId)
                .single();

            if (error || !data) {
                console.error('Error fetching customer:', error);
                setCustomer(null);
                setLoading(false);
                return;
            }

            // Sort products by display_order then created_at
            const sortedProducts = (data.products || []).sort((a: any, b: any) => {
                const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
                const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
                if (orderA !== orderB) return orderA - orderB;
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            });

            setCustomer({ ...data, products: sortedProducts });

            // Initialize order items with all products having 0 quantity
            const initialOrderItems = sortedProducts.map((p: Product) => ({
                product: {
                    id: p.id,
                    name: p.name,
                    volume: p.volume,
                    display_order: p.display_order
                },
                quantity: 0,
                unit: 'バラ' as const
            }));
            setOrderItems(initialOrderItems);
            setLoading(false);
        };

        fetchCustomer();
    }, [customerId]);

    const handleQuantityChange = (productId: string, quantity: number) => {
        setOrderItems(prev =>
            prev.map(item =>
                item.product.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const handleUnitChange = (productId: string, unit: 'バラ' | 'ケース') => {
        setOrderItems(prev =>
            prev.map(item =>
                item.product.id === productId
                    ? { ...item, unit }
                    : item
            )
        );
    };

    const handleAddFreeItem = () => {
        setFreeInputItems(prev => [...prev, { description: '', quantity: 1, volume: '', unit: 'バラ' }]);
    };

    const handleRemoveFreeItem = (index: number) => {
        setFreeInputItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateFreeItem = (index: number, field: 'description' | 'quantity' | 'volume' | 'unit', value: string | number) => {
        setFreeInputItems(prev =>
            prev.map((item, i) =>
                i === index
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };

    const getTotalItemCount = () => {
        const productCount = orderItems.filter(i => i.quantity > 0).length;
        const freeCount = freeInputItems.filter(i => i.description.trim() && i.quantity > 0).length;
        return productCount + freeCount;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-pulse text-xl text-gray-600">読み込み中...</div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-md">
                    <div className="text-6xl mb-4">😔</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">お客様が見つかりません</h1>
                    <p className="text-gray-600">URLを確認してください</p>
                </div>
            </div>
        );
    }

    const order: Order = {
        customerId: customer.id,
        customerName: customer.name,
        items: orderItems,
        freeInputItems,
        deliveryDate,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* ヘッダー */}
            <Header
                title="酒屋スマート注文"
                subtitle={`${customer.name} 様`}
                icon="🍶"
            />

            {/* メインコンテンツ */}
            <main className="max-w-lg mx-auto px-4 py-6 pb-28">
                {/* 配送希望日 */}
                <div className="mb-4 bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-200 sticky top-16 z-10">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-2xl">📅</span>
                        配送希望日
                    </h2>
                    <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    />
                </div>

                <ProductList
                    products={customer.products}
                    orderItems={orderItems}
                    onQuantityChange={handleQuantityChange}
                    onUnitChange={handleUnitChange}
                />

                <div className="mt-8">
                    <FreeInputField
                        freeInputItems={freeInputItems}
                        onAddItem={handleAddFreeItem}
                        onRemoveItem={handleRemoveFreeItem}
                        onUpdateItem={handleUpdateFreeItem}
                    />
                </div>


            </main>

            {/* 注文ボタン */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-pb">
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={() => setShowSummary(true)}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="text-xl">📝</span>
                        注文を確認する
                        {getTotalItemCount() > 0 && (
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                                {getTotalItemCount()}点
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* 注文確認モーダル */}
            {showSummary && (
                <OrderSummary
                    order={order}
                    onClose={() => setShowSummary(false)}
                />
            )}
        </div>
    );
}
