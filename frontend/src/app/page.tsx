'use client';

import { useState } from 'react';
import { NDAForm } from '@/components/NDAForm';
import { NDAPreview } from '@/components/NDAPreview';
import { DownloadButton } from '@/components/DownloadButton';
import { defaultFormData } from '@/types/nda';

export default function Home() {
  const [formData, setFormData] = useState(defaultFormData);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#032147' }}>
              Mutual NDA Creator
            </h1>
            <p className="text-sm" style={{ color: '#888888' }}>
              Fill in the form to generate your Mutual Non-Disclosure Agreement
            </p>
          </div>
          <DownloadButton formData={formData} />
        </div>
      </header>

      {/* Main — split panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Form panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200" style={{ background: '#f8fafc' }}>
              <h2 className="text-base font-semibold" style={{ color: '#032147' }}>Agreement Details</h2>
              <p className="text-sm" style={{ color: '#888888' }}>Complete all fields — the preview updates live</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <NDAForm formData={formData} onChange={setFormData} />
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
