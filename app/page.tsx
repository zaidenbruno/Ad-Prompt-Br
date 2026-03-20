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
              <span>Para donos de e-commerce e negócios locais</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
              Donos de loja: parem de <br className="hidden md:block" />
              queimar dinheiro no <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">Meta Ads</span>
            </h1>

            {/* Main CTA Button - Moved up for better conversion */}
            <div className="flex flex-col items-center gap-4 pt-2">
              <button
                onClick={handleCtaClick}
                className="w-full sm:w-auto px-10 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xl md:text-2xl transition-all transform hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(225,29,72,0.6)] flex items-center justify-center gap-2"
              >
                Testar a IA grátis agora →
              </button>
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-zinc-400 font-medium">Não precisa de cartão de crédito para testar.</p>
                <p className="text-rose-500/80 text-xs font-bold uppercase tracking-widest animate-pulse">
                  ⚡ Ganhe 15 gerações gratuitas ao entrar
                </p>
              </div>
            </div>
            
            <p className="text-base md:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed px-4">
              IA treinada no Brasil gera copy + prompt de imagem que vende de verdade em 10 segundos. Sem precisar ser gestor de tráfego. Perfeito para moda, suplementos, beleza e WhatsApp.
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

      {/* Niche Examples Section */}
      <section className="py-24 bg-[#121212] px-4 sm:px-6 lg:px-8 border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Veja o que a IA gera para o seu nicho</h2>
            <p className="text-zinc-400">Copys prontas e prompts de imagem focados em conversão real.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Moda */}
            <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-zinc-800 hover:border-rose-500/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                  👗
                </div>
                <h3 className="text-xl font-bold text-white">Moda Feminina</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 block">Título</span>
                  <p className="text-sm font-bold text-white">Vestidos que valorizam você com preços imperdíveis hoje</p>
                </div>
                <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 block">Copy</span>
                  <p className="text-sm text-zinc-300 italic">&quot;Sabe aquele look que une conforto, elegância e frescor para o dia a dia no Rio? Nossa nova seleção de vestidos está com descontos especiais, mas as peças mais desejadas estão esgotando rápido. São modelos pensados para a mulher real que não abre mão do estilo. Clique agora e confira todos os detalhes no nosso perfil antes que a sua numeração acabe! ✨👗&quot;</p>
                </div>
                <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-2 block">Hook</span>
                  <p className="text-xs text-zinc-400 italic">&quot;O vestido perfeito para o seu próximo evento está aqui.&quot;</p>
                </div>
              </div>
            </div>

            {/* Suplementos */}
            <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-zinc-800 hover:border-rose-500/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                  💪
                </div>
                <h3 className="text-xl font-bold text-white">Suplementos</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 block">Título</span>
                  <p className="text-sm font-bold text-white">Black Friday de Suplementos: Os menores preços de SP! 🔥</p>
                </div>
                <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 block">Copy</span>
                  <p className="text-sm text-zinc-300 italic">&quot;Sua chance de garantir o estoque de suplementos para o ano todo com preço de atacado chegou. Selecionamos as melhores marcas de Whey, Creatina e Pré-treino com descontos reais de Black Friday. Não arrisque sua evolução com produtos duvidosos ou prazos longos de entrega. Temos estoque à pronta entrega em São Paulo e atendimento humanizado. Clique no botão abaixo, tire suas dúvidas e faça sua reserva agora antes que as prateleiras esvaziem! 💥⚡&quot;</p>
                </div>
                <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-2 block">Hook</span>
                  <p className="text-xs text-zinc-400 italic">&quot;Quer os melhores suplementos do mercado pelo menor preço do ano?&quot;</p>
                </div>
              </div>
            </div>

            {/* Beleza */}
            <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-zinc-800 hover:border-rose-500/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                  ✨
                </div>
                <h3 className="text-xl font-bold text-white">Beleza & Skincare</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 block">Título</span>
                  <p className="text-sm font-bold text-white">Pele de porcelana em 7 dias? Veja como!</p>
                </div>
                <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 block">Copy</span>
                  <p className="text-sm text-zinc-300 italic">&quot;Cansada de esconder manchas e linhas de expressão com maquiagem? ✨ Nosso sérum renovador se tornou o favorito porque entrega o que promete: uma pele radiante, clara e firme em apenas uma semana. Sinta a diferença no toque e recupere sua confiança com um tratamento profissional no conforto de casa. Aproveite nossa promoção exclusiva de lançamento e garanta o seu antes que o estoque termine! 🛍️&quot;</p>
                </div>
                <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-2 block">Hook</span>
                  <p className="text-xs text-zinc-400 italic">&quot;O segredo para uma pele impecável e sem manchas.&quot;</p>
                </div>
              </div>
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

      {/* Testimonials Section - Real Screenshots */}
      <section className="py-24 bg-[#121212] px-4 sm:px-6 lg:px-8 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Quem usa, aprova ⭐️</h2>
            <p className="text-zinc-400">Resultados reais em prints reais de lojistas que pararam de perder tempo com copy ruim.</p>
          </div>
          
          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[280px] sm:min-w-[320px] bg-[#1A1A1A] border border-zinc-800 rounded-3xl overflow-hidden flex flex-col hover:border-rose-500/30 transition-all hover:shadow-[0_0_30px_-10px_rgba(225,29,72,0.3)] group snap-center">
                <div className="relative aspect-[9/16] w-full overflow-hidden bg-zinc-900">
                  <Image 
                    src={`/depoimento-${i}.png`} 
                    alt={`Depoimento Real ${i}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-rose-500 font-black tracking-widest text-xl uppercase">Resultados Reais 🔥</p>
          </div>
        </div>
      </section>

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
