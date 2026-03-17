'use client';

import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Zap, Clock, TrendingUp, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleCtaClick = async () => {
    if (user) {
      router.push('/dashboard');
    } else {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'https://ad-prompt-br.vercel.app',
            queryParams: {
              prompt: 'select_account'
            }
          }
        });
        if (error) throw error;
      } catch (error: any) {
        alert(error.message || 'Erro no login com Google');
      }
    }
  };

  const handleSubscribeClick = async () => {
    if (!user) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'https://ad-prompt-br.vercel.app',
            queryParams: {
              prompt: 'select_account'
            }
          }
        });
        if (error) throw error;
      } catch (error: any) {
        alert(error.message || 'Erro no login com Google');
      }
      return;
    }
    
    const hotmartUrl = new URL('https://pay.hotmart.com/W104924135B');
    if (user.email) {
      hotmartUrl.searchParams.append('email', user.email);
    }
    window.location.href = hotmartUrl.toString();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 font-sans selection:bg-rose-500/30">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/20 via-[#121212] to-[#121212] -z-10"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium mb-4">
            <SparklesIcon className="w-4 h-4" />
            <span>A revolução dos anúncios chegou</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Crie anúncios virais para <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
              Meta Ads em segundos
            </span> com IA
          </h1>
          <p className="text-lg md:text-xl font-bold text-rose-100 max-w-3xl mx-auto leading-relaxed bg-rose-900/20 border border-rose-500/20 p-4 rounded-2xl">
            Diferente do ChatGPT genérico, o AdPrompt BR já vem treinado com estrutura que converte no Brasil: gírias reais, urgência local, CTA matador e prompts prontos pra imagem.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleCtaClick}
              className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-lg transition-all transform hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(225,29,72,0.5)] flex items-center justify-center gap-2"
            >
              Testar a IA grátis agora
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              href="/plans"
              className="w-full sm:w-auto px-8 py-4 bg-[#1A1A1A] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-2xl font-bold text-lg transition-all flex items-center justify-center"
            >
              Ver planos
            </Link>
          </div>
          <p className="text-sm text-zinc-500 mt-4">Não precisa de cartão de crédito para testar.</p>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 border-y border-zinc-800/50 bg-[#151515]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-white mb-2">+2M</div>
              <div className="text-sm text-zinc-400 font-medium uppercase tracking-wider">Criativos Gerados</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">3.5x</div>
              <div className="text-sm text-zinc-400 font-medium uppercase tracking-wider">Aumento no CTR</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">-40%</div>
              <div className="text-sm text-zinc-400 font-medium uppercase tracking-wider">Custo por Clique</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">10k+</div>
              <div className="text-sm text-zinc-400 font-medium uppercase tracking-wider">Negócios Locais</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Por que o Ad Prompt BR funciona?</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">Nossa IA foi treinada com os melhores anúncios do mercado brasileiro para entregar resultados reais.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#1A1A1A] border border-zinc-800 p-8 rounded-3xl hover:border-rose-500/30 transition-colors group">
            <div className="w-14 h-14 bg-rose-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Adeus, ChatGPT genérico</h3>
            <p className="text-zinc-400 leading-relaxed">Pare de perder tempo escrevendo prompt do zero. Aqui a IA já sabe exatamente o que funciona pra loja física, WhatsApp e Meta Ads BR.</p>
          </div>
          <div className="bg-[#1A1A1A] border border-zinc-800 p-8 rounded-3xl hover:border-rose-500/30 transition-colors group">
            <div className="w-14 h-14 bg-rose-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Geração em segundos</h3>
            <p className="text-zinc-400 leading-relaxed">Pare de encarar a tela em branco. Tenha dezenas de ideias de anúncios prontas em menos de 10 segundos.</p>
          </div>
          <div className="bg-[#1A1A1A] border border-zinc-800 p-8 rounded-3xl hover:border-rose-500/30 transition-colors group">
            <div className="w-14 h-14 bg-rose-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Copy + Prompts prontos</h3>
            <p className="text-zinc-400 leading-relaxed">Receba a copy persuasiva, ganchos virais e os prompts exatos para gerar as imagens no Midjourney.</p>
          </div>
          <div className="bg-[#1A1A1A] border border-zinc-800 p-8 rounded-3xl hover:border-rose-500/30 transition-colors group">
            <div className="w-14 h-14 bg-rose-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Foco no Brasil</h3>
            <p className="text-zinc-400 leading-relaxed">Linguagem adaptada para o público BR, com gírias e gatilhos que funcionam no nosso mercado local.</p>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-24 bg-[#151515] px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planos simples e transparentes</h2>
            <p className="text-zinc-400">Comece de graça, evolua quando precisar.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-[#1A1A1A] border border-zinc-800 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-2">Iniciante</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-white">Grátis</span>
              </div>
              <p className="text-zinc-400 mb-8">Perfeito para testar a ferramenta e ver o poder da IA.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>5 gerações por mês</span>
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>Copys básicas</span>
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>Histórico de 7 dias</span>
                </li>
              </ul>
              <button onClick={handleCtaClick} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">
                Começar grátis
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-b from-rose-900/40 to-[#1A1A1A] border border-rose-500/30 p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Mais popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Acesso Vitalício</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-white">R$ 19,90</span>
              </div>
              <p className="text-zinc-400 mb-8">Para gestores e donos de negócio que querem escalar.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span className="font-bold text-white">Gerações ilimitadas</span>
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>Copys avançadas e ganchos virais</span>
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>Prompts detalhados para Midjourney</span>
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>Histórico vitalício</span>
                </li>
              </ul>
              <button onClick={handleSubscribeClick} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-[0_0_20px_-5px_rgba(225,29,72,0.4)]">
                Garantir Acesso
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-[#121212] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <span className="font-bold text-lg text-white">Ad Prompt BR</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Contato</a>
          </div>
          <div className="text-sm text-zinc-600">
            © 2026 Ad Prompt BR. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
