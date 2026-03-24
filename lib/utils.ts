import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCents(cents: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(cents / 100)
}

export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

export function formatMonth(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IE', {
        month: 'long',
        year: 'numeric',
    })
}

export function getStatusColor(status: string): string {
    const map: Record<string, string> = {
        active: 'text-emerald-400',
        inactive: 'text-gray-400',
        cancelled: 'text-red-400',
        lapsed: 'text-orange-400',
        pending: 'text-yellow-400',
        approved: 'text-emerald-400',
        rejected: 'text-red-400',
        paid: 'text-emerald-400',
        published: 'text-sky-400',
        simulated: 'text-purple-400',
    }
    return map[status] ?? 'text-gray-400'
}

export function getStatusBg(status: string): string {
    const map: Record<string, string> = {
        active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        inactive: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
        cancelled: 'bg-red-500/10 text-red-400 border border-red-500/30',
        lapsed: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
        pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
        approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        rejected: 'bg-red-500/10 text-red-400 border border-red-500/30',
        paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        published: 'bg-sky-500/10 text-sky-400 border border-sky-500/30',
        simulated: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
        trialing: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    }
    return map[status] ?? 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
}
