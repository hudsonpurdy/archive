import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const itemId = formData.get('itemId') as string
    const isPrimary = formData.get('isPrimary') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!itemId) {
      return NextResponse.json({ error: 'No item ID provided' }, { status: 400 })
    }

    // Get the auth token from the request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create authenticated Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user owns the item
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (item.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${itemId}/${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('item-images')
      .getPublicUrl(fileName)

    // Get image dimensions if it's an image
    const width: number | null = null
    const height: number | null = null

    if (file.type.startsWith('image/')) {
      // We'll set these on the client side for now
      // In production, you might want to use a library to get dimensions server-side
    }

    // If this is set as primary, unset other primary images
    if (isPrimary) {
      await supabase
        .from('images')
        .update({ is_primary: false })
        .eq('item_id', itemId)
    }

    // Create image record in database
    const { data: imageRecord, error: dbError } = await supabase
      .from('images')
      .insert({
        item_id: itemId,
        url: publicUrl,
        is_primary: isPrimary,
        file_size: file.size,
        width,
        height,
        alt_text: `${file.name}`,
      })
      .select()
      .single()

    if (dbError) {
      // If database insert fails, try to clean up the uploaded file
      await supabase.storage.from('item-images').remove([fileName])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      image: imageRecord,
      url: publicUrl
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
