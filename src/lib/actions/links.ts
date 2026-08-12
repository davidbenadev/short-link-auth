'use server';

import { createClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';

export async function createShortLink({ originalUrl, customDomain }: { originalUrl: string, customDomain?: string }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  // En este prototipo asumimos que el usuario puede o no estar autenticado,
  // pero RLS exige que lo esté. Si queremos permitir anónimos habría que ajustar RLS.
  if (!user) {
    throw new Error("No autorizado. Por favor inicia sesión.");
  }

  const shortSlug = Math.random().toString(36).substring(2, 8);

  const { data, error } = await supabase
    .from('links')
    .insert([{ 
      user_id: user.id, 
      original_url: originalUrl, 
      short_slug: shortSlug,
      custom_domain: customDomain
    }])
    .select()
    .single();

  if (error) {
    console.error('Error insertando link:', error);
    throw new Error('Fallo al crear el enlace corto');
  }

  revalidatePath('/dashboard');
  return data;
}

export async function deleteLink(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('links').delete().eq('id', id);
  if (error) throw new Error('Fallo al eliminar el enlace');
  revalidatePath('/dashboard');
}
