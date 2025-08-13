// ホームマート PWA サービスワーカー
const CACHE_NAME = 'homemart-v1';
const STATIC_CACHE = 'homemart-static-v1';
const DYNAMIC_CACHE = 'homemart-dynamic-v1';

// キャッシュする静的アセット
const STATIC_ASSETS = [
  '/',
  '/leads/new',
  '/admin/leads',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// フェッチ時の処理（Stale-While-Revalidate戦略）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同じオリジンのリクエストのみ処理
  if (url.origin !== location.origin) {
    return;
  }

  // 画像やAPIリクエストは動的キャッシュ
  if (request.destination === 'image' || url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              // キャッシュから返す
              if (response) {
                // バックグラウンドでキャッシュを更新
                fetch(request)
                  .then((fetchResponse) => {
                    if (fetchResponse.ok) {
                      cache.put(request, fetchResponse.clone());
                    }
                  })
                  .catch(() => {
                    // ネットワークエラーは無視
                  });
                return response;
              }
              
              // キャッシュにない場合はネットワークから取得
              return fetch(request)
                .then((fetchResponse) => {
                  if (fetchResponse.ok) {
                    cache.put(request, fetchResponse.clone());
                  }
                  return fetchResponse;
                });
            });
        })
    );
    return;
  }

  // ページリクエストは静的キャッシュを優先
  if (request.destination === 'document') {
    event.respondWith(
      caches.open(STATIC_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              if (response) {
                // キャッシュから返す
                return response;
              }
              
              // キャッシュにない場合はネットワークから取得
              return fetch(request)
                .then((fetchResponse) => {
                  if (fetchResponse.ok) {
                    cache.put(request, fetchResponse.clone());
                  }
                  return fetchResponse;
                });
            });
        })
    );
    return;
  }

  // その他のリクエストはネットワークファースト
  event.respondWith(
    fetch(request)
      .catch(() => {
        // ネットワークエラー時はキャッシュから取得を試行
        return caches.match(request);
      })
  );
});

// バックグラウンド同期（オフライン時のデータ同期）
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'lead-sync') {
    event.waitUntil(
      syncOfflineLeads()
    );
  }
});

// オフラインリードの同期処理
async function syncOfflineLeads() {
  try {
    // IndexedDBからオフラインキューを取得
    const offlineData = await getOfflineLeads();
    
    if (offlineData.length === 0) {
      console.log('Service Worker: No offline leads to sync');
      return;
    }

    console.log(`Service Worker: Syncing ${offlineData.length} offline leads`);

    for (const lead of offlineData) {
      try {
        // APIに送信
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lead.data),
        });

        if (response.ok) {
          // 成功時はキューから削除
          await removeOfflineLead(lead.id);
          console.log('Service Worker: Lead synced successfully', lead.id);
          
          // 成功通知を送信
          self.registration.showNotification('同期完了', {
            body: 'オフラインで保存した顧客情報が同期されました',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'lead-sync-success'
          });
        } else {
          console.error('Service Worker: Failed to sync lead', lead.id, response.status);
        }
      } catch (error) {
        console.error('Service Worker: Error syncing lead', lead.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error in syncOfflineLeads', error);
  }
}

// IndexedDBからオフラインリードを取得
async function getOfflineLeads() {
  // 実際の実装では、IndexedDBからデータを取得
  // ここでは簡略化のため空配列を返す
  return [];
}

// IndexedDBからオフラインリードを削除
async function removeOfflineLead(id) {
  // 実際の実装では、IndexedDBからデータを削除
  console.log('Service Worker: Removing offline lead', id);
}

// プッシュ通知の処理
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || '新しい通知があります',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'notification',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'ホームマート', options)
    );
  }
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.notification.tag);
  
  event.notification.close();
  
  if (event.action) {
    // アクションボタンがクリックされた場合の処理
    console.log('Service Worker: Action clicked', event.action);
  } else {
    // 通知自体がクリックされた場合
    event.waitUntil(
      clients.openWindow('/admin/leads')
    );
  }
});

// メッセージ受信時の処理
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
