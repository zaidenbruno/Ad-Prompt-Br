import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '../components/AuthProvider';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Ad Prompt BR',
  description: 'Gerador de criativos e prompts para Meta Ads',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-[#121212] text-zinc-100 min-h-screen">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
