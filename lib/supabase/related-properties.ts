import { supabase } from '@/lib/supabase';

interface Property {
  id: string;
  title: string;
  price: number;
  property_type: string;
  prefecture: string;
  city: string;
  address: string;
  land_area?: number;
  building_area?: number;
  image_url?: string;
  images?: string[];
}

export async function getRelatedProperties(
  currentProperty: Property,
  limit: number = 10
): Promise<Property[]> {
  try {
    // 現在の物件と同じエリアの物件を取得
    const { data: areaProperties, error: areaError } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'published')
      .eq('prefecture', currentProperty.prefecture)
      .eq('city', currentProperty.city)
      .neq('id', currentProperty.id)
      .limit(limit * 2); // エリアで絞り込んだ後、さらに絞り込むため多めに取得

    if (areaError) throw areaError;

    if (!areaProperties || areaProperties.length === 0) {
      // エリアで見つからない場合は、都道府県レベルで検索
      const { data: prefectureProperties, error: prefectureError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .eq('prefecture', currentProperty.prefecture)
        .neq('id', currentProperty.id)
        .limit(limit * 2);

      if (prefectureError) throw prefectureError;
      if (!prefectureProperties) return [];

      return calculateSimilarityAndSort(prefectureProperties, currentProperty, limit);
    }

    return calculateSimilarityAndSort(areaProperties, currentProperty, limit);
  } catch (error) {
    console.error('Error fetching related properties:', error);
    return [];
  }
}

function calculateSimilarityAndSort(
  properties: Property[],
  currentProperty: Property,
  limit: number
): Property[] {
  // 各物件の類似度スコアを計算
  const scoredProperties = properties.map(property => {
    let score = 0;

    // 1. 住所の類似度（都道府県・市区町村が同じ）
    if (property.prefecture === currentProperty.prefecture) score += 100;
    if (property.city === currentProperty.city) score += 50;

    // 2. 物件価格の類似度（価格差が小さいほど高スコア）
    const priceDiff = Math.abs(property.price - currentProperty.price);
    const priceSimilarity = Math.max(0, 100 - (priceDiff / currentProperty.price) * 100);
    score += priceSimilarity * 0.3;

    // 3. 建物面積の類似度（建物がある場合のみ）
    if (currentProperty.building_area && property.building_area) {
      const buildingAreaDiff = Math.abs(property.building_area - currentProperty.building_area);
      const buildingAreaSimilarity = Math.max(0, 100 - (buildingAreaDiff / currentProperty.building_area) * 100);
      score += buildingAreaSimilarity * 0.2;
    }

    // 4. 土地面積の類似度
    if (currentProperty.land_area && property.land_area) {
      const landAreaDiff = Math.abs(property.land_area - currentProperty.land_area);
      const landAreaSimilarity = Math.max(0, 100 - (landAreaDiff / currentProperty.land_area) * 100);
      score += landAreaSimilarity * 0.2;
    }

    // 5. 物件種別の一致
    if (property.property_type === currentProperty.property_type) score += 30;

    return { ...property, score };
  });

  // スコアで降順ソートして上位limit件を返す
  return scoredProperties
    .sort((a, b) => (b as Property & { score: number }).score - (a as Property & { score: number }).score)
    .slice(0, limit)
    .map(({ score, ...property }) => property); // スコアを除去して返す
}
