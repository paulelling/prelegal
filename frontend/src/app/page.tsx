'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatPanel } from '@/components/ChatPanel';
import { NDAPreview } from '@/components/NDAPreview';
import { DownloadButton } from '@/components/DownloadButton';
import { NDAFormData, defaultFormData } from '@/types/nda';

export default function Home() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [userEmail, setUserEmail] = useState<string>('');
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    const raw = localStorage.getItem('prelegal_auth');
    if (!raw) {
      setAuthState('unauthenticated');
    } else {
      try {
        const parsed = JSON.parse(raw);
        setUserEmail(parsed.email ?? '');
        setAuthState('authenticated');
      } catch {
        setAuthState('unauthenticated');
      }
    }
  }, []);

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    }
  }, [authState, router]);

  const handleSignOut = () => {
    localStorage.removeItem('prelegal_auth');
    router.push('/login');
  };

  const handleFormUpdate = (updates: Partial<NDAFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  if (authState !== 'authenticated') return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: '#ecad0a' }}
            >
              P
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#032147' }}>
                Mutual NDA Creator
              </h1>
              <p className="text-sm" style={{ color: '#888888' }}>
                Chat with the AI to generate your Mutual Non-Disclosure Agreement
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DownloadButton formData={formData} />
            {userEmail && (
              <span className="text-sm hidden sm:block" style={{ color: '#888888' }}>
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              style={{ color: '#888888' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main — split panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Form panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200" style={{ background: '#f8fafc' }}>
              <h2 className="text-base font-semibold" style={{ color: '#032147' }}>AI Assistant</h2>
              <p className="text-sm" style={{ color: '#888888' }}>Chat with the AI to fill in your agreement</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col">
              <ChatPanel formData={formData} onFormUpdate={handleFormUpdate} />
            </div>
          </div>

          {/* Preview panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200" style={{ background: '#f8fafc' }}>
              <h2 className="text-base font-semibold" style={{ color: '#032147' }}>Document Preview</h2>
              <p className="text-sm" style={{ color: '#888888' }}>Live preview of your completed NDA</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <NDAPreview formData={formData} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm" style={{ color: '#888888' }}>
          Based on{' '}
          <a
            href="https://commonpaper.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#209dd7' }}
            className="hover:underline"
          >
            Common Paper
          </a>{' '}
          Standard Terms, licensed under{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#209dd7' }}
            className="hover:underline"
          >
            CC BY 4.0
          </a>
        </div>
      </footer>
    </div>
  );
}
