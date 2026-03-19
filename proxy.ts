import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  // Debug line: This will show up in your TERMINAL (not browser console)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          const secureOptions = {
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
          }

          request.cookies.set({ name, value, ...secureOptions })

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          response.cookies.set({ name, value, ...secureOptions })
        },
        remove(name: string, options: CookieOptions) {
          const secureOptions = {
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
          }

          request.cookies.set({ name, value: "", ...secureOptions })

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          response.cookies.set({ name, value: "", ...secureOptions })
        }
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. Logic for root path
  if (request.nextUrl.pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('https://taskflowtool.vercel.app/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  // This ensures the middleware runs for the home page
  matcher: ['/'],
}