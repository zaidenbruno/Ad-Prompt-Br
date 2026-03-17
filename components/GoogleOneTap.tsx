'use client';

import { useGoogleOneTapLogin } from '@react-oauth/google';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function GoogleOneTap() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      if (credentialResponse.credential) {
        try {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: credentialResponse.credential,
          });
          
          if (error) throw error;
          
          if (data.user) {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Erro no One Tap Login:', error);
        }
      }
    },
    onError: () => {
      console.error('Google One Tap Login falhou');
    },
    disabled: loading || !!user, // Desabilita se já estiver logado ou carregando
    use_fedcm_for_prompt: true, // Usa a nova API do Chrome para melhor UX
  });

  return null; // O One Tap é um popup nativo do Google, não renderiza UI aqui
}
