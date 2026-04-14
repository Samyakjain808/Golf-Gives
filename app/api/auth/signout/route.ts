import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    const cookieStore = await cookies()

    // We need to track what cookies get modified during signOut
    // so we can propagate them onto the redirect response.
    const cookieUpdates: { name: string; value: string; options?: any }[] = []

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    // Collect cookie changes instead of writing to cookieStore
                    // (which won't propagate to the redirect response)
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieUpdates.push({ name, value, options })
                    })
                },
            },
        }
    )

    await supabase.auth.signOut()

    // Redirect to the root exactly matching the incoming host and port
    const response = NextResponse.redirect(new URL('/', request.url), {
        status: 302,
    })

    // Apply all cookie deletions/changes to the redirect response
    for (const { name, value, options } of cookieUpdates) {
        response.cookies.set(name, value, options)
    }

    return response
}
