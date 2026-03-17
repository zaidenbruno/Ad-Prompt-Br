'use client';

import { useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { Dashboard } from '../../components/Dashboard';
import { History } from '../../components/History';
import { LayoutDashboard, History as HistoryIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const router = useRouter();

  useEffect(() => {
    // Allow anonymous users to access the dashboard
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#121212] text-zinc-100">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                : 'bg-[#1A1A1A] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <LayoutDashboard size={18} />
            Gerar Criativos
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                : 'bg-[#1A1A1A] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <HistoryIcon size={18} />
            Histórico
          </button>
        </div>

        {activeTab === 'dashboard' ? <Dashboard /> : <History />}
      </main>
    </div>
  );
}
