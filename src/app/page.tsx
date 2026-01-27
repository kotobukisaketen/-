import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ヘッダー */}
      <Header
        title="酒屋スマート注文"
        icon="🍶"
        showBackButton={false}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <div className="text-7xl mb-6">🍶</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            寿酒店スマート注文
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            お客様にかんたん注文を。店員さんに正確な情報を。
            <br />
            LINE注文をスマートに効率化。
          </p>
        </div>

        {/* 機能説明 */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              お気に入りリスト
            </h3>
            <p className="text-gray-600">
              よく注文する商品を登録。数量を入力するだけで簡単注文。
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              自動整形
            </h3>
            <p className="text-gray-600">
              注文内容を正確な商品名で自動整形。入力ミスを防止。
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              LINE連携
            </h3>
            <p className="text-gray-600">
              ワンタップでLINEに送信。電話不要でスムーズ注文。
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-700 transition-colors"
          >
            <span>⚙️</span>
            管理画面へ
          </Link>
          <Link
            href="/order/customer-001"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <span>📱</span>
            注文画面デモ
          </Link>
        </div>

        {/* フッター */}
        <footer className="mt-24 text-center text-gray-500 text-sm">
          <p>酒屋スマート注文システム © 2026</p>
        </footer>
      </div>
    </div>
  );
}
