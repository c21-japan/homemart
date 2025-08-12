import { NextRequest, NextResponse } from 'next/server'

interface GitHubUploadRequest {
  owner: string
  repo: string
  branch: string
  path: string
  message: string
  content: string
  committer: {
    name: string
    email: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GitHubUploadRequest = await request.json()
    console.log('GitHubアップロードリクエスト受信:', {
      owner: body.owner,
      repo: body.repo,
      path: body.path,
      message: body.message,
      contentLength: body.content?.length || 0
    })
    
    // GitHub APIの設定
    const githubToken = process.env.GITHUB_TOKEN || 'your_github_token_here'
    const apiUrl = `https://api.github.com/repos/${body.owner}/${body.repo}/contents/${body.path}`
    
    console.log('GitHub API URL:', apiUrl)
    console.log('GitHub Token:', githubToken ? '設定済み' : '未設定')
    
    // GitHub APIにリクエスト送信
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: body.message,
        content: body.content,
        branch: body.branch,
        committer: body.committer
      })
    })

    console.log('GitHub API レスポンス:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (response.ok) {
      const result = await response.json()
      console.log('GitHub API 成功レスポンス:', result)
      
      return NextResponse.json({
        success: true,
        message: '画像がGitHubに正常に保存されました',
        data: {
          sha: result.content.sha,
          download_url: result.content.download_url,
          html_url: result.content.html_url
        }
      })
    } else {
      const errorData = await response.json()
      console.error('GitHub API エラーレスポンス:', errorData)
      
      return NextResponse.json({
        success: false,
        message: 'GitHubへの保存に失敗しました',
        error: errorData.message || 'Unknown error'
      }, { status: response.status })
    }

  } catch (error) {
    console.error('GitHub upload API error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
