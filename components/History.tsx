'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { Loader2, Calendar, Tag, Target } from 'lucide-react';

export function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="text-zinc-400" size={32} />
        </div>
        <h3 className="text-xl font-medium text-zinc-900 mb-2">Nenhum histórico encontrado</h3>
        <p className="text-zinc-500 max-w-md">
          Você ainda não gerou nenhum criativo. Volte para a aba &quot;Gerar Criativos&quot; e faça sua primeira geração!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">Seus Criativos Gerados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div key={item.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-4 bg-indigo-50 w-fit px-3 py-1 rounded-full">
              <Tag size={14} />
              {item.inputs.niche}
            </div>
            
            <h3 className="font-bold text-zinc-900 text-lg mb-2 line-clamp-2">
              {item.outputs.copy.headline}
            </h3>
            
            <p className="text-zinc-600 text-sm line-clamp-3 mb-4">
              {item.outputs.copy.primaryText}
            </p>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-sm text-zinc-500">
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
    </div>
  );
}
