import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GolfGives — Golf Subscriptions That Give Back',
  description: 'Subscribe, play golf, and donate to the charities that matter to you. Monthly prize draws for all active subscribers.',
  keywords: 'golf, charity, subscription, prize draw, Ireland',
  openGraph: {
    title: 'GolfGives — Golf Subscriptions That Give Back',
    description: 'Subscribe, play golf, and donate to the charities that matter to you.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
