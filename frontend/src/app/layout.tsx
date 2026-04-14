import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pay Me Back Agent',
  description: 'AI Agent to help you track debts and get paid on X Layer.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
