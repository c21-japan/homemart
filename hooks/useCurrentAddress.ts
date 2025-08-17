import { useState, useCallback } from 'react'

export interface AddressData {
  postalCode: string
  prefecture: string
  city: string
  town: string
  block: string
  full: string
  provider: 'google' | 'nominatim' | 'gsi'
  formattedAddress?: string
}

interface UseCurrentAddressReturn {
  address: AddressData | null
  loading: boolean
  error: string | null
  getCurrentAddress: () => Promise<void>
  clearAddress: () => void
}

export const useCurrentAddress = (): UseCurrentAddressReturn => {
  const [address, setAddress] = useState<AddressData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentAddress = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // 位置情報の取得
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

      // 逆ジオコーディングAPIを呼び出し
      const response = await fetch('/api/geocode/reverse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: latitude,
          lng: longitude
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get address information')
      }

      const addressData: AddressData = await response.json()
      setAddress(addressData)
    } catch (err) {
      let errorMessage = '位置情報の取得に失敗しました'
      
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = '位置情報の使用が許可されていません。ブラウザの設定で位置情報を許可してください。'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません。'
            break
          case err.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました。'
            break
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setAddress(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearAddress = useCallback(() => {
    setAddress(null)
    setError(null)
  }, [])

  return {
    address,
    loading,
    error,
    getCurrentAddress,
    clearAddress
  }
}
