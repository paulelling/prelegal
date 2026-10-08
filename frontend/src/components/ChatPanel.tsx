'use client';

import { useState, useEffect, useRef } from 'react';
import type { DocumentSlug } from '@/types/nda';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

<<<<<<< HEAD
interface FormUpdates {
  purpose?: string | null;
  effectiveDate?: string | null;
  mndaTermType?: 'expires' | 'continues' | null;
  mndaTermYears?: number | null;
  confidentialityTermType?: 'years' | 'perpetuity' | null;
  confidentialityTermYears?: number | null;
  governingLaw?: string | null;
  jurisdiction?: string | null;
  modifications?: string | null;
  party1?: Partial<NDAFormData['party1']> | null;
  party2?: Partial<NDAFormData['party2']> | null;
}

export interface ChatPanelProps {
  formData: NDAFormData;
  onFormUpdate: (updates: Partial<NDAFormData>) => void;
  token: string;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
}

function applyFormUpdates(
  current: Pick<NDAFormData, 'party1' | 'party2'>,
  updates: FormUpdates,
): Partial<NDAFormData> {
  const { party1, party2, ...scalars } = updates;
  const result: Partial<NDAFormData> = {};
  for (const [key, value] of Object.entries(scalars)) {
    if (value != null) (result as Record<string, unknown>)[key] = value;
  }
  if (party1 != null) result.party1 = { ...current.party1, ...party1 };
  if (party2 != null) result.party2 = { ...current.party2, ...party2 };
  return result;
}

export function ChatPanel({ formData, onFormUpdate, token, messages, onMessagesChange }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formDataRef = useRef(formData);
  const hasGreetedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasLoadingRef = useRef(false);
=======
interface ChatPanelProps {
  documentType: DocumentSlug;
  formFields: Record<string, string>;
  onFormUpdate: (updates: Record<string, string>) => void;
}

export function ChatPanel({ documentType, formFields, onFormUpdate }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formFieldsRef = useRef(formFields);
  const wasLoadingRef = useRef(false);
  const initialChatFired = useRef(false);
>>>>>>> origin/main

  useEffect(() => {
    formFieldsRef.current = formFields;
  }, [formFields]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

<<<<<<< HEAD
  // Refocus input after AI response lands
=======
  // Refocus input when AI finishes responding (UX fix)
>>>>>>> origin/main
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      inputRef.current?.focus();
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

<<<<<<< HEAD
  // Trigger initial greeting only on fresh mount with empty history
  useEffect(() => {
    if (!hasGreetedRef.current && messages.length === 0) {
      hasGreetedRef.current = true;
      callChat([], formData);
    }
=======
  useEffect(() => {
    if (initialChatFired.current) return;
    initialChatFired.current = true;
    callChat([], formFieldsRef.current);
>>>>>>> origin/main
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function callChat(history: Message[], currentFields: Record<string, string>) {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_type: documentType,
          messages: history,
          current_form_data: currentFields,
        }),
      });
      if (!res.ok) throw new Error('Chat request failed');
      const data = await res.json();

      if (data.form_updates) {
        const updates: Record<string, string> = {};
        for (const [key, value] of Object.entries(data.form_updates)) {
          if (value != null) updates[key] = String(value);
        }
        if (Object.keys(updates).length > 0) {
          onFormUpdate(updates);
        }
      }

      onMessagesChange([...history, { role: 'assistant', content: data.reply }]);
    } catch {
      onMessagesChange([
        ...history,
        { role: 'assistant', content: "Sorry, I couldn't connect. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
<<<<<<< HEAD
    const newHistory: Message[] = [...messages, { role: 'user', content: text }];
    onMessagesChange(newHistory);
    callChat(newHistory, formDataRef.current);
=======
    const userMessage: Message = { role: 'user', content: text };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    callChat(newHistory, formFieldsRef.current);
>>>>>>> origin/main
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pb-2 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' ? 'text-white' : 'bg-slate-100 text-slate-800'
              }`}
              style={msg.role === 'user' ? { background: '#209dd7' } : {}}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-xl px-4 py-3">
              <span className="inline-flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-200 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ background: '#753991' }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
