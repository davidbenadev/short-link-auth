'use client';

import React, { useState } from 'react';
import { createShortLink } from '@/lib/actions/links';
import { Link as LinkIcon, Loader2 } from 'lucide-react';

export function LinkForm() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Basic validation
      new URL(url); // will throw if invalid URL
      
      await createShortLink({ 
        title,
        originalUrl: url
      });
      
      setUrl('');
      setTitle('');
    } catch (err: any) {
      setError(err.message || 'URL inválida o error en el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--color-background-paper)] p-6 rounded-xl shadow-[var(--shadow-soft)] border border-gray-100 mb-8 space-y-4">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        <LinkIcon className="text-[var(--color-primary)]" /> Acortar nuevo enlace
      </h2>
      
      <div className="flex flex-col gap-4">
        <div className="flex flex-col space-y-1">
          <label htmlFor="url" className="text-sm font-medium text-[var(--color-text-secondary)]">URL Original (Destino)</label>
          <input 
            id="url"
            type="url" 
            placeholder="https://ejemplo.com/articulo-muy-largo..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all bg-[var(--color-background-default)] text-[var(--color-text-primary)]"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="title" className="text-sm font-medium text-[var(--color-text-secondary)]">Título (Obligatorio)</label>
          <input 
            id="title"
            type="text" 
            placeholder="Ej. Campaña de Marketing 2026" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all bg-[var(--color-background-default)] text-[var(--color-text-primary)]"
          />
        </div>
      </div>

      {error && <p className="text-[var(--color-destructive)] text-sm mt-2">{error}</p>}

      <button 
        type="submit" 
        disabled={isLoading || !url}
        className="mt-4 w-full md:w-auto px-6 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
      >
        {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Acortar Enlace'}
      </button>
    </form>
  );
}
