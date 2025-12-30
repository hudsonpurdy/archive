export interface Item {
  id: string
  created_at: string
  updated_at: string
  user_id: string

  // Basic Information
  brand: string
  item_name: string
  category?: string | null
  season?: string | null
  year?: number | null

  // Identification
  style_code?: string | null
  colorway?: string | null
  size?: string | null

  // Acquisition Details
  purchase_date?: string | null
  purchase_price?: number | null
  purchase_location?: string | null
  condition?: string | null

  // Additional Details
  description?: string | null
  notes?: string | null
  tags?: string[] | null

  // Collection Management
  is_for_sale?: boolean
  asking_price?: number | null
  location?: string | null
}

export interface Image {
  id: string
  created_at: string
  item_id: string

  // Image Details
  url: string
  is_primary: boolean
  display_order: number

  // Optional Metadata
  alt_text?: string | null
  file_size?: number | null
  width?: number | null
  height?: number | null
}

// Type for items with their images loaded
export interface ItemWithImages extends Item {
  images?: Image[]
}

export type NewItem = Omit<Item, 'id' | 'created_at' | 'updated_at' | 'user_id'>
export type NewImage = Omit<Image, 'id' | 'created_at'>
