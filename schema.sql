-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla principal de enlaces
CREATE TABLE public.links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    short_slug TEXT NOT NULL UNIQUE,
    custom_domain TEXT,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para búsquedas y redirecciones rápidas
CREATE INDEX links_short_slug_idx ON public.links(short_slug);
CREATE INDEX links_user_id_idx ON public.links(user_id);

-- Configuración de Row Level Security (RLS)
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
CREATE POLICY "Usuarios ven sus propios enlaces"
    ON public.links FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus propios enlaces"
    ON public.links FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus propios enlaces"
    ON public.links FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus propios enlaces"
    ON public.links FOR DELETE USING (auth.uid() = user_id);

-- Política Pública: El middleware necesita leer el slug para redirigir, sin importar la sesión
CREATE POLICY "Cualquiera puede leer para ser redirigido"
    ON public.links FOR SELECT USING (true);
