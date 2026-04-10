import type { ReactNode } from 'react'

export const metadata = {
  title: 'Gatekeeper API',
  description: 'Gatekeeper Audio backend (Next.js)',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', margin: 24 }}>{children}</body>
    </html>
  )
}
