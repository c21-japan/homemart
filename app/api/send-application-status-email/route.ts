import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, applicationId, status, message } = await request.json();

    // アプリケーション情報を取得（型を明示的に定義）
    const application: any = {
      id: applicationId,
      status: status,
      created_at: new Date().toISOString(),
      property_type: '物件タイプ',
      budget: '予算',
      area: 'エリア',
      requirements: '要望'
    };

    const statusMessages = {
      received: '受付完了',
      reviewing: '審査中',
      approved: '承認済み',
      rejected: '却下',
      completed: '完了'
    };

    const statusMessage = statusMessages[status as keyof typeof statusMessages] || status;

    const { data, error } = await resend.emails.send({
      from: 'ホームマート <noreply@homemart.jp>',
      to: [email],
      subject: `【ホームマート】申請ステータス更新: ${statusMessage}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">申請ステータスが更新されました</h1>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #0066cc; margin-top: 0;">ステータス: ${statusMessage}</h2>
            ${message ? `<p style="color: #666;">${message}</p>` : ''}
          </div>

          <h3>申請情報</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>申請ID:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${application.id}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>申請日:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                ${application.created_at 
                  ? new Date(String(application.created_at)).toLocaleDateString('ja-JP') 
                  : '日付不明'}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>物件タイプ:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${application.property_type || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>予算:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${application.budget || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>希望エリア:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${application.area || '-'}</td>
            </tr>
          </table>

          <div style="margin-top: 30px; padding: 20px; background-color: #f0f8ff; border-radius: 8px;">
            <h3 style="margin-top: 0;">次のステップ</h3>
            ${status === 'received' ? `
              <p>お申し込みありがとうございます。担当者が内容を確認後、ご連絡いたします。</p>
            ` : ''}
            ${status === 'reviewing' ? `
              <p>現在、お申し込み内容を審査中です。もうしばらくお待ちください。</p>
            ` : ''}
            ${status === 'approved' ? `
              <p>お申し込みが承認されました。担当者より詳細についてご連絡いたします。</p>
            ` : ''}
            ${status === 'completed' ? `
              <p>お手続きが完了しました。ご利用ありがとうございました。</p>
            ` : ''}
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
            <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
            <p>
              株式会社ホームマート<br>
              電話: 0120-XX-XXXX<br>
              メール: info@homemart.jp<br>
              営業時間: 9:00-18:00（水曜定休）
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'メール送信に失敗しました' },
      { status: 500 }
    );
  }
}
