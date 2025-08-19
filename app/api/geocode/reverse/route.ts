import { NextRequest, NextResponse } from 'next/server'

interface AddressData {
  postalCode: string
  prefecture: string
  city: string
  town: string
  block: string
  full: string
  provider: 'google' | 'nominatim' | 'gsi'
  formattedAddress?: string
}

interface NominatimResponse {
  display_name: string
  address: {
    postcode?: string
    state?: string
    city?: string
    town?: string
    suburb?: string
    neighbourhood?: string
    house_number?: string
    road?: string
  }
}

interface GsiResponse {
  results: {
    muniCd: string
    lv01Nm: string
  }
}

// Google Maps APIから住所情報を取得
const getAddressFromGoogleMaps = async (lat: number, lng: number): Promise<AddressData | null> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    return null // APIキーがない場合はnullを返して次のAPIを試行
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ja&key=${apiKey}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results || !data.results[0]) {
      return null
    }

    const result = data.results[0]
    const components = result.address_components
    
    // 住所コンポーネントから詳細情報を抽出
    let postalCode = ''
    let prefecture = ''
    let city = ''
    let town = ''
    let block = ''
    
    components.forEach((component: any) => {
      const types = component.types
      const name = component.long_name
      
      if (types.includes('postal_code')) {
        postalCode = name
      } else if (types.includes('administrative_area_level_1')) {
        prefecture = name
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = name
      } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        town = name
      } else if (types.includes('street_number')) {
        block = name
      }
    })

    // 完全な住所を構築
    let full = result.formatted_address
    if (postalCode) {
      full = `〒${postalCode} ${full}`
    }

    return {
      postalCode,
      prefecture,
      city,
      town,
      block,
      full,
      provider: 'google' as const,
      formattedAddress: result.formatted_address
    }
  } catch (error) {
    console.error('Google Maps API error:', error)
    return null
  }
}

// 国土地理院の市区町村コードから都道府県・市区町村を取得
const getAddressFromMuniCode = (muniCd: string, lv01Nm: string): Partial<AddressData> => {
  // 市区町村コードの最初の2桁が都道府県コード
  const prefectureCode = muniCd.substring(0, 2)
  
  // 都道府県コードから都道府県名を取得
  const prefectureMap: { [key: string]: string } = {
    '01': '北海道', '02': '青森県', '03': '岩手県', '04': '宮城県', '05': '秋田県',
    '06': '山形県', '07': '福島県', '08': '茨城県', '09': '栃木県', '10': '群馬県',
    '11': '埼玉県', '12': '千葉県', '13': '東京都', '14': '神奈川県', '15': '新潟県',
    '16': '富山県', '17': '石川県', '18': '福井県', '19': '山梨県', '20': '長野県',
    '21': '岐阜県', '22': '静岡県', '23': '愛知県', '24': '三重県', '25': '滋賀県',
    '26': '京都府', '27': '大阪府', '28': '兵庫県', '29': '奈良県', '30': '和歌山県',
    '31': '鳥取県', '32': '島根県', '33': '岡山県', '34': '広島県', '35': '山口県',
    '36': '徳島県', '37': '香川県', '38': '愛媛県', '39': '高知県', '40': '福岡県',
    '41': '佐賀県', '42': '長崎県', '43': '熊本県', '44': '大分県', '45': '宮崎県',
    '46': '鹿児島県', '47': '沖縄県'
  }

  const prefecture = prefectureMap[prefectureCode] || ''
  const city = lv01Nm || ''

  return {
    prefecture,
    city,
    town: '',
    block: '',
    postalCode: ''
  }
}

// Nominatim APIから住所情報を取得
const getAddressFromNominatim = async (lat: number, lng: number): Promise<AddressData | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ja`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Homemart-Geocoding/1.0 (https://homemart.century21.group)',
        'Accept-Language': 'ja'
      }
    })

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data: NominatimResponse = await response.json()
    
    if (!data.address) {
      return null
    }

    const address = data.address
    
    // 住所コンポーネントを抽出
    const postalCode = address.postcode || ''
    const prefecture = address.state || ''
    const city = address.city || address.town || address.suburb || ''
    const town = address.neighbourhood || address.road || ''
    const block = address.house_number || ''

    // 完全な住所を構築
    let full = [postalCode, prefecture, city, town, block]
      .filter(Boolean)
      .join(' ')
    
    if (postalCode) {
      full = `〒${postalCode} ${full.replace(postalCode, '').trim()}`
    }

    return {
      postalCode,
      prefecture,
      city,
      town,
      block,
      full,
      provider: 'nominatim' as const
    }
  } catch (error) {
    console.error('Nominatim API error:', error)
    return null
  }
}

// 国土地理院APIから住所情報を取得
const getAddressFromGsi = async (lat: number, lng: number): Promise<AddressData | null> => {
  try {
    const url = `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`GSI API error: ${response.status}`)
    }

    const data: GsiResponse = await response.json()
    
    if (!data.results || !data.results.muniCd) {
      return null
    }

    const { muniCd, lv01Nm } = data.results
    const addressInfo = getAddressFromMuniCode(muniCd, lv01Nm)
    
    const full = [addressInfo.prefecture, addressInfo.city]
      .filter(Boolean)
      .join('')

    return {
      postalCode: '',
      prefecture: addressInfo.prefecture || '',
      city: addressInfo.city || '',
      town: addressInfo.town || '',
      block: addressInfo.block || '',
      full,
      provider: 'gsi' as const
    }
  } catch (error) {
    console.error('GSI API error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json()

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates. lat and lng must be numbers.' },
        { status: 400 }
      )
    }

    // 1. まずGoogle Maps APIを試行（最高精度）
    let addressData = await getAddressFromGoogleMaps(lat, lng)

    // 2. Google Mapsが失敗した場合はNominatim APIを試行
    if (!addressData) {
      addressData = await getAddressFromNominatim(lat, lng)
    }

    // 3. Nominatimも失敗した場合は国土地理院APIにフォールバック
    if (!addressData) {
      addressData = await getAddressFromGsi(lat, lng)
    }

    if (!addressData) {
      return NextResponse.json(
        { error: 'Failed to get address information from all APIs.' },
        { status: 500 }
      )
    }

    return NextResponse.json(addressData)
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
      )
  }
}
