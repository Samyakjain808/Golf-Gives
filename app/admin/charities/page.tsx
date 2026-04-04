import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CharitiesClient } from './CharitiesClient'

// Set revalidation if necessary or leave dynamic
export const dynamic = 'force-dynamic'

export default async function AdminCharitiesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    const { data: charities } = await supabase
        .from('charities')
        .select('*')
        .order('name', { ascending: true })

    return <CharitiesClient initialCharities={charities as any[] ?? []} />
}
