'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { LogOut, Home as HomeIcon, User, CreditCard, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <nav className="bg-[#1A1A1A] border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 text-zinc-100 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title="Início"
            >
              <HomeIcon size={20} />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className="font-bold text-xl tracking-tight hidden sm:block text-zinc-100">Ad Prompt BR</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            {user && (
              <Link href="/dashboard" className="text-sm font-medium text-zinc-100 hover:text-white transition-colors hidden sm:block">
                Dashboard
              </Link>
            )}
            <Link href="/plans" className="text-sm font-medium text-zinc-100 hover:text-white transition-colors hidden sm:block">
              Planos
            </Link>

            {user ? (
              <>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 hover:bg-zinc-800 p-1.5 pr-3 rounded-full border border-zinc-800 transition-colors"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                      <User size={16} />
                    </div>
                  )}
                  <span className="text-sm font-medium text-zinc-300 hidden sm:block">{displayName}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#1A1A1A] border border-zinc-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-zinc-800 mb-2">
                      <p className="text-sm font-medium text-zinc-100 truncate">{displayName}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-2 transition-colors sm:hidden"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <Link
                      href="/plans"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-2 transition-colors sm:hidden"
                    >
                      <CreditCard size={16} />
                      Planos
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} />
                      Sair da conta
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={async () => {
                  try {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: 'https://ad-prompt-br.vercel.app',
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
                className="bg-[#EA4335] hover:bg-[#D23E31] text-white font-medium py-2 px-6 rounded-full flex items-center gap-2 text-sm transition-colors"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4 bg-white rounded-full p-0.5" alt="Google" />
                Entrar com Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
