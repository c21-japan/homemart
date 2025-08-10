import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function GET() {
  try {
    const msg = {
      to: process.env.EMAIL_TO!,
      from: process.env.EMAIL_FROM!,
      subject: 'テストメール',
      text: 'これはテストメールです',
      html: '<strong>これはテストメールです</strong>',
    }

    const result = await sgMail.send(msg)
    console.log('送信成功:', result)
    
    return NextResponse.json({ 
      success: true, 
      statusCode: result[0].statusCode 
    })
  } catch (error: any) {
    console.error('エラー詳細:', error)
    if (error.response) {
      console.error('SendGrid Response:', error.response.body)
    }
    return NextResponse.json({ 
      error: error.message,
      details: error.response?.body 
    }, { status: 500 })
  }
}
