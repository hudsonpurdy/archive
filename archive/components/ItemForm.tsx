'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-client'
import { NewItem } from '@/types/archive'
import { useRouter } from 'next/navigation'

interface ItemFormProps {
  initialData?: Partial<NewItem>
  itemId?: string
}

export function ItemForm({ initialData, itemId }: ItemFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<NewItem>>(initialData || {
    brand: '',
    item_name: '',
    category: null,
    season: null,
    year: null,
    style_code: null,
    colorway: null,
    size: null,
    purchase_date: null,
    purchase_price: null,
    purchase_location: null,
    condition: null,
    description: null,
    notes: null,
    tags: [],
    is_for_sale: false,
    asking_price: null,
    location: null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('You must be logged in to create items')
        setSaving(false)
        return
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        user_id: session.user.id,
      }

      if (itemId) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('items')
          .update(submitData)
          .eq('id', itemId)

        if (updateError) throw updateError

        setSaving(false)
        router.push('/')
        router.refresh()
      } else {
        // Create new item
        const { data: newItem, error: insertError } = await supabase
          .from('items')
          .insert(submitData)
          .select()
          .single()

        if (insertError) throw insertError

        if (!newItem) {
          throw new Error('No item returned from insert')
        }

        setSaving(false)
        // Redirect to edit page to upload images
        router.push(`/items/${newItem.id}/edit`)
        router.refresh()
      }
    } catch (err) {
      console.error('Save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save item')
      setSaving(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : null) :
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'date' ? (value || null) :
              value || null,
    }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, tags }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Brand *
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              required
              value={formData.brand || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="item_name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              id="item_name"
              name="item_name"
              required
              value={formData.item_name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              placeholder="e.g., jacket, pants, shirt, shoes"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="season" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Season
            </label>
            <input
              type="text"
              id="season"
              name="season"
              value={formData.season || ''}
              onChange={handleChange}
              placeholder="e.g., FW2023, SS2019"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="size" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Size
            </label>
            <input
              type="text"
              id="size"
              name="size"
              value={formData.size || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="colorway" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Colorway
            </label>
            <input
              type="text"
              id="colorway"
              name="colorway"
              value={formData.colorway || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="style_code" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Style Code
            </label>
            <input
              type="text"
              id="style_code"
              name="style_code"
              value={formData.style_code || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Condition
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="used-excellent">Used - Excellent</option>
              <option value="used-good">Used - Good</option>
              <option value="used-fair">Used - Fair</option>
              <option value="vintage">Vintage</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags?.join(', ') || ''}
            onChange={handleTagsChange}
            placeholder="e.g., grail, archive, vintage"
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>
      </div>

      {/* Acquisition Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Acquisition Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="purchase_date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              id="purchase_date"
              name="purchase_date"
              value={formData.purchase_date || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="purchase_price" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Purchase Price
            </label>
            <input
              type="number"
              id="purchase_price"
              name="purchase_price"
              step="0.01"
              value={formData.purchase_price || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="purchase_location" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Purchase Location
            </label>
            <input
              type="text"
              id="purchase_location"
              name="purchase_location"
              value={formData.purchase_location || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
        </div>
      </div>

      {/* Sale Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Sale Information
        </h3>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_for_sale"
            name="is_for_sale"
            checked={formData.is_for_sale || false}
            onChange={handleChange}
            className="w-4 h-4 text-zinc-900 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded focus:ring-2 focus:ring-zinc-500"
          />
          <label htmlFor="is_for_sale" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Item is for sale
          </label>
        </div>

        {formData.is_for_sale && (
          <div>
            <label htmlFor="asking_price" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Asking Price
            </label>
            <input
              type="number"
              id="asking_price"
              name="asking_price"
              step="0.01"
              value={formData.asking_price || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Additional Details
        </h3>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Storage Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            placeholder="Where the item is stored"
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : itemId ? 'Update Item' : 'Create Item'}
        </button>
      </div>
    </form>
  )
}
