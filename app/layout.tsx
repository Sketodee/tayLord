import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from './components/SessionProvider';
import ThemeProvider from './theme/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Designer Measurement App',
  description: 'Manage client measurements efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
        attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
<SessionProvider>{children}</SessionProvider>
        </ThemeProvider>  
      </body>
    </html>
  );
}