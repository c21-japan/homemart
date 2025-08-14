export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('ログインリクエスト受信:', { email, password });
    
    // 認証チェック
    if (email === 'y-inui@century21.group' && password === 'Inui2024!') {
      console.log('✅ 認証成功: 乾佑企（オーナー）');
      return Response.json({ 
        success: true, 
        message: 'ログイン成功',
        user: {
          name: '乾佑企',
          role: 'owner',
          permissions: ['all']
        }
      });
    } else if (email === 'm-yasuda@century21.group' && password === 'Yasuda2024!') {
      console.log('✅ 認証成功: 安田実加（管理者）');
      return Response.json({ 
        success: true, 
        message: 'ログイン成功',
        user: {
          name: '安田実加',
          role: 'admin',
          permissions: ['leads', 'customers', 'reports']
        }
      });
    } else if (email === 'info@century21.group' && password === 'Yamao2024!') {
      console.log('✅ 認証成功: 山尾妃奈（スタッフ）');
      return Response.json({ 
        success: true, 
        message: 'ログイン成功',
        user: {
          name: '山尾妃奈',
          role: 'staff',
          permissions: ['leads']
        }
      });
    } else {
      console.log('❌ 認証失敗');
      return Response.json({ 
        error: 'メールアドレスまたはパスワードが正しくありません' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('ログインAPIエラー:', error);
    return Response.json({ 
      error: 'サーバーエラーが発生しました' 
    }, { status: 500 });
  }
}
