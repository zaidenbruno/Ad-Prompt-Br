'use client';

import { useAuth } from '../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PlansPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!user) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
      } catch (error: any) {
        alert(error.message || 'Erro no login com Google');
      }
      return;
    }
    
    // Placeholder para integração com Stripe
    alert('Integração com Stripe em breve! Você será redirecionado para o checkout.');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#121212] text-zinc-100 font-sans selection:bg-rose-500/30 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Escolha o plano ideal para você
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Escale seus resultados com criativos que convertem. Sem fidelidade, cancele quando quiser.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-[#1A1A1A] border border-zinc-800 p-8 rounded-3xl flex flex-col">
            <h3 className="text-2xl font-bold text-white mb-2">Iniciante</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-white">Grátis</span>
            </div>
            <p className="text-zinc-400 mb-8">Perfeito para testar a ferramenta e ver o poder da IA.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-zinc-600 shrink-0" />
                <span>5 gerações por mês</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-zinc-600 shrink-0" />
                <span>Copys básicas</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-zinc-600 shrink-0" />
                <span>Ganchos padrão</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-zinc-600 shrink-0" />
                <span>Histórico de 7 dias</span>
              </li>
            </ul>

            <button 
              onClick={() => user ? router.push('/dashboard') : handleSubscribe()} 
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
            >
              {user ? 'Ir para o Dashboard' : 'Começar grátis'}
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-rose-900/40 to-[#1A1A1A] border border-rose-500/30 p-8 rounded-3xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Mais popular
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro Viral</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-white">R$ 29,90</span>
              <span className="text-zinc-400">/mês</span>
            </div>
            <p className="text-zinc-400 mb-8">Para gestores e donos de negócio que querem escalar.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-zinc-100">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                <span className="font-bold">Gerações ilimitadas</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                <span>Copys avançadas e persuasivas</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                <span>Ganchos virais de alta retenção</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                <span>Prompts detalhados para Midjourney</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                <span>Histórico vitalício</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                <span>Prioridade na fila da IA</span>
              </li>
            </ul>

            <button 
              onClick={handleSubscribe} 
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_-5px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_-5px_rgba(225,29,72,0.6)] flex items-center justify-center gap-2"
            >
              Assinar agora
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-zinc-500 text-sm">
            Pagamento seguro via Stripe. Cancele a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
}
