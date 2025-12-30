'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase-client'
import Image from 'next/image'

interface ImageUploadProps {
  itemId: string
  onUploadComplete?: (imageUrl: string) => void
  isPrimary?: boolean
}

export function ImageUpload({ itemId, onUploadComplete, isPrimary = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createBrowserClient()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('You must be logged in to upload images')
        setUploading(false)
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('itemId', itemId)
      formData.append('isPrimary', isPrimary.toString())

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      if (onUploadComplete) {
        onUploadComplete(data.url)
      }

      // Reset preview after successful upload
      setTimeout(() => {
        setPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 1000)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-zinc-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-zinc-100 file:text-zinc-700
            hover:file:bg-zinc-200
            dark:file:bg-zinc-800 dark:file:text-zinc-300
            dark:hover:file:bg-zinc-700
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {preview && (
        <div className="relative w-full h-48 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-sm">Uploading...</div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {uploading && !preview && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Uploading...
        </div>
      )}
    </div>
  )
}
