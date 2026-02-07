'use client'

import { useParams } from 'next/navigation'
import PropertyDetailPage from '@/components/PropertyDetailPage'

export default function PropertiesNewDetailPage() {
  const params = useParams()
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id

  if (!rawId || typeof rawId !== 'string') return null

  return <PropertyDetailPage propertyId={`suumo-${rawId}`} />
}
