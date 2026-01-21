'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    title: string;
    subtitle?: string;
    icon?: string;
    showBackButton?: boolean;
    variant?: 'default' | 'dark';
}

export default function Header({
    title,
    subtitle,
    icon = '🍶',
    showBackButton = true,
    variant = 'default'
}: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const isDark = variant === 'dark';

    const bgClass = isDark ? 'bg-slate-800' : 'bg-white';
    const textClass = isDark ? 'text-white' : 'text-gray-900';
    const subtitleClass = isDark ? 'text-slate-300' : 'text-gray-500';
    const menuBtnClass = isDark
        ? 'text-white hover:bg-slate-700'
        : 'text-gray-600 hover:bg-gray-100';

    return (
        <header className={`${bgClass} shadow-sm sticky top-0 z-20`}>
            <div className="max-w-4xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* 左側: 戻るボタン + タイトル */}
                    <div className="flex items-center gap-3">
                        {showBackButton && (
                            <button
                                onClick={() => router.back()}
                                className={`p-2 rounded-lg transition-colors ${menuBtnClass}`}
                                aria-label="戻る"
                            >
                                ←
                            </button>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{icon}</span>
                            <div>
                                <h1 className={`text-lg font-bold ${textClass}`}>{title}</h1>
                                {subtitle && (
                                    <p className={`text-xs ${subtitleClass}`}>{subtitle}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 右側: メニューボタン */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2 rounded-lg transition-colors ${menuBtnClass}`}
                            aria-label="メニュー"
                        >
                            <span className="text-xl">☰</span>
                        </button>

                        {/* ドロップダウンメニュー */}
                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>🏠</span>
                                        トップページ
                                    </Link>
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>⚙️</span>
                                        管理画面
                                    </Link>
                                    <Link
                                        href="/order/customer-001"
                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>📱</span>
                                        注文画面デモ
                                    </Link>
                                    <div className="border-t border-gray-100 my-1" />
                                    <Link
                                        href="/order/customer-002"
                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>📱</span>
                                        鈴木居酒屋様
                                    </Link>
                                    <Link
                                        href="/order/customer-003"
                                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>📱</span>
                                        山田レストラン様
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
