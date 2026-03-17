import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '../components/AuthProvider';
import { Navbar } from '../components/Navbar';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleOneTap } from '../components/GoogleOneTap';

export const metadata: Metadata = {
  title: 'Ad Prompt BR',
  description: 'Gerador de criativos e prompts para Meta Ads',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-[#121212] text-zinc-100 min-h-screen">
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <GoogleOneTap />
            <Navbar />
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
