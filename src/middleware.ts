import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos el cliente regular porque el middleware corre en Edge runtime y Supabase-js es compatible.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Evitar rutas internas, api, y estáticas
  if (url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/dashboard') || 
      url.pathname.startsWith('/login') ||
      url.pathname === '/') {
    return NextResponse.next();
  }

  // Extraer el slug (ej. /xyz123)
  const slug = url.pathname.split('/')[1];
  
  if (!slug) return NextResponse.next();

  // Consultar en Supabase. Gracias a la política pública "Cualquiera puede leer para ser redirigido",
  // no necesitamos estar autenticados.
  const { data: link, error } = await supabase
    .from('links')
    .select('original_url, id, clicks')
    .eq('short_slug', slug)
    .single();

  if (link?.original_url) {
    // Analytics (opcional): Actualizar el contador de clicks de manera asíncrona usando fetch o rpc.
    // Para simplificar, aquí redirigimos directamente.
    
    // Redirección permanente
    return NextResponse.redirect(new URL(link.original_url), 301);
  }

  // Si no se encuentra, continuar a la página de 404
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
