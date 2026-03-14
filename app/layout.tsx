import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '../components/AuthProvider';

export const metadata: Metadata = {
  title: 'AdPrompt BR',
  description: 'Gerador de criativos e prompts para Meta Ads',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
