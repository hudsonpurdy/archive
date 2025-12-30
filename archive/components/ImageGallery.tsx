'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-client'
import { Image as ImageType } from '@/types/archive'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ImageGalleryProps {
  itemId: string
  images: ImageType[]
}

export function ImageGallery({ itemId, images }: ImageGalleryProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return
    }

    setDeleting(imageId)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('You must be logged in to delete images')
        setDeleting(null)
        return
      }

      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ imageId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      router.refresh()
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('You must be logged in')
        return
      }

      // Unset all primary images for this item
      await supabase
        .from('images')
        .update({ is_primary: false })
        .eq('item_id', itemId)

      // Set this image as primary
      await supabase
        .from('images')
        .update({ is_primary: true })
        .eq('id', imageId)

      router.refresh()
    } catch (err) {
      console.error('Set primary error:', err)
      setError(err instanceof Error ? err.message : 'Failed to set primary image')
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm">
        No images uploaded yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden"
          >
            <Image
              src={image.url}
              alt={image.alt_text || 'Item image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />

            {image.is_primary && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                Primary
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!image.is_primary && (
                <button
                  onClick={() => handleSetPrimary(image.id)}
                  className="px-3 py-1.5 bg-white text-zinc-900 text-xs font-medium rounded hover:bg-zinc-100"
                >
                  Set Primary
                </button>
              )}
              <button
                onClick={() => handleDelete(image.id)}
                disabled={deleting === image.id}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting === image.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
