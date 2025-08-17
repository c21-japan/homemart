export interface LocationData {
  latitude: number
  longitude: number
  address: string
}

/**
 * 現在地の位置情報を取得し、住所情報も含めて返す
 */
export const getCurrentLocationWithAddress = async (): Promise<LocationData | null> => {
  try {
    // GPS位置情報を取得
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'))
        return
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      })
    })

    const { latitude, longitude } = position.coords

    // 住所情報を取得（逆ジオコーディング）
    let address = '位置情報を取得しました'
    try {
      // 国土地理院の逆ジオコーディングAPI（無料）
      const response = await fetch(
        `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${latitude}&lon=${longitude}`
      )
      const data = await response.json()
      if (data.results && data.results[0] && data.results[0].muni) {
        const result = data.results[0]
        address = `${result.pref}${result.muni}${result.local}`
      } else {
        address = `緯度: ${latitude.toFixed(6)}, 経度: ${longitude.toFixed(6)}`
      }
    } catch (error) {
      console.warn('Address lookup failed:', error)
      address = `緯度: ${latitude.toFixed(6)}, 経度: ${longitude.toFixed(6)}`
    }

    return {
      latitude,
      longitude,
      address
    }
  } catch (error) {
    console.error('Error getting location:', error)
    throw error
  }
}

/**
 * 位置情報取得エラーのメッセージを取得
 */
export const getLocationErrorMessage = (error: any): string => {
  let errorMessage = '位置情報の取得に失敗しました'
  
  if (error instanceof GeolocationPositionError) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = '位置情報の使用が許可されていません。ブラウザの設定で位置情報を許可してください。'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = '位置情報が利用できません。'
        break
      case error.TIMEOUT:
        errorMessage = '位置情報の取得がタイムアウトしました。'
        break
    }
  }
  
  return errorMessage
}
