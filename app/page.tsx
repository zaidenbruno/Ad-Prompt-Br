'use client';

import Image from 'next/image';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Zap, Clock, TrendingUp, Target, CheckCircle2, ArrowRight, Sparkles as LucideSparkles, Star, HelpCircle, ChevronDown, ChevronUp, Rocket } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCtaClick = async () => {
    router.push('/dashboard');
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
    
    const hotmartUrl = new URL('https://pay.hotmart.com/W104924135B?checkoutMode=10');
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
      <section className="relative pt-12 md:pt-20 pb-32 md:pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/20 via-[#121212] to-[#121212] -z-10"></div>
        
        <div className="max-w-6xl mx-auto relative">
          {/* Background Images Layer - Adjusted for mobile visibility */}
          <div className="absolute top-20 md:top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl pointer-events-none select-none z-10 opacity-30 md:opacity-100">
            {/* Glow effect behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-rose-600/10 blur-[120px] rounded-full"></div>
            
            {/* MacBook (Center/Back) */}
            <div className="relative w-full animate-[float_8s_ease-in-out_infinite] p-4">
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-rose-500/40 rounded-tl-[32px] z-20"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-rose-500/40 rounded-tr-[32px] z-20"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-rose-500/40 rounded-bl-[32px] z-20"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-rose-500/40 rounded-br-[32px] z-20"></div>
              
              <Image 
                src="/macbook.png" 
                alt="MacBook Preview" 
                width={1200} 
                height={800} 
                className="w-full h-auto drop-shadow-2xl"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Content Layer (Front) */}
          <div className="relative z-20 text-center space-y-6 md:space-y-8 pt-4 md:pt-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium backdrop-blur-sm">
              <Rocket className="w-4 h-4" />
              <span>A revolução dos anúncios chegou</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
              Crie anúncios virais para <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
                Meta Ads em segundos
              </span> com IA
            </h1>

            {/* Main CTA Button - Moved up for better conversion */}
            <div className="flex flex-col items-center gap-4 pt-2">
              <button
                onClick={handleCtaClick}
                className="w-full sm:w-auto px-10 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xl md:text-2xl transition-all transform hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(225,29,72,0.6)] flex items-center justify-center gap-2"
              >
                Testar a IA grátis agora →
              </button>
              <p className="text-sm text-zinc-400 font-medium">Não precisa de cartão de crédito para testar.</p>
            </div>
            
            <p className="text-base md:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed px-4">
              Diferente do ChatGPT genérico, o AdPrompt BR já vem treinado com estrutura que converte no Brasil: gírias reais, urgência local, CTA matador e prompts prontos pra imagem.
            </p>
            
            <div className="pt-2">
              <Link
                href="/plans"
                className="inline-flex px-8 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl font-bold text-lg transition-all items-center justify-center"
              >
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 border-y border-zinc-800/50 bg-[#151515]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-white mb-2">+100K</div>
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

      {/* Examples Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-zinc-800/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Veja o que a IA pode criar</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">Exemplos reais de métricas que deram resultado usando o Ad Prompt Br.</p>
        </div>
        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[1, 2, 4, 5].map((i) => (
            <div key={i} className="min-w-[280px] sm:min-w-[320px] bg-[#1A1A1A] border border-zinc-800 rounded-3xl overflow-hidden flex flex-col hover:border-rose-500/30 transition-all hover:shadow-[0_0_30px_-10px_rgba(225,29,72,0.3)] group snap-center">
              <div className="relative aspect-[9/16] w-full overflow-hidden bg-zinc-900">
                <Image 
                  src={`/metrica-${i}.png`} 
                  alt={`Métrica Comprovada ${i}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <p className="text-rose-500 font-black tracking-widest text-xl uppercase">Métricas Comprovadas 🔥</p>
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
                  <span>15 gerações por mês</span>
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

      {/* Testimonials Section - Hidden until real data is ready */}
      {false && (
        <section className="py-24 bg-[#121212] px-4 sm:px-6 lg:px-8 border-t border-zinc-800/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Quem usa, aprova ⭐️</h2>
              <p className="text-zinc-400">Resultados reais de quem parou de perder tempo com copy ruim.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "João Silva",
                  role: "Dono de Loja de Celulares",
                  content: "Aumentei meu CTR em 3x no primeiro dia. A IA entende exatamente como o brasileiro compra.",
                  avatar: "JS"
                },
                {
                  name: "Maria Oliveira",
                  role: "Moda Feminina",
                  content: "Finalmente uma ferramenta que não parece um robô traduzido. O tom humano é o diferencial.",
                  avatar: "MO"
                },
                {
                  name: "Pedro Santos",
                  role: "Gestor de Tráfego",
                  content: "Os prompts de imagem são surreais. Economizei horas de design e os anúncios estão performando muito mais.",
                  avatar: "PS"
                }
              ].map((t, i) => (
                <div key={i} className="bg-[#1A1A1A] p-8 rounded-3xl border border-zinc-800 hover:border-rose-500/30 transition-all group">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />)}
                  </div>
                  <p className="text-zinc-300 mb-6 italic">&quot;{t.content}&quot;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center font-bold text-white text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{t.name}</h4>
                      <p className="text-zinc-500 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-24 bg-[#151515] px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <HelpCircle className="text-rose-500" />
              Dúvidas Frequentes
            </h2>
            <p className="text-zinc-400">Tudo o que você precisa saber para começar hoje.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Como funciona a geração dos anúncios?",
                a: "Nossa IA foi treinada com as melhores estratégias de Meta Ads do Brasil. Você preenche os dados do seu produto e ela gera 5 variações completas com copy, gatilhos mentais e prompts de imagem."
              },
              {
                q: "Os anúncios servem para qualquer nicho?",
                a: "Sim! De eletrônicos a moda, de serviços a infoprodutos. A IA adapta o tom de voz e os gatilhos de acordo com o seu público-alvo."
              },
              {
                q: "O pagamento de R$ 19,90 é mensal?",
                a: "Não! É um pagamento ÚNICO para acesso vitalício. Você paga uma vez e usa para sempre, sem mensalidades ou taxas escondidas."
              },
              {
                q: "Posso usar no celular?",
                a: "Com certeza! O Ad Prompt BR é 100% responsivo e funciona perfeitamente no seu smartphone, para você criar anúncios de onde estiver."
              },
              {
                q: "Preciso de conhecimento técnico?",
                a: "Nenhum. A ferramenta foi feita para ser simples e direta. Se você sabe preencher um formulário, você sabe criar anúncios de alta conversão."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="font-bold text-white">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="text-rose-500" /> : <ChevronDown className="text-zinc-500" />}
                </button>
                {openFaq === i && (
                  <div className="p-6 pt-0 text-zinc-400 border-t border-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
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
            <Link href="/termos" className="hover:text-zinc-300 transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-zinc-300 transition-colors">Política de Privacidade</Link>
            <a href="#" className="hover:text-zinc-300 transition-colors">Contato</a>
          </div>
          <div className="text-sm text-zinc-600">
            Todos os direitos reservados © 2026 Ad Prompt BR
          </div>
        </div>
      </footer>
    </div>
  );
}
