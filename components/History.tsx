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
      if (!user) return;
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
    if (item.outputs.variations) {
      const v = item.outputs.variations[0];
      text = `${v.primaryText}\n\n${v.headline}\n${v.description}`;
    } else if (item.outputs.copy) {
      text = `${item.outputs.copy.primaryText}\n\n${item.outputs.copy.headline}\n${item.outputs.copy.description}`;
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

  if (history.length === 0) {
    return (
      <div className="bg-[#1A1A1A] border border-zinc-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
          <Calendar className="text-zinc-500" size={32} />
        </div>
        <h3 className="text-xl font-medium text-zinc-100 mb-2">Nenhum histórico encontrado</h3>
        <p className="text-zinc-400 max-w-md">
          Você ainda não gerou nenhum criativo. Volte para a aba &quot;Gerar Criativos&quot; e faça sua primeira geração!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Seus Criativos Gerados</h2>
        
        <div className="flex bg-[#1A1A1A] p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${filter === 'favorites' ? 'bg-zinc-800 text-rose-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Star size={16} className={filter === 'favorites' ? "fill-rose-400" : ""} />
            Favoritos
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-zinc-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <Star className="text-zinc-500" size={32} />
          </div>
          <h3 className="text-xl font-medium text-zinc-100 mb-2">Nenhum favorito encontrado</h3>
          <p className="text-zinc-400 max-w-md">
            Você ainda não marcou nenhum criativo como favorito. Clique na estrela em um criativo para salvá-lo aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div key={item.id} className="bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-zinc-700 transition-colors flex flex-col h-full relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-950/30 px-3 py-1 rounded-full">
                  <Tag size={14} />
                  {item.inputs.niche}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(item)}
                    className={`p-1.5 rounded-lg transition-colors ${item.outputs.is_favorite ? 'text-rose-400 bg-rose-400/10' : 'text-zinc-500 hover:text-rose-400 hover:bg-zinc-800'}`}
                    title={item.outputs.is_favorite ? "Remover dos favoritos" : "Salvar como favorito"}
                  >
                    <Star size={18} className={item.outputs.is_favorite ? "fill-rose-400" : ""} />
                  </button>
                  <button
                    onClick={() => handleCopy(item)}
                    className="text-zinc-500 hover:text-emerald-500 hover:bg-zinc-800 p-1.5 rounded-lg transition-colors"
                    title="Copiar Copy"
                  >
                    {copied === item.id ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            
            <h3 className="font-bold text-zinc-100 text-lg mb-2 line-clamp-2">
              {item.outputs.variations ? item.outputs.variations[0].headline : item.outputs.copy?.headline}
            </h3>
            
            <p className="text-zinc-400 text-sm line-clamp-3 mb-4 flex-grow">
              {item.outputs.variations ? item.outputs.variations[0].primaryText : item.outputs.copy?.primaryText}
            </p>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-sm text-zinc-500 mt-auto">
              <div className="flex items-center gap-1">
                <Target size={14} />
                {item.inputs.objective}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
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
