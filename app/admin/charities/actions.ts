'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCharity(formData: FormData) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const website_url = formData.get('website_url') as string
    const is_featured = formData.get('is_featured') === 'true'
    const is_active = formData.get('is_active') === 'true'

    const { error } = await supabase.from('charities').insert({
        name,
        category,
        website_url,
        country: 'IN', // Default to India
        is_featured,
        is_active,
    })

    if (error) throw new Error(error.message)

    revalidatePath('/admin/charities')
}

export async function updateCharity(formData: FormData) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const website_url = formData.get('website_url') as string
    const is_featured = formData.get('is_featured') === 'true'
    const is_active = formData.get('is_active') === 'true'

    const { error } = await supabase.from('charities').update({
        name,
        category,
        website_url,
        is_featured,
        is_active,
    }).eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/charities')
}
