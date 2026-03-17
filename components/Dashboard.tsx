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
    variations: 3,
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-zinc-800 sticky top-24">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-100">
            <Sparkles className="text-rose-500" size={24} />
            Novo Criativo
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-2">
                <Tag size={16} className="text-zinc-500" /> Nicho da Loja
              </label>
              <input
                required
                type="text"
                placeholder="ex: Loja de Roupas"
                className="w-full px-4 py-2 bg-[#242424] border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-rose-600 focus:border-rose-600 transition-all placeholder:text-zinc-600"
                value={inputs.niche}
                onChange={(e) => setInputs({ ...inputs, niche: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-2">
                <MapPin size={16} className="text-zinc-500" /> Cidade/Região
              </label>
              <input
                required
                type="text"
                placeholder="ex: Florianópolis SC"
                className="w-full px-4 py-2 bg-[#242424] border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-rose-600 focus:border-rose-600 transition-all placeholder:text-zinc-600"
                value={inputs.location}
                onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-2">
                <Target size={16} className="text-zinc-500" /> Objetivo Principal
              </label>
              <select
                className="w-full px-4 py-2 bg-[#242424] border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-rose-600 focus:border-rose-600 transition-all"
                value={inputs.objective}
                onChange={(e) => setInputs({ ...inputs, objective: e.target.value })}
              >
                <option value="visitas na loja física">Visitas na loja física</option>
                <option value="mensagens WhatsApp">Mensagens WhatsApp</option>
                <option value="vendas online">Vendas online</option>
                <option value="tráfego para site">Tráfego para site</option>
                <option value="visitas pro perfil do Instagram">Visitas pro perfil do Instagram</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-2">
                <Sparkles size={16} className="text-zinc-500" /> Promo/Destaque
              </label>
              <input
                required
                type="text"
                placeholder="ex: Promo Black Friday"
                className="w-full px-4 py-2 bg-[#242424] border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-rose-600 focus:border-rose-600 transition-all placeholder:text-zinc-600"
                value={inputs.promo}
                onChange={(e) => setInputs({ ...inputs, promo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-2">
                <Users size={16} className="text-zinc-500" /> Público Alvo
              </label>
              <input
                required
                type="text"
                placeholder="ex: Mulheres 25-45 anos"
                className="w-full px-4 py-2 bg-[#242424] border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-rose-600 focus:border-rose-600 transition-all placeholder:text-zinc-600"
                value={inputs.audience}
                onChange={(e) => setInputs({ ...inputs, audience: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-2">
                <Hash size={16} className="text-zinc-500" /> Variações de anúncio
              </label>
              <input
                required
                type="number"
                min="1"
                max="10"
                className="w-full px-4 py-2 bg-[#242424] border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-rose-600 focus:border-rose-600 transition-all"
                value={inputs.variations}
                onChange={(e) => setInputs({ ...inputs, variations: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-2">
                <MessageSquare size={16} className="text-zinc-500" /> Legenda de Inspiração (Opcional)
              </label>
              <textarea
                placeholder="Cole aqui uma legenda que já converteu bem para a IA clonar o estilo..."
                className="w-full px-4 py-2 bg-[#242424] border border-zinc-700 text-zinc-100 rounded-xl focus:ring-2 focus:ring-rose-600 focus:border-rose-600 transition-all placeholder:text-zinc-600 min-h-[100px] resize-y"
                value={inputs.inspiration || ''}
                onChange={(e) => setInputs({ ...inputs, inspiration: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Gerando...
                </>
              ) : (
                'Gerar Criativos 🔥'
              )}
            </button>
            
            {loading && (
              <p className="text-xs text-center text-rose-400 mt-2 animate-pulse">
                ⚠️ Por favor, não atualize a página. Isso pode levar até 15 segundos.
              </p>
            )}
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
          <div className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
            <Loader2 className="animate-spin text-rose-500 mb-4" size={48} />
            <h3 className="text-xl font-medium text-zinc-100 mb-2">Analisando o mercado brasileiro...</h3>
            <p className="text-zinc-400">Criando copys virais e prompts otimizados.</p>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-end gap-3 mb-4">
              <button
                onClick={exportToImage}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-[#242424] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                Exportar Imagem
              </button>
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-[#242424] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                Exportar PDF
              </button>
            </div>

            <div id="creative-results" className="space-y-6 p-4 -m-4 bg-[#121212] rounded-2xl">
              {/* Prediction Card */}
              <div className="bg-emerald-950/30 border border-emerald-900/50 p-6 rounded-2xl">
                <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                  <Target size={20} />
                  Previsão de Performance
                </h3>
                <p className="text-emerald-300/90">{results.prediction}</p>
              </div>

              {/* Variations */}
              <div className="space-y-6">
                {results.variations?.map((variation: any, idx: number) => (
                  <div key={idx} className="bg-[#1A1A1A] border border-zinc-800 p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                        <span className="bg-rose-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">{idx + 1}</span>
                        Variação {idx + 1}
                      </h3>
                      <button
                        onClick={() => handleCopy(`${variation.primaryText}\n\n${variation.headline}\n${variation.description}\n\nHook: ${variation.hook}\n\nPrompt: ${variation.prompt}`, `var-${idx}`)}
                        className="text-zinc-500 hover:text-rose-500 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        {copied === `var-${idx}` ? <><Check size={16} className="text-emerald-500" /> Copiado</> : <><Copy size={16} /> Copiar Variação</>}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="group relative">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Texto Principal</span>
                          <button onClick={() => handleCopy(variation.primaryText, `text-${idx}`)} className="text-zinc-500 hover:text-rose-400 transition-colors">
                            {copied === `text-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-zinc-300 whitespace-pre-wrap">{variation.primaryText}</p>
                      </div>
                      
                      <div className="bg-[#242424] p-4 rounded-xl border border-zinc-800">
                        <div className="group relative">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Título (Headline)</span>
                            <button onClick={() => handleCopy(variation.headline, `head-${idx}`)} className="text-zinc-500 hover:text-rose-400 transition-colors">
                              {copied === `head-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p className="font-bold text-zinc-100 text-lg">{variation.headline}</p>
                        </div>
                        <div className="group relative mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição</span>
                            <button onClick={() => handleCopy(variation.description, `desc-${idx}`)} className="text-zinc-500 hover:text-rose-400 transition-colors">
                              {copied === `desc-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p className="text-zinc-400 text-sm">{variation.description}</p>
                        </div>
                      </div>

                      <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/30 group relative">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Gancho (Hook)</span>
                          <button onClick={() => handleCopy(variation.hook, `hook-${idx}`)} className="text-rose-400 hover:text-rose-300 transition-colors">
                            {copied === `hook-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-zinc-300">{variation.hook}</p>
                      </div>

                      <div className="bg-[#242424] border border-zinc-800 p-4 rounded-xl group relative">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Prompt de Imagem</span>
                          <button onClick={() => handleCopy(variation.prompt, `prompt-${idx}`)} className="text-zinc-500 hover:text-rose-400 transition-colors">
                            {copied === `prompt-${idx}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="font-mono text-sm leading-relaxed text-zinc-400">{variation.prompt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final CTA */}
              {results.finalCTA && (
                <div className="bg-rose-950/30 border border-rose-900/50 p-6 rounded-2xl text-center">
                  <h3 className="text-rose-400 font-bold mb-2">CTA Final Recomendado</h3>
                  <p className="text-zinc-200 font-medium text-lg">{results.finalCTA}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
