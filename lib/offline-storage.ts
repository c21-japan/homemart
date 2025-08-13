import { get, set, del, keys } from 'idb-keyval';

const DB_NAME = 'hm_offline';
const STORE_NAME = 'lead_queue';

// オフラインキューに保存するデータの型
export interface OfflineLeadData {
  id: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

// オフラインストレージの管理クラス
export class OfflineStorage {
  private static instance: OfflineStorage;
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    this.setupOnlineStatusListener();
  }

  public static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  // オンライン状態の監視
  private setupOnlineStatusListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // オンライン状態の確認
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // オフラインキューにデータを保存
  public async saveToOfflineQueue(data: any): Promise<string> {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineLeadData = {
      id,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    try {
      await set(id, offlineData);
      console.log('オフラインキューに保存しました:', id);
      return id;
    } catch (error) {
      console.error('オフラインキューへの保存に失敗しました:', error);
      throw error;
    }
  }

  // オフラインキューからデータを取得
  public async getFromOfflineQueue(id: string): Promise<OfflineLeadData | null> {
    try {
      return await get(id) || null;
    } catch (error) {
      console.error('オフラインキューからの取得に失敗しました:', error);
      return null;
    }
  }

  // オフラインキューの全データを取得
  public async getAllOfflineData(): Promise<OfflineLeadData[]> {
    try {
      const allKeys = await keys();
      const offlineKeys = allKeys.filter(key => 
        typeof key === 'string' && key.startsWith('offline_')
      ) as string[];

      const offlineData: OfflineLeadData[] = [];
      for (const key of offlineKeys) {
        const data = await get(key);
        if (data) {
          offlineData.push(data);
        }
      }

      return offlineData.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('オフラインキューの全データ取得に失敗しました:', error);
      return [];
    }
  }

  // オフラインキューからデータを削除
  public async removeFromOfflineQueue(id: string): Promise<void> {
    try {
      await del(id);
      console.log('オフラインキューから削除しました:', id);
    } catch (error) {
      console.error('オフラインキューからの削除に失敗しました:', error);
    }
  }

  // オフラインキューの全データを削除
  public async clearOfflineQueue(): Promise<void> {
    try {
      const allKeys = await keys();
      const offlineKeys = allKeys.filter(key => 
        typeof key === 'string' && key.startsWith('offline_')
      ) as string[];

      for (const key of offlineKeys) {
        await del(key);
      }
      console.log('オフラインキューをクリアしました');
    } catch (error) {
      console.error('オフラインキューのクリアに失敗しました:', error);
    }
  }

  // オフラインキューの件数を取得
  public async getOfflineQueueCount(): Promise<number> {
    try {
      const allKeys = await keys();
      return allKeys.filter(key => 
        typeof key === 'string' && key.startsWith('offline_')
      ).length;
    } catch (error) {
      console.error('オフラインキューの件数取得に失敗しました:', error);
      return 0;
    }
  }

  // オフラインデータの同期を試行
  public async syncOfflineData(): Promise<void> {
    if (!this.isOnline) {
      console.log('オフラインのため同期をスキップします');
      return;
    }

    const offlineData = await this.getAllOfflineData();
    if (offlineData.length === 0) {
      console.log('同期対象のオフラインデータがありません');
      return;
    }

    console.log(`${offlineData.length}件のオフラインデータを同期します`);

    for (const item of offlineData) {
      try {
        // ここで実際のAPI呼び出しを行う
        // 成功したらキューから削除
        await this.processOfflineItem(item);
        await this.removeFromOfflineQueue(item.id);
        console.log(`同期成功: ${item.id}`);
      } catch (error) {
        console.error(`同期失敗: ${item.id}`, error);
        // リトライ回数を増やし、一定回数以上なら削除
        item.retryCount++;
        if (item.retryCount >= 3) {
          await this.removeFromOfflineQueue(item.id);
          console.log(`リトライ上限に達したため削除: ${item.id}`);
        }
      }
    }
  }

  // 個別のオフラインアイテムを処理
  private async processOfflineItem(item: OfflineLeadData): Promise<void> {
    // 実際のAPI呼び出しをここに実装
    // 例: createLead APIの呼び出し
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error(`API呼び出しに失敗: ${response.status}`);
    }
  }

  // オフライン状態での保存を試行
  public async trySave(data: any): Promise<{ success: boolean; offlineId?: string; error?: string }> {
    if (this.isOnline) {
      return { success: true };
    }

    try {
      const offlineId = await this.saveToOfflineQueue(data);
      return { success: false, offlineId };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラー' 
      };
    }
  }
}

// シングルトンインスタンスをエクスポート
export const offlineStorage = OfflineStorage.getInstance();
