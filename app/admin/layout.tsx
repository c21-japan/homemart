import AdminNavigation from '@/components/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 認証チェックはmiddleware.tsに任せる
  // ここでリダイレクトしない！
  
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavigation />
      <main className="ml-64 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
