import { EditItemClient } from '@/components/EditItemClient'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: item } = await supabase
    .from('items')
    .select(`
      *,
      images (*)
    `)
    .eq('id', id)
    .order('display_order', { foreignTable: 'images', ascending: true })
    .single()

  if (!item) {
    notFound()
  }

  return <EditItemClient item={item} />
}
