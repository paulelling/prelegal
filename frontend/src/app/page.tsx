'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatPanel, Message } from '@/components/ChatPanel';
import { NDAPreview } from '@/components/NDAPreview';
import { DownloadButton } from '@/components/DownloadButton';
import { DocumentHistory, LoadedDocument } from '@/components/DocumentHistory';
import { NDAFormData, defaultFormData } from '@/types/nda';

function generateDocTitle(formData: NDAFormData): string {
  const p1 = formData.party1.company || formData.party1.name || 'Party 1';
  const p2 = formData.party2.company || formData.party2.name || 'Party 2';
  return `${p1} / ${p2} – Mutual NDA`;
}

export default function Home() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [userEmail, setUserEmail] = useState('');
  const [token, setToken] = useState('');

  const [formData, setFormData] = useState<NDAFormData>(defaultFormData);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatKey, setChatKey] = useState(0);
  const [currentDocId, setCurrentDocId] = useState<number | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('prelegal_auth');
    if (!raw) {
      setAuthState('unauthenticated');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.token) {
        setAuthState('unauthenticated');
        return;
      }
      setToken(parsed.token);
      setUserEmail(parsed.email ?? '');
      setAuthState('authenticated');
    } catch {
      setAuthState('unauthenticated');
    }
  }, []);

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/login');
    }
  }, [authState, router]);

  function handleSignOut() {
    localStorage.removeItem('prelegal_auth');
    router.push('/login');
  }

  function handleFormUpdate(updates: Partial<NDAFormData>) {
    setFormData((prev) => ({ ...prev, ...updates }));
  }

  function handleNewDocument() {
    setFormData(defaultFormData);
    setMessages([]);
    setCurrentDocId(null);
    setChatKey((k) => k + 1);
  }

  function handleDocumentLoad(doc: LoadedDocument) {
    setFormData(doc.form_data as unknown as NDAFormData);
    setMessages(doc.messages);
    setCurrentDocId(doc.id);
    setChatKey((k) => k + 1);
  }

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSaveToast(msg);
    toastTimerRef.current = setTimeout(() => setSaveToast(''), 3000);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const title = generateDocTitle(formData);
      const body = { title, document_type: 'mutual_nda', form_data: formData, messages };
      const url = currentDocId ? `/api/documents/${currentDocId}` : '/api/documents';
      const method = currentDocId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);

      if (res.ok) {
        if (!currentDocId && data?.id) setCurrentDocId(data.id);
        showToast('Saved');
        setHistoryRefresh((n) => n + 1);
      } else {
        showToast('Save failed');
      }
    } catch {
      showToast('Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  if (authState !== 'authenticated') return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
              style={{ background: '#ecad0a' }}
            >
              P
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#032147' }}>Prelegal</h1>
              <p className="text-xs" style={{ color: '#888888' }}>AI-powered legal document drafting</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Save toast */}
            {saveToast && (
              <span
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={
                  saveToast === 'Saved'
                    ? { background: '#dcfce7', color: '#16a34a' }
                    : { background: '#fee2e2', color: '#dc2626' }
                }
              >
                {saveToast}
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-sm px-3 py-1.5 rounded-lg text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-1.5"
              style={{ background: '#209dd7' }}
            >
              {isSaving && (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {currentDocId ? 'Update' : 'Save Document'}
            </button>

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

      {/* Main — three columns */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-6" style={{ minHeight: 'calc(100vh - 9rem)' }}>
          {/* Sidebar: document history */}
          <DocumentHistory
            token={token}
            currentDocId={currentDocId}
            refreshTrigger={historyRefresh}
            onDocumentLoad={handleDocumentLoad}
            onNewDocument={handleNewDocument}
          />

          {/* Chat panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200" style={{ background: '#f8fafc' }}>
              <h2 className="text-base font-semibold" style={{ color: '#032147' }}>AI Assistant</h2>
              <p className="text-sm" style={{ color: '#888888' }}>Chat with the AI to fill in your agreement</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col min-h-0">
              <ChatPanel
                key={chatKey}
                formData={formData}
                onFormUpdate={handleFormUpdate}
                token={token}
                messages={messages}
                onMessagesChange={setMessages}
              />
            </div>
          </div>

          {/* Preview panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {/* Disclaimer */}
            <div
              className="px-4 py-2 text-xs font-medium border-b"
              style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}
            >
              Draft only — AI-generated documents must be reviewed by a qualified attorney before use.
            </div>
            <div className="px-6 py-4 border-b border-slate-200" style={{ background: '#f8fafc' }}>
              <h2 className="text-base font-semibold" style={{ color: '#032147' }}>Document Preview</h2>
              <p className="text-sm" style={{ color: '#888888' }}>Live preview of your Mutual NDA</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <NDAPreview formData={formData} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-4 text-center text-sm" style={{ color: '#888888' }}>
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
