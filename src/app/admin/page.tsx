'use client';

import { useState, useEffect, useCallback } from 'react';
import { Customer, Product } from '@/lib/types';
import { generateCustomerOrderUrl, copyToClipboard } from '@/lib/utils';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EditState {
    name: string;
    volume: string;
    setName: (v: string) => void;
    setVolume: (v: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

// Sortable Item Component
function SortableItem({ product, isEditing, onEdit, onDelete, editState }: {
    product: Product;
    isEditing: boolean;
    onEdit: (p: Product) => void;
    onDelete: (id: string) => void;
    editState: EditState;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors touch-none"
        >
            {isEditing ? (
                <div className="space-y-2 animate-in fade-in">
                    <input
                        type="text"
                        value={editState.name}
                        onChange={(e) => editState.setName(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="商品名"
                        autoFocus
                    />
                    <input
                        type="text"
                        value={editState.volume}
                        onChange={(e) => editState.setVolume(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="容量 (例: 720ml)"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={editState.onSave}
                            className="flex-1 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600"
                        >
                            保存
                        </button>
                        <button
                            onClick={editState.onCancel}
                            className="flex-1 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
                        >
                            キャンセル
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Drag Handle */}
                        <div
                            {...listeners}
                            className="cursor-move text-gray-400 hover:text-gray-600 p-1"
                            title="ドラッグして並び替え"
                        >
                            ⋮⋮
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">{product.name}</p>
                            {product.volume !== '-' && (
                                <p className="text-xs text-gray-500">{product.volume}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(product)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="編集"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => onDelete(product.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="削除"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [newProductName, setNewProductName] = useState('');
    const [newProductVolume, setNewProductVolume] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');

    // Product Editing State
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [editProductName, setEditProductName] = useState('');
    const [editProductVolume, setEditProductVolume] = useState('');

    // Customer Editing State
    const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
    const [editCustomerName, setEditCustomerName] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
        toast.success('ログアウトしました');
    };

    const fetchCustomers = useCallback(async () => {
        // Only set loading if no data to prevent flicker
        if (customers.length === 0) setLoading(true);

        const { data, error } = await supabase
            .from('customers')
            .select(`
                *,
                products (*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching customers:', error);
            toast.error('データの取得に失敗しました');
            setLoading(false);
            return null;
        } else {
            // Sort products by display_order then created_at
            const sortedData = data?.map((customer: Customer) => ({
                ...customer,
                products: [...(customer.products || [])].sort((a: Product, b: Product) => {
                    const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
                    const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
                    if (orderA !== orderB) return orderA - orderB;
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return dateA - dateB;
                })
            }));

            const finalData = sortedData || [];
            setCustomers(finalData);
            setLoading(false);
            return finalData;
        }
    }, [customers.length]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/login');
            } else {
                fetchCustomers();
            }
        };
        checkUser();
    }, [fetchCustomers, router]);

    const handleCopyUrl = async (customerId: string) => {
        const url = generateCustomerOrderUrl(customerId, window.location.origin);
        const success = await copyToClipboard(url);
        if (success) {
            setCopiedId(customerId);
            toast.success('URLをコピーしました');
            setTimeout(() => setCopiedId(null), 2000);
        } else {
            toast.error('コピーに失敗しました');
        }
    };

    // --- Product Handlers ---

    const handleAddProduct = async () => {
        if (!selectedCustomer || !newProductName.trim()) return;

        // Get max display_order
        const maxOrder = selectedCustomer.products.reduce((max, p) => Math.max(max, p.display_order || 0), -1);

        const { error } = await supabase
            .from('products')
            .insert({
                customer_id: selectedCustomer.id,
                name: newProductName.trim(),
                volume: newProductVolume.trim() || '-',
                display_order: maxOrder + 1
            });

        if (error) {
            console.error('Error adding product:', error);
            toast.error('商品の追加に失敗しました');
        } else {
            toast.success('商品を追加しました');
            const freshData = await fetchCustomers();
            if (freshData && selectedCustomer) {
                const updated = freshData.find(c => c.id === selectedCustomer.id);
                if (updated) setSelectedCustomer(updated);
            }
            setNewProductName('');
            setNewProductVolume('');
        }
    };

    const handleRemoveProduct = async (productId: string) => {
        if (!selectedCustomer) return;
        if (!confirm('この商品を削除しますか？')) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) {
            console.error('Error deleting product:', error);
            toast.error('商品の削除に失敗しました');
        } else {
            toast.success('商品を削除しました');
            const freshData = await fetchCustomers();
            if (freshData && selectedCustomer) {
                const updated = freshData.find(c => c.id === selectedCustomer.id);
                setSelectedCustomer(updated || null);
            }
        }
    };

    const handleStartEditProduct = (product: Product) => {
        setEditingProductId(product.id);
        setEditProductName(product.name);
        setEditProductVolume(product.volume);
    };

    const handleSaveEditProduct = async () => {
        if (!selectedCustomer || !editingProductId || !editProductName.trim()) return;

        const { error } = await supabase
            .from('products')
            .update({
                name: editProductName.trim(),
                volume: editProductVolume.trim() || '-',
            })
            .eq('id', editingProductId);

        if (error) {
            console.error('Error updating product:', error);
            toast.error('商品の更新に失敗しました');
        } else {
            toast.success('商品を更新しました');
            const freshData = await fetchCustomers();
            if (freshData && selectedCustomer) {
                const updated = freshData.find(c => c.id === selectedCustomer.id);
                if (updated) setSelectedCustomer(updated);
            }
            setEditingProductId(null);
            setEditProductName('');
            setEditProductVolume('');
        }
    };

    const handleCancelEditProduct = () => {
        setEditingProductId(null);
        setEditProductName('');
        setEditProductVolume('');
    };

    // --- Customer Handlers ---

    const handleAddCustomer = async () => {
        if (!newCustomerName.trim()) return;

        const { error } = await supabase
            .from('customers')
            .insert({
                name: newCustomerName.trim(),
            });

        if (error) {
            console.error('Error adding customer:', error);
            toast.error('顧客の追加に失敗しました');
        } else {
            toast.success('顧客を追加しました');
            await fetchCustomers();
            setNewCustomerName('');
            setShowNewCustomerForm(false);
        }
    };

    const handleDeleteCustomer = async (customerId: string) => {
        if (!confirm('この顧客を削除しますか？\n（紐づく商品も全て削除されます）')) return;

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', customerId);

        if (error) {
            console.error('Error deleting customer:', error);
            toast.error('顧客の削除に失敗しました');
        } else {
            toast.success('顧客を削除しました');
            setCustomers(prev => prev.filter(c => c.id !== customerId));
            if (selectedCustomer?.id === customerId) {
                setSelectedCustomer(null);
            }
        }
    };

    const handleStartEditCustomer = (customer: Customer) => {
        setEditingCustomerId(customer.id);
        setEditCustomerName(customer.name);
    };

    const handleSaveEditCustomer = async () => {
        if (!editingCustomerId || !editCustomerName.trim()) return;

        const { error } = await supabase
            .from('customers')
            .update({ name: editCustomerName.trim() })
            .eq('id', editingCustomerId);

        if (error) {
            console.error('Error updating customer:', error);
            toast.error('顧客名の更新に失敗しました');
        } else {
            toast.success('顧客名を更新しました');
            const updatedCustomer: Customer = {
                ...(customers.find(c => c.id === editingCustomerId)!),
                name: editCustomerName.trim()
            };

            setCustomers(prev => prev.map(c => c.id === editingCustomerId ? updatedCustomer : c));

            if (selectedCustomer?.id === editingCustomerId) {
                setSelectedCustomer(updatedCustomer);
            }

            setEditingCustomerId(null);
            setEditCustomerName('');
        }
    };

    const handleCancelEditCustomer = () => {
        setEditingCustomerId(null);
        setEditCustomerName('');
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id && selectedCustomer) {
            const oldIndex = selectedCustomer.products.findIndex((p) => p.id === active.id);
            const newIndex = selectedCustomer.products.findIndex((p) => p.id === over?.id);

            // Optimistic update
            const newProducts = arrayMove(selectedCustomer.products, oldIndex, newIndex);

            // Assign new display orders
            const updatedProducts = newProducts.map((p, index) => ({
                ...p,
                display_order: index
            }));

            // Update local state immediately
            const updatedCustomer = { ...selectedCustomer, products: updatedProducts };
            setSelectedCustomer(updatedCustomer);
            setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));

            // Persist to DB
            try {
                const updates = updatedProducts.map(p =>
                    supabase
                        .from('products')
                        .update({ display_order: p.display_order })
                        .eq('id', p.id)
                );

                await Promise.all(updates);
            } catch (error) {
                console.error('Error saving order:', error);
                toast.error('並び順の保存に失敗しました');
                await fetchCustomers(); // Revert on error
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* ... (Keep Header and main structure) ... */}
            <div className="relative">
                <Header
                    title="管理画面"
                    subtitle="顧客管理・注文URL発行"
                    icon="⚙️"
                    variant="dark"
                />
                <button
                    onClick={handleLogout}
                    className="absolute top-4 right-4 text-white/80 hover:text-white text-sm font-medium hover:underline"
                >
                    ログアウト
                </button>
            </div>

            <main className="max-w-4xl mx-auto px-4 py-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* 顧客リスト (Keep existing) */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <span>👥</span>
                                顧客リスト
                            </h2>
                            <button
                                onClick={() => setShowNewCustomerForm(true)}
                                className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                + 新規追加
                            </button>
                        </div>

                        {/* 検索ボックス */}
                        <div className="mb-4 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input
                                type="text"
                                placeholder="顧客名を検索..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition-all"
                            />
                        </div>

                        {showNewCustomerForm && (
                            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    placeholder="顧客名を入力..."
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddCustomer}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                    >
                                        追加
                                    </button>
                                    <button
                                        onClick={() => setShowNewCustomerForm(false)}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        キャンセル
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                            {loading && customers.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">読み込み中...</div>
                            ) : customers.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">顧客がいません</div>
                            ) : (
                                customers
                                    .filter(customer =>
                                        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((customer) => (
                                        <div
                                            key={customer.id}
                                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedCustomer?.id === customer.id
                                                ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]'
                                                : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                                                }`}
                                            onClick={() => setSelectedCustomer(customer)}
                                        >
                                            {editingCustomerId === customer.id ? (
                                                <div className="animate-in fade-in space-y-2 cursor-default" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={editCustomerName}
                                                        onChange={(e) => setEditCustomerName(e.target.value)}
                                                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleSaveEditCustomer}
                                                            className="flex-1 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600"
                                                        >
                                                            保存
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEditCustomer}
                                                            className="flex-1 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
                                                        >
                                                            キャンセル
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-gray-800">{customer.name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{customer.products?.length || 0}件の商品</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStartEditCustomer(customer);
                                                            }}
                                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="名前を編集"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopyUrl(customer.id);
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${copiedId === customer.id
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {copiedId === customer.id ? '✓' : '🔗 URL'}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteCustomer(customer.id);
                                                            }}
                                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                                                            title="顧客を削除"
                                                        >
                                                            ❌
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>

                    {/* 商品編集 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative">
                        {!selectedCustomer && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                                <p className="text-gray-400 font-medium">👈 左のリストから顧客を選択してください</p>
                            </div>
                        )}

                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span>📦</span>
                            商品リスト編集
                        </h2>

                        <div>
                            {selectedCustomer && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="font-bold text-blue-900">{selectedCustomer.name}</p>
                                    <p className="text-xs text-blue-600">いつもの商品リスト（ドラッグで並び替え可能）</p>
                                </div>
                            )}

                            <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto pr-2">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={selectedCustomer?.products || []}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {(selectedCustomer?.products || []).map((product) => (
                                            <SortableItem
                                                key={product.id}
                                                product={product}
                                                isEditing={editingProductId === product.id}
                                                onEdit={handleStartEditProduct}
                                                onDelete={handleRemoveProduct}
                                                editState={{
                                                    name: editProductName,
                                                    volume: editProductVolume,
                                                    setName: setEditProductName,
                                                    setVolume: setEditProductVolume,
                                                    onSave: handleSaveEditProduct,
                                                    onCancel: handleCancelEditProduct
                                                }}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm font-bold text-gray-700 mb-2">商品を追加</p>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="商品名"
                                        value={newProductName}
                                        onChange={(e) => setNewProductName(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="容量"
                                        value={newProductVolume}
                                        onChange={(e) => setNewProductVolume(e.target.value)}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleAddProduct}
                                    disabled={!selectedCustomer}
                                    className="w-full py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    + 追加する
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
