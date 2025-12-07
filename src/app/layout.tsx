import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '../components/QueryProvider'
import { ThemeProvider } from '../components/ThemeProvider'
import { StoreHydration } from '../components/StoreHydration'
import { LayoutContent } from '../components/LayoutContent'
import { ComplianceProvider } from '../components/ComplianceProvider'
import { ReactivePermissionsProvider } from '../components/ReactivePermissionsProvider'
import { EnhancedSessionTracker } from '../components/EnhancedSessionTracker'
import { GlobalConfirmationDialog } from '../components/providers/GlobalConfirmationDialog'
import { GlobalNotificationProvider } from '../components/providers/GlobalNotificationProvider'
import { NavigationProvider } from '../components/providers/NavigationProvider'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('escrow-store');
                  if (stored) {
                    const parsed = JSON.parse(stored);
                    const themeValue = parsed.state?.theme || 'light';
                    let resolvedTheme = themeValue;
                    
                    if (themeValue === 'system') {
                      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
                        ? 'dark' 
                        : 'light';
                    }
                    
                    if (resolvedTheme === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {
                  // Silent fail
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        <NavigationProvider>
          <StoreHydration>
            <QueryProvider>
              <ComplianceProvider
                showLoadingUI={true}
                enableDetailedLogging={process.env.NODE_ENV === 'development'}
              >
                <ReactivePermissionsProvider>
                  <ThemeProvider>
                    <LayoutContent>{children}</LayoutContent>
                    <EnhancedSessionTracker />
                    <GlobalConfirmationDialog />
                    <GlobalNotificationProvider />
                  </ThemeProvider>
                </ReactivePermissionsProvider>
              </ComplianceProvider>
            </QueryProvider>
          </StoreHydration>
        </NavigationProvider>
      </body>
    </html>
  )
}
