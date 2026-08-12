'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, ExternalLink, Trash2 } from 'lucide-react';
import { deleteLink } from '@/lib/actions/links';

interface LinkCardProps {
  id: string;
  title: string;
  originalUrl: string;
  shortSlug: string;
  clicks: number;
}

export function LinkCard({ id, title, originalUrl, shortSlug, clicks }: LinkCardProps) {
  const qrRef = useRef<SVGSVGElement>(null);
  
  const envDomain = process.env.NEXT_PUBLIC_SHORT_DOMAIN;
  const domain = envDomain || (typeof window !== 'undefined' ? window.location.host : '');
  const protocol = domain.includes('localhost') || domain.includes('127.0.0.1') ? 'http://' : 'https://';
  
  const shortUrl = `${protocol}${domain}/${shortSlug}`;

  const downloadQR = () => {
    if (!qrRef.current) return;
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const downloadLink = document.createElement('a');
      downloadLink.download = `${shortSlug}-qr.png`;
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
  };

  const handleDelete = async () => {
    if(confirm('¿Estás seguro de eliminar este enlace?')) {
      try {
        await deleteLink(id);
      } catch (e) {
        console.error(e);
        alert('Error al eliminar');
      }
    }
  };

  return (
    <div className="bg-[var(--color-background-paper)] p-6 rounded-xl shadow-[var(--shadow-soft)] flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-100 transition-transform hover:-translate-y-1">
      <div className="flex-1 w-full space-y-3 overflow-hidden">
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-[var(--color-text-primary)] truncate">{title}</h3>
            <span className="text-xs font-medium bg-[var(--color-background-default)] px-2 py-1 rounded-full text-[var(--color-text-secondary)] whitespace-nowrap">
              {clicks} {clicks === 1 ? 'visita' : 'visitas'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href={shortUrl} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] font-medium hover:underline truncate flex items-center gap-1">
            {shortUrl} <ExternalLink size={14} />
          </a>
          <button 
            className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-1" 
            onClick={copyToClipboard}
            title="Copiar al portapapeles"
          >
            <Copy size={16} />
          </button>
        </div>
        <p className="text-[var(--color-text-secondary)] text-sm truncate max-w-full">
          {originalUrl}
        </p>
        
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
           <button 
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 transition-colors"
          >
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
          <QRCodeSVG 
            ref={qrRef}
            value={shortUrl} 
            size={100}
            level="H"
            includeMargin={true}
          />
        </div>
        <button 
          onClick={downloadQR}
          className="text-xs bg-[var(--color-accent)] text-[var(--color-accent-foreground)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
        >
          <Download size={14} /> QR
        </button>
      </div>
    </div>
  );
}
