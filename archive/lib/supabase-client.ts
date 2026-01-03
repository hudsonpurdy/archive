import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton browser client instance
let browserClient: SupabaseClient | null = null

// Client-side Supabase client (for use in components)
export const createBrowserClient = () => {
  if (browserClient) {
    return browserClient
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return browserClient
}

// Server-side Supabase client (for use in server components and API routes)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
