import { NextRequest, NextResponse } from 'next/server'

interface GoogleMapsResponse {
  results: Array<{
    formatted_address: string
    address_components: Array<{
      long_name: string
      short_name: string
      types: string[]
    }>
  }>
  status: string
}

interface AddressData {
  postalCode: string
  prefecture: string
  city: string
  town: string
  block: string
  full: string
  provider: 'google'
  formattedAddress: string
}

// Google Maps APIから住所情報を取得
const getAddressFromGoogleMaps = async (lat: number, lng: number): Promise<AddressData | null> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured')
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ja&key=${apiKey}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`)
    }

    const data: GoogleMapsResponse = await response.json()
    
    if (data.status !== 'OK' || !data.results || !data.results[0]) {
      throw new Error(`Google Maps API returned status: ${data.status}`)
    }

    const result = data.results[0]
    const components = result.address_components
    
    // 住所コンポーネントから詳細情報を抽出
    let postalCode = ''
    let prefecture = ''
    let city = ''
    let town = ''
    let block = ''
    
    components.forEach(component => {
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
    throw error
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

    const addressData = await getAddressFromGoogleMaps(lat, lng)
    
    if (!addressData) {
      return NextResponse.json(
        { error: 'Failed to get address information from Google Maps API.' },
        { status: 500 }
      )
    }

    return NextResponse.json(addressData)
  } catch (error) {
    console.error('Google Maps reverse geocoding error:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Google Maps API key is not configured' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
