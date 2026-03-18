'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { generateAdCreatives } from '../lib/gemini';
import { Copy, Check, Loader2, Sparkles, Target, MapPin, Tag, Users, Hash, Download, FileText, Image as ImageIcon, Lock, MessageSquare } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Link from 'next/link';

export function Dashboard() {
  const { user, isPro } = useAuth();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [modelType, setModelType] = useState<'flash' | 'pro'>('flash');
  const [isExporting, setIsExporting] = useState(false);

  const [inputs, setInputs] = useState({
    niche: '',
    location: '',
    objective: 'mensagens WhatsApp',
    promo: '',
    audience: '',
    variations: 5,
    inspiration: '',
  });

  // Load from sessionStorage on mount
  useEffect(() => {
    const savedInputs = sessionStorage.getItem('adPromptInputs');
    const savedResults = sessionStorage.getItem('adPromptResults');
    
    if (savedInputs) {
      try { setInputs(JSON.parse(savedInputs)); } catch (e) {}
    }
    if (savedResults) {
      try { setResults(JSON.parse(savedResults)); } catch (e) {}
    }
  }, []);

  // Save to sessionStorage when inputs or results change
  useEffect(() => {
    sessionStorage.setItem('adPromptInputs', JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    if (results) {
      sessionStorage.setItem('adPromptResults', JSON.stringify(results));
    }
  }, [results]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check limits
    if (!user) {
      const anonCount = parseInt(localStorage.getItem('anon_generations') || '0');
      if (anonCount >= 1) {
        alert('Você atingiu o limite de 1 geração gratuita. Faça login para continuar!');
        return;
      }
    } else if (!isPro) {
      // Check user generations from Supabase
      const { count, error } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (count !== null && count >= 3) {
        alert('Você atingiu o limite de 3 gerações do plano gratuito. Faça upgrade para o plano Pro para gerar ilimitado!');
        return;
      }
    }

    setLoading(true);
    setResults(null);

    try {
      // Force 'flash' model for now
      const generatedData = await generateAdCreatives(inputs, 'flash');
      
      if (user) {
        // Save to Supabase
        const { error } = await supabase.from('generations').insert([
          {
            user_id: user.id,
            inputs,
            outputs: generatedData,
          }
        ]);

        if (error) {
          console.error('Supabase insert error:', error);
        }
      } else {
        // Increment anon count
        const currentCount = parseInt(localStorage.getItem('anon_generations') || '0');
        localStorage.setItem('anon_generations', (currentCount + 1).toString());
      }

      setResults(generatedData);
    } catch (error: any) {
      console.error('Error generating creatives:', error);
      const errorMessage = error?.message || 'Erro desconhecido';
      alert(`Erro ao gerar criativos: ${errorMessage}. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('creative-results');
    if (!element) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#121212',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`criativo-${inputs.niche.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erro ao exportar PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToImage = async () => {
    const element = document.getElementById('creative-results');
    if (!element) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#121212',
      });
      
      const link = document.createElement('a');
      link.download = `criativo-${inputs.niche.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting Image:', error);
      alert('Erro ao exportar Imagem.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Form Section */}
      <div className="lg:col-span-4 space-y-6 relative z-10">
        <div className="bg-[#1A1A1A]/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-zinc-800/50 sticky top-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={18} />
              </div>
              Novo Criativo
            </h2>
            {!isPro && (
              <Link href="/plans" className="text-[10px] font-bold uppercase tracking-wider bg-rose-600/20 text-rose-400 px-2 py-1 rounded-md border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all">
                Upgrade Pro
              </Link>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} /> Nicho da Loja
              </label>
              <input
                required
                type="text"
                placeholder="ex: Loja de Roupas"
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-800 text-zinc-100 rounded-2xl focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all placeholder:text-zinc-700 text-sm"
                value={inputs.niche}
                onChange={(e) => setInputs({ ...inputs, niche: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} /> Cidade/Região
              </label>
              <input
                required
                type="text"
                placeholder="ex: Florianópolis SC"
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-800 text-zinc-100 rounded-2xl focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all placeholder:text-zinc-700 text-sm"
                value={inputs.location}
                onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Target size={12} /> Objetivo Principal
              </label>
              <select
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-800 text-zinc-100 rounded-2xl focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all text-sm appearance-none cursor-pointer"
                value={inputs.objective}
                onChange={(e) => setInputs({ ...inputs, objective: e.target.value })}
              >
                <option value="visitas na loja física">📍 Visitas na loja física</option>
                <option value="mensagens WhatsApp">💬 Mensagens WhatsApp</option>
                <option value="vendas online">🛒 Vendas online</option>
                <option value="tráfego para site">🌐 Tráfego para site</option>
                <option value="visitas pro perfil do Instagram">📸 Perfil do Instagram</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={12} /> Promo/Destaque
              </label>
              <input
                required
                type="text"
                placeholder="ex: Promo Black Friday"
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-800 text-zinc-100 rounded-2xl focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all placeholder:text-zinc-700 text-sm"
                value={inputs.promo}
                onChange={(e) => setInputs({ ...inputs, promo: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Users size={12} /> Público Alvo
              </label>
              <input
                required
                type="text"
                placeholder="ex: Mulheres 25-45 anos"
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-800 text-zinc-100 rounded-2xl focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all placeholder:text-zinc-700 text-sm"
                value={inputs.audience}
                onChange={(e) => setInputs({ ...inputs, audience: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Hash size={10} /> Variações
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="10"
                  className="w-full px-4 py-3 bg-[#121212] border border-zinc-800 text-zinc-100 rounded-2xl focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all text-sm"
                  value={inputs.variations}
                  onChange={(e) => setInputs({ ...inputs, variations: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={10} /> Modelo
                </label>
                <div className="w-full px-4 py-3 bg-[#121212] border border-zinc-800 text-zinc-500 rounded-2xl text-[10px] font-bold flex items-center justify-center uppercase">
                  Gemini 2.0 Flash
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={12} /> Inspiração (Opcional)
              </label>
              <textarea
                placeholder="Cole uma legenda que já converteu bem..."
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-800 text-zinc-100 rounded-2xl focus:ring-2 focus:ring-rose-600/50 focus:border-rose-600 transition-all placeholder:text-zinc-700 text-sm min-h-[80px] resize-none"
                value={inputs.inspiration || ''}
                onChange={(e) => setInputs({ ...inputs, inspiration: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-4 rounded-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-rose-600/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Gerando Criativos...
                </>
              ) : (
                <>
                  Gerar Criativos 🔥
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-8 space-y-6">
        {!results && !loading && (
          <div className="bg-[#1A1A1A] border border-zinc-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="text-zinc-500" size={32} />
            </div>
            <h3 className="text-xl font-medium text-zinc-100 mb-2">Pronto para a mágica?</h3>
            <p className="text-zinc-400 max-w-md">
              Preencha o formulário ao lado e deixe a IA criar os melhores copys e prompts para suas campanhas no Meta Ads.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-pulse"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <Loader2 className="animate-spin text-rose-500 mb-6" size={48} />
              <h3 className="text-2xl font-bold text-zinc-100 mb-2">Analisando o mercado brasileiro...</h3>
              <p className="text-zinc-400 mb-12">Criando copys virais e prompts otimizados para você.</p>

              {!user && (
                <div className="w-full max-w-md bg-gradient-to-br from-[#1E121E] to-[#121212] border border-purple-500/20 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-yellow-400 text-xl">⚡</span>
                    <h4 className="text-xl font-bold text-white tracking-tight">Entre para Ganhar Mais</h4>
                    <span className="text-yellow-400 text-xl">⚡</span>
                  </div>
                  
                  <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                    Crie sua conta gratuita para ganhar créditos diários e acessar recursos exclusivos de alta conversão.
                  </p>

                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: window.location.origin,
                            queryParams: {
                              prompt: 'select_account',
                            },
                          },
                        });
                        if (error) throw error;
                      } catch (error: any) {
                        alert(error.message || 'Erro no login com Google');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-600/20"
                  >
                    <Sparkles size={20} className="text-yellow-300" />
                    Entrar Agora
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Seus Criativos 🔥</h2>
                <p className="text-zinc-500 text-sm">Gerações otimizadas para alta conversão.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={exportToImage}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isExporting ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                  Imagem
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-rose-600/20"
                >
                  {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  PDF
                </button>
              </div>
            </div>

            <div id="creative-results" className="space-y-8 p-6 -m-6 bg-[#121212] rounded-3xl">
              {/* Prediction Card */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] pointer-events-none"></div>
                <h3 className="text-emerald-400 font-black text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Target size={18} />
                  Previsão de Performance
                </h3>
                <p className="text-emerald-100/90 text-lg leading-relaxed font-medium">{results.prediction}</p>
              </div>

              {/* Variations */}
              <div className="grid grid-cols-1 gap-8">
                {results.variations?.map((variation: any, idx: number) => (
                  <div key={idx} className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-zinc-800/50 p-8 rounded-[2.5rem] shadow-xl relative group hover:border-rose-500/30 transition-all">
                    {/* Decorative Corners */}
                    <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-rose-500/30 rounded-tl-lg"></div>
                    <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-rose-500/30 rounded-br-lg"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-600/20">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight">Variação {idx + 1}</h3>
                          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Foco em {inputs.objective}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(`🔥 HEADLINE:\n${variation.headline}\n\n📝 TEXTO PRINCIPAL:\n${variation.primaryText}\n\n💡 DESCRIÇÃO:\n${variation.description}\n\n🎣 HOOK INICIAL:\n${variation.hook}\n\n📸 PROMPT DE IMAGEM:\n${variation.prompt}`, `var-${idx}`)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-zinc-800"
                      >
                        {copied === `var-${idx}` ? <><Check size={14} className="text-emerald-500" /> Copiado</> : <><Copy size={14} /> Copiar Tudo</>}
                      </button>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="relative">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">📝 Texto Principal (Copy)</span>
                          <button onClick={() => handleCopy(variation.primaryText, `text-${idx}`)} className="text-zinc-600 hover:text-rose-400 transition-colors">
                            {copied === `text-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="bg-[#121212] p-6 rounded-2xl border border-zinc-800/50">
                          <p className="text-zinc-300 text-base leading-relaxed whitespace-pre-wrap font-medium">{variation.primaryText}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-rose-600/5 p-6 rounded-3xl border border-rose-500/10 relative overflow-hidden">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/70">🔥 Título (Headline)</span>
                            <button onClick={() => handleCopy(variation.headline, `head-${idx}`)} className="text-rose-500/50 hover:text-rose-400 transition-colors">
                              {copied === `head-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p className="font-black text-white text-xl leading-tight">{variation.headline}</p>
                        </div>

                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800/50">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">💡 Descrição</span>
                            <button onClick={() => handleCopy(variation.description, `desc-${idx}`)} className="text-zinc-600 hover:text-rose-400 transition-colors">
                              {copied === `desc-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p className="text-zinc-400 text-sm font-medium">{variation.description}</p>
                        </div>
                      </div>

                      <div className="bg-purple-600/5 p-6 rounded-3xl border border-purple-500/10">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">🎣 Gancho (Hook)</span>
                          <button onClick={() => handleCopy(variation.hook, `hook-${idx}`)} className="text-purple-400/50 hover:text-purple-300 transition-colors">
                            {copied === `hook-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-zinc-300 font-medium italic">&quot;{variation.hook}&quot;</p>
                      </div>

                      <div className="bg-[#0A0A0A] border border-zinc-800/50 p-6 rounded-3xl relative group/prompt">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">📸 Prompt de Imagem (IA)</span>
                          <button onClick={() => handleCopy(variation.prompt, `prompt-${idx}`)} className="text-zinc-600 hover:text-rose-400 transition-colors">
                            {copied === `prompt-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="font-mono text-xs leading-relaxed text-zinc-500 group-hover/prompt:text-zinc-400 transition-colors">{variation.prompt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final CTA */}
              {results.finalCTA && (
                <div className="bg-gradient-to-r from-rose-600/10 to-purple-600/10 border border-rose-500/20 p-10 rounded-[3rem] text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.05)_0%,transparent_70%)]"></div>
                  <h3 className="text-rose-500 font-black text-xs uppercase tracking-[0.4em] mb-4 relative z-10">CTA Final Recomendado</h3>
                  <p className="text-white font-black text-2xl md:text-3xl tracking-tight relative z-10">{results.finalCTA}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
