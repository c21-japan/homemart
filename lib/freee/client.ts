import { readJsonIfExists, writeJson, getTokenCachePath } from './storage'

const TOKEN_ENDPOINT = 'https://accounts.secure.freee.co.jp/public_api/token'

type TokenCache = {
  access_token: string
  refresh_token?: string
  expires_at?: number
  token_type?: string
}

function now() {
  return Date.now()
}

function isValid(cache: TokenCache | null) {
  if (!cache?.access_token || !cache.expires_at) return false
  return cache.expires_at > now() + 60 * 1000
}

async function loadTokenCache() {
  return await readJsonIfExists<TokenCache>(getTokenCachePath())
}

async function saveTokenCache(cache: TokenCache) {
  await writeJson(getTokenCachePath(), cache)
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.FREEE_CLIENT_ID?.trim()
  const clientSecret = process.env.FREEE_CLIENT_SECRET?.trim()

  if (!clientId || !clientSecret) {
    throw new Error('FREEE_CLIENT_ID / FREEE_CLIENT_SECRET が未設定です')
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken
  })

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`
    },
    body
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`freeeトークン更新に失敗しました: ${response.status} ${detail}`)
  }

  const data = await response.json()
  return {
    access_token: data.access_token as string,
    refresh_token: (data.refresh_token as string | undefined) || refreshToken,
    expires_in: data.expires_in as number | undefined,
    token_type: data.token_type as string | undefined
  }
}

export async function getAccessToken() {
  const cached = await loadTokenCache()
  if (cached && isValid(cached)) {
    return cached.access_token
  }

  if (process.env.FREEE_ACCESS_TOKEN && !cached) {
    return process.env.FREEE_ACCESS_TOKEN.trim()
  }

  const refreshToken =
    cached?.refresh_token?.trim() || process.env.FREEE_REFRESH_TOKEN?.trim()

  if (!refreshToken) {
    throw new Error('FREEE_REFRESH_TOKEN が未設定です')
  }

  const refreshed = await refreshAccessToken(refreshToken)
  const expiresAt = refreshed.expires_in ? now() + refreshed.expires_in * 1000 : undefined

  await saveTokenCache({
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
    expires_at: expiresAt,
    token_type: refreshed.token_type
  })

  return refreshed.access_token
}
