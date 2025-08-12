import { NextRequest, NextResponse } from 'next/server'

interface GitHubDeleteRequest {
  owner: string
  repo: string
  branch: string
  path: string
  message: string
  committer: {
    name: string
    email: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GitHubDeleteRequest = await request.json()
    
    // GitHub APIの設定
    const githubToken = process.env.GITHUB_TOKEN || 'your_github_token_here'
    const apiUrl = `https://api.github.com/repos/${body.owner}/${body.repo}/contents/${body.path}`
    
    // まず、ファイルの現在のSHAを取得
    const getResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    })

    if (!getResponse.ok) {
      return NextResponse.json({
        success: false,
        message: 'ファイルが見つかりません',
        error: 'File not found'
      }, { status: 404 })
    }

    const fileInfo = await getResponse.json()
    
    // GitHub APIに削除リクエスト送信
    const deleteResponse = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: body.message,
        sha: fileInfo.sha,
        branch: body.branch,
        committer: body.committer
      })
    })

    if (deleteResponse.ok) {
      return NextResponse.json({
        success: true,
        message: '画像がGitHubリポジトリから正常に削除されました'
      })
    } else {
      const errorData = await deleteResponse.json()
      
      return NextResponse.json({
        success: false,
        message: 'GitHubリポジトリからの削除に失敗しました',
        error: errorData.message || 'Unknown error'
      }, { status: deleteResponse.status })
    }

  } catch (error) {
    console.error('GitHub delete API error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
