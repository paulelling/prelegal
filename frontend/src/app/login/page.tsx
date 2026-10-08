'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function switchTab(next: Tab) {
    setTab(next);
    setError('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (tab === 'signup') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    try {
      const endpoint = tab === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Something went wrong. Please try again.');
        return;
      }

      const data = await res.json();
      localStorage.setItem(
        'prelegal_auth',
        JSON.stringify({ token: data.token, email: data.email, user_id: data.user_id }),
      );
      router.push('/');
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #032147 0%, #053a7a 100%)' }}
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-lg"
              style={{ background: '#ecad0a' }}
            >
              P
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">Prelegal</span>
          </div>
          <p className="text-sm" style={{ color: '#888888' }}>
            Draft legal agreements with AI assistance
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${
                  tab === t ? 'bg-white' : 'bg-slate-50 text-slate-500 hover:text-slate-700 border-transparent'
                }`}
                style={tab === t ? { borderColor: '#753991', color: '#753991' } : {}}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#032147' }}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#032147' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder={tab === 'signup' ? 'At least 8 characters' : '••••••••'}
                  autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                  required
                />
              </div>

              {tab === 'signup' && (
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium mb-1" style={{ color: '#032147' }}>
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: '#753991' }}
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {tab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#475569' }}>
          Based on{' '}
          <a
            href="https://commonpaper.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#888888' }}
            className="hover:underline"
          >
            Common Paper
          </a>{' '}
          standard legal templates
        </p>
      </div>
    </div>
  );
}
