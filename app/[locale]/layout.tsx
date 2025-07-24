import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  
  return (
    <html lang={locale}>
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <NextIntlClientProvider messages={messages}>
          <ResponsiveHeader />
          <main style={{
            flex: 1,
            width: '100%',
            backgroundColor: '#f5f5f5'
          }}>
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}