'use client';

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">管理ダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">顧客リード</h2>
          <p className="text-3xl font-bold mt-2">25件</p>
          <p className="text-sm text-gray-500 mt-1">今月: 8件</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">媒介契約</h2>
          <p className="text-3xl font-bold mt-2">15件</p>
          <p className="text-sm text-gray-500 mt-1">有効: 10件</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">チェックリスト</h2>
          <p className="text-3xl font-bold mt-2">30件</p>
          <p className="text-sm text-gray-500 mt-1">完了: 20件</p>
        </div>
      </div>
    </div>
  );
}
