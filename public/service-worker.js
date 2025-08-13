// ホームマート PWA サービスワーカー
const CACHE_NAME = 'homemart-v1'
const STATIC_CACHE_NAME = 'homemart-static-v1'
const DYNAMIC_CACHE_NAME = 'homemart-dynamic-v1'

// キャッシュする静的リソース
const STATIC_ASSETS = [
  '/',
  '/leads/new',
  '/admin/leads',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
]

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
  )
})

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Old caches cleaned up')
        return self.clients.claim()
      })
  )
})

// フェッチ時の処理（Stale-While-Revalidate）
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 同じオリジンのリクエストのみ処理
  if (url.origin !== location.origin) {
    return
  }

  // 静的アセットのキャッシュ戦略
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              // キャッシュから返す
              const fetchPromise = fetch(request)
                .then((response) => {
                  // キャッシュを更新
                  if (response.ok) {
                    cache.put(request, response.clone())
                  }
                  return response
                })
                .catch(() => {
                  // ネットワークエラーの場合はキャッシュから返す
                  return cachedResponse
                })

              return cachedResponse || fetchPromise
            })
        })
    )
    return
  }

  // APIリクエストの場合はネットワークファースト
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // ネットワークエラーの場合はオフライン用のレスポンス
          return new Response(
            JSON.stringify({ error: 'オフラインです。後で再試行してください。' }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          )
        })
    )
    return
  }

  // その他のリクエストはネットワークファースト
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 成功したレスポンスをキャッシュに保存
        if (response.ok && response.status === 200) {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone)
            })
        }
        return response
      })
      .catch(() => {
        // ネットワークエラーの場合はキャッシュから返す
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            
            // キャッシュにもない場合はオフライン用のレスポンス
            if (request.destination === 'document') {
              return caches.match('/')
            }
            
            return new Response('オフラインです', { status: 503 })
          })
      })
  )
})

// バックグラウンド同期（対応している場合）
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event:', event.tag)
  
  if (event.tag === 'lead-sync') {
    event.waitUntil(syncOfflineLeads())
  }
})

// オフラインリードの同期
async function syncOfflineLeads() {
  try {
    // IndexedDBからオフラインリードを取得
    const offlineLeads = await getOfflineLeads()
    
    for (const lead of offlineLeads) {
      try {
        // サーバーに送信
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lead)
        })

        if (response.ok) {
          // 成功したらオフラインストレージから削除
          await removeOfflineLead(lead.id)
          console.log('Offline lead synced successfully:', lead.id)
        }
      } catch (error) {
        console.error('Failed to sync offline lead:', error)
      }
    }
  } catch (error) {
    console.error('Error in background sync:', error)
  }
}

// IndexedDBからオフラインリードを取得（簡易実装）
async function getOfflineLeads() {
  // 実際の実装では IndexedDB を使用
  // ここでは簡易的に空配列を返す
  return []
}

// オフラインリードを削除（簡易実装）
async function removeOfflineLead(id) {
  // 実際の実装では IndexedDB から削除
  console.log('Removing offline lead:', id)
}

// プッシュ通知の処理
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received')
  
  if (event.data) {
    try {
      const data = event.data.json()
      const options = {
        body: data.body || '新しい通知があります',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: data.data || {},
        actions: data.actions || [],
        requireInteraction: true
      }

      event.waitUntil(
        self.registration.showNotification(data.title || 'ホームマート', options)
      )
    } catch (error) {
      console.error('Error parsing push data:', error)
      
      // フォールバック
      const options = {
        body: '新しい通知があります',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png'
      }

      event.waitUntil(
        self.registration.showNotification('ホームマート', options)
      )
    }
  }
})

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()
  
  if (event.action) {
    // アクションボタンがクリックされた場合
    console.log('Action clicked:', event.action)
  } else {
    // 通知自体がクリックされた場合
    event.waitUntil(
      clients.openWindow('/admin/leads')
    )
  }
})
