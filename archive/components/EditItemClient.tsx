'use client'

import { ItemForm } from '@/components/ItemForm'
import { ImageGallery } from '@/components/ImageGallery'
import { ImageUpload } from '@/components/ImageUpload'
import { ItemWithImages } from '@/types/archive'
import { useRouter } from 'next/navigation'

interface EditItemClientProps {
  item: ItemWithImages
}

export function EditItemClient({ item }: EditItemClientProps) {
  const router = useRouter()

  const handleUploadComplete = () => {
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Edit Item
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Item Details Form */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <ItemForm initialData={item} itemId={item.id} />
        </div>

        {/* Image Management Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Images
            </h2>
            <ImageGallery itemId={item.id} images={item.images || []} />
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
              Upload New Image
            </h3>
            <ImageUpload itemId={item.id} onUploadComplete={handleUploadComplete} />
          </div>
        </div>
      </main>
    </div>
  )
}
