import { redirect } from 'next/navigation'

export default async function SuumoPropertyPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolved = await params
  redirect(`/properties-new/${resolved.id}`)
}
