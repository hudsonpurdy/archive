import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data: items, error } = await supabase
    .from('items')
    .select(`
      *,
      images (*)
    `)
    .order('created_at', { ascending: false })
    .order('display_order', { foreignTable: 'images', ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items })
}
