'use client';

import { useCallback, useEffect, useState } from 'react';
import { NDAFormData } from '@/types/nda';
import { Message } from '@/components/ChatPanel';

interface DocumentSummary {
  id: number;
  title: string;
  document_type: string;
  created_at: string;
  updated_at: string;
}

export interface LoadedDocument {
  id: number;
  title: string;
  document_type: string;
  form_data: Record<string, unknown>;
  messages: Message[];
}

interface DocumentHistoryProps {
  token: string;
  currentDocId: number | null;
  refreshTrigger: number;
  onDocumentLoad: (doc: LoadedDocument) => void;
  onNewDocument: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DocumentHistory({
  token,
  currentDocId,
  refreshTrigger,
  onDocumentLoad,
  onNewDocument,
}: DocumentHistoryProps) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDocuments(await res.json());
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, refreshTrigger]);

  async function handleDocumentClick(id: number) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const doc = await res.json();
        onDocumentLoad({
          id: doc.id,
          title: doc.title,
          document_type: doc.document_type,
          form_data: doc.form_data as Record<string, unknown>,
          messages: doc.messages as Message[],
        });
      }
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between" style={{ background: '#f8fafc' }}>
        <h2 className="text-sm font-semibold" style={{ color: '#032147' }}>My Documents</h2>
        <button
          onClick={onNewDocument}
          className="text-xs px-2.5 py-1 rounded-lg text-white font-medium transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: '#209dd7' }}
        >
          + New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="inline-flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs leading-relaxed" style={{ color: '#888888' }}>
              No saved documents yet.
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#888888' }}>
              Use the Save button to keep your drafts.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  onClick={() => handleDocumentClick(doc.id)}
                  disabled={loadingId === doc.id}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 disabled:opacity-50 ${
                    doc.id === currentDocId ? 'bg-blue-50 border-l-2' : ''
                  }`}
                  style={doc.id === currentDocId ? { borderColor: '#209dd7' } : {}}
                >
                  <p className="text-xs font-medium leading-snug truncate" style={{ color: '#032147' }}>
                    {doc.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
                    {formatDate(doc.updated_at)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
