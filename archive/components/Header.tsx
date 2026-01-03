'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-client'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Archive Collection
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/items/new"
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              Add Item
            </Link>
            {user ? (
              <div className="px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Welcome, {user.email?.split('@')[0]}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
