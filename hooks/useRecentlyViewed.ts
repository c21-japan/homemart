'use client';

import { useState, useEffect } from 'react';

interface Property {
  id: string;
  name: string;
  price: number;
  property_type: string;
  address: string;
  image_url?: string;
  images?: string[];
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([]);

  useEffect(() => {
    // ローカルストレージから最近見た物件を読み込み
    const stored = localStorage.getItem('recentlyViewedProperties');
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recently viewed properties:', error);
      }
    }
  }, []);

  const addRecentlyViewed = (property: Property) => {
    setRecentlyViewed(prev => {
      // 既存の物件を除外
      const filtered = prev.filter(p => p.id !== property.id);
      // 新しい物件を先頭に追加
      const updated = [property, ...filtered];
      // 最大5件まで保持
      const limited = updated.slice(0, 5);
      
      // ローカルストレージに保存
      localStorage.setItem('recentlyViewedProperties', JSON.stringify(limited));
      
      return limited;
    });
  };

  return { recentlyViewed, addRecentlyViewed };
}
