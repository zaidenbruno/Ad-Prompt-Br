'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { generateAdCreatives } from '../lib/gemini';
import { Copy, Check, Loader2, Sparkles, Target, MapPin, Tag, Users, Hash } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);

  const [inputs, setInputs] = useState({
    niche: '',
    location: '',
    objective: 'vendas online',
    promo: '',
    audience: '',
    variations: 5,
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setResults(null);

    try {
      const generatedData = await generateAdCreatives(inputs);
      
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

      setResults(generatedData);
    } catch (error) {
      console.error('Error generating creatives:', error);
      alert('Erro ao gerar criativos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 sticky top-24">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={24} />
            Novo Criativo
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center gap-2">
                <Tag size={16} className="text-zinc-400" /> Nicho da Loja
              </label>
              <input
                required
                type="text"
                placeholder="ex: Fast fashion R$19,90"
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={inputs.niche}
                onChange={(e) => setInputs({ ...inputs, niche: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center gap-2">
                <MapPin size={16} className="text-zinc-400" /> Cidade/Região
              </label>
              <input
                required
                type="text"
                placeholder="ex: Florianópolis SC"
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={inputs.location}
                onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center gap-2">
                <Target size={16} className="text-zinc-400" /> Objetivo Principal
              </label>
              <select
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={inputs.objective}
                onChange={(e) => setInputs({ ...inputs, objective: e.target.value })}
              >
                <option value="visitas na loja física">Visitas na loja física</option>
                <option value="mensagens WhatsApp">Mensagens WhatsApp</option>
                <option value="vendas online">Vendas online</option>
                <option value="tráfego para site">Tráfego para site</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center gap-2">
                <Sparkles size={16} className="text-zinc-400" /> Promo/Destaque
              </label>
              <input
                required
                type="text"
                placeholder="ex: Promo Black Friday"
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={inputs.promo}
                onChange={(e) => setInputs({ ...inputs, promo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center gap-2">
                <Users size={16} className="text-zinc-400" /> Público Alvo
              </label>
              <input
                required
                type="text"
                placeholder="ex: Mulheres 25-45 anos"
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={inputs.audience}
                onChange={(e) => setInputs({ ...inputs, audience: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center gap-2">
                <Hash size={16} className="text-zinc-400" /> Variações de Imagem
              </label>
              <input
                required
                type="number"
                min="1"
                max="10"
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={inputs.variations}
                onChange={(e) => setInputs({ ...inputs, variations: parseInt(e.target.value) })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-6"
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
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-8 space-y-6">
        {!results && !loading && (
          <div className="bg-white border border-zinc-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="text-zinc-400" size={32} />
            </div>
            <h3 className="text-xl font-medium text-zinc-900 mb-2">Pronto para a mágica?</h3>
            <p className="text-zinc-500 max-w-md">
              Preencha o formulário ao lado e deixe a IA criar os melhores copys e prompts para suas campanhas no Meta Ads.
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <h3 className="text-xl font-medium text-zinc-900 mb-2">Analisando o mercado brasileiro...</h3>
            <p className="text-zinc-500">Criando copys virais e prompts otimizados.</p>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Prediction Card */}
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
              <h3 className="text-emerald-800 font-bold mb-2 flex items-center gap-2">
                <Target size={20} />
                Previsão de Performance
              </h3>
              <p className="text-emerald-700">{results.prediction}</p>
            </div>

            {/* Copy Card */}
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-zinc-900">Copy do Anúncio</h3>
                <button
                  onClick={() => handleCopy(`${results.copy.primaryText}\n\n${results.copy.headline}\n${results.copy.description}`, 'copy')}
                  className="text-zinc-400 hover:text-indigo-600 transition-colors"
                >
                  {copied === 'copy' ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Texto Principal</span>
                  <p className="text-zinc-800 whitespace-pre-wrap">{results.copy.primaryText}</p>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Título (Headline)</span>
                  <p className="font-bold text-zinc-900 text-lg">{results.copy.headline}</p>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mt-3 mb-1 block">Descrição</span>
                  <p className="text-zinc-600 text-sm">{results.copy.description}</p>
                </div>
              </div>
            </div>

            {/* Hooks Card */}
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900 mb-4">Ganchos (Hooks) para Vídeo/Imagem</h3>
              <ul className="space-y-3">
                {results.hooks.map((hook: string, idx: number) => (
                  <li key={idx} className="flex gap-3 items-start bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                    <span className="bg-indigo-100 text-indigo-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                      {idx + 1}
                    </span>
                    <p className="text-zinc-800">{hook}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prompts Card */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm text-zinc-300">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-400" />
                Prompts para IA (Midjourney/Leonardo)
              </h3>
              <div className="space-y-4">
                {results.prompts.map((prompt: string, idx: number) => (
                  <div key={idx} className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl group relative">
                    <button
                      onClick={() => handleCopy(prompt, `prompt-${idx}`)}
                      className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {copied === `prompt-${idx}` ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                    </button>
                    <p className="font-mono text-sm leading-relaxed pr-8">{prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
