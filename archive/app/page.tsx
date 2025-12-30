import { supabase } from '@/lib/supabase'
import { ItemWithImages } from '@/types/archive'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 0

export default async function Home() {
  const { data: items } = await supabase
    .from('items')
    .select(`
      *,
      images (*)
    `)
    .order('created_at', { ascending: false })
    .order('display_order', { foreignTable: 'images', ascending: true })
    .returns<ItemWithImages[]>()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Archive Collection
            </h1>
            <Link
              href="/items/new"
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              Add Item
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!items || items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400">
              No items in the collection yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const primaryImage = item.images?.find(img => img.is_primary)
              const firstImage = item.images?.[0]
              const displayImage = primaryImage || firstImage

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow"
                >
                  {displayImage ? (
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                      <Image
                        src={displayImage.url}
                        alt={displayImage.alt_text || `${item.brand} ${item.item_name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <div className="text-zinc-400 text-sm">No image</div>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {item.brand}
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {item.item_name}
                        </p>
                      </div>
                      {item.is_for_sale && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium">
                          For Sale
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.season && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {item.season}
                        </span>
                      )}
                      {item.year && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {item.year}
                        </span>
                      )}
                      {item.size && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Size {item.size}
                        </span>
                      )}
                      {item.condition && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                          {item.condition}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.asking_price && (
                      <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          ${item.asking_price.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
