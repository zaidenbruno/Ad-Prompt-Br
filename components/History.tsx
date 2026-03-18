'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { Loader2, Calendar, Tag, Target, Copy, Check, Star } from 'lucide-react';

export function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    async function fetchHistory() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('generations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        if (data) setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  const handleCopy = (item: any) => {
    let text = '';
    
    // Check if it's the new format (array of variations) or old format (single copy object)
    if (item.outputs.variations && Array.isArray(item.outputs.variations)) {
      // Format all variations nicely
      text = item.outputs.variations.map((v: any, index: number) => {
        return `--- VARIAÇÃO ${index + 1} ---\n\n` +
               `🔥 HEADLINE:\n${v.headline}\n\n` +
               `📝 TEXTO PRINCIPAL:\n${v.primaryText}\n\n` +
               `💡 DESCRIÇÃO:\n${v.description || ''}\n\n` +
               `🎣 GANCHO (HOOK):\n${v.hook || ''}\n\n` +
               `🎨 PROMPT DE IMAGEM:\n${v.prompt || ''}\n`;
      }).join('\n\n');
      
      if (item.outputs.prediction) {
        text = `📊 PREVISÃO DE PERFORMANCE:\n${item.outputs.prediction}\n\n${text}`;
      }
    } else if (item.outputs.copy) {
      // Fallback for old format
      text = `🔥 HEADLINE:\n${item.outputs.copy.headline}\n\n` +
             `📝 TEXTO PRINCIPAL:\n${item.outputs.copy.primaryText}\n\n` +
             `💡 DESCRIÇÃO:\n${item.outputs.copy.description || ''}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleFavorite = async (item: any) => {
    const isFavorite = item.outputs.is_favorite || false;
    const newOutputs = { ...item.outputs, is_favorite: !isFavorite };
    
    // Optimistic update
    setHistory(history.map(h => h.id === item.id ? { ...h, outputs: newOutputs } : h));

    try {
      const { error } = await supabase
        .from('generations')
        .update({ outputs: newOutputs })
        .eq('id', item.id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      setHistory(history.map(h => h.id === item.id ? { ...h, outputs: item.outputs } : h));
      alert('Erro ao favoritar. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-rose-500" size={32} />
      </div>
    );
  }

  const filteredHistory = filter === 'favorites' 
    ? history.filter(item => item.outputs.is_favorite)
    : history;

  return (
    <div className="space-y-8 relative">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Histórico de Gerações</h2>
          <p className="text-zinc-500 text-sm">Acesse seus criativos gerados anteriormente.</p>
        </div>
        
        <div className="flex bg-[#1A1A1A]/80 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800/50 w-full sm:w-auto shadow-xl">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filter === 'all' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-zinc-500 hover:text-zinc-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`flex-1 sm:flex-none px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${filter === 'favorites' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-zinc-500 hover:text-zinc-200'}`}
          >
            <Star size={14} className={filter === 'favorites' ? "fill-white" : ""} />
            Favoritos
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-zinc-800 border-dashed rounded-[2.5rem] p-20 text-center flex flex-col items-center justify-center relative z-10">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-zinc-800">
            {filter === 'favorites' ? <Star className="text-rose-500" size={32} /> : <Calendar className="text-zinc-500" size={32} />}
          </div>
          <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
            {filter === 'favorites' ? 'Nenhum favorito encontrado' : 'Nenhum histórico encontrado'}
          </h3>
          <p className="text-zinc-500 max-w-md leading-relaxed">
            {filter === 'favorites' 
              ? 'Você ainda não marcou nenhum criativo como favorito. Clique na estrela em um criativo para salvá-lo aqui.'
              : 'Você ainda não gerou nenhum criativo. Volte para a aba "Gerar Criativos" e faça sua primeira geração!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {filteredHistory.map((item) => (
            <div key={item.id} className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-zinc-800/50 rounded-[2rem] p-8 shadow-xl hover:border-rose-500/30 transition-all flex flex-col h-full relative group">
              {/* Decorative Corner */}
              <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-zinc-800 rounded-tl-md group-hover:border-rose-500/30 transition-colors"></div>

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-600/10 px-3 py-1.5 rounded-lg border border-rose-500/10">
                  <Tag size={12} />
                  {item.inputs.niche}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(item)}
                    className={`p-2 rounded-xl transition-all ${item.outputs.is_favorite ? 'text-rose-400 bg-rose-400/10 border border-rose-500/20' : 'text-zinc-600 hover:text-rose-400 hover:bg-zinc-800 border border-transparent'}`}
                    title={item.outputs.is_favorite ? "Remover dos favoritos" : "Salvar como favorito"}
                  >
                    <Star size={18} className={item.outputs.is_favorite ? "fill-rose-400" : ""} />
                  </button>
                  <button
                    onClick={() => handleCopy(item)}
                    className="text-zinc-600 hover:text-emerald-500 hover:bg-zinc-800 p-2 rounded-xl transition-all border border-transparent"
                    title="Copiar Copy"
                  >
                    {copied === item.id ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            
            <h3 className="font-black text-white text-xl mb-3 line-clamp-2 tracking-tight leading-tight">
              {item.outputs.variations ? item.outputs.variations[0].headline : item.outputs.copy?.headline}
            </h3>
            
            <p className="text-zinc-500 text-sm line-clamp-4 mb-8 flex-grow leading-relaxed font-medium">
              {item.outputs.variations ? item.outputs.variations[0].primaryText : item.outputs.copy?.primaryText}
            </p>

            <div className="pt-6 border-t border-zinc-800/50 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mt-auto">
              <div className="flex items-center gap-2">
                <Target size={12} className="text-rose-500/50" />
                {item.inputs.objective}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-zinc-700" />
                {new Date(item.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
