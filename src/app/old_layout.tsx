import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
// import { SessionTracker } from '../components/SessionTracker'
// import { SessionWarning } from '../components/SessionWarning'
import { QueryProvider } from '../components/QueryProvider'
import { ThemeProvider } from '../components/ThemeProvider'
import { StoreHydration } from '../components/StoreHydration'
import { LayoutContent } from '../components/LayoutContent'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Escrow Application',
  description: 'Secure escrow management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <StoreHydration>
          <QueryProvider>
            <ThemeProvider>
              <LayoutContent>
                {children}
              </LayoutContent>
              {/* <SessionTracker />
              <SessionWarning /> */}
            </ThemeProvider>
          </QueryProvider>
        </StoreHydration>
      </body>
    </html>
  )
}
