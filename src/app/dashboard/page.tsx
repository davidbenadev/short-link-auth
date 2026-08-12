import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LinkCard } from '@/components/links/LinkCard';
import { LinkForm } from '@/components/links/LinkForm';
import { logout } from '@/lib/actions/auth';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener los enlaces del usuario (o de la tabla entera si probamos sin RLS local)
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Gestiona tus enlaces cortos y códigos QR</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
          <span>{user.email}</span>
          <form action={logout}>
            <button 
              type="submit"
              className="px-3 py-1.5 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md transition-colors"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      <LinkForm />

      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Tus Enlaces</h2>
        
        {links?.length === 0 && (
          <p className="text-[var(--color-text-muted)] text-center py-8">No tienes enlaces aún. Crea uno arriba.</p>
        )}

        <div className="grid gap-4">
          {links?.map((link) => (
            <LinkCard 
              key={link.id}
              id={link.id}
              originalUrl={link.original_url}
              shortSlug={link.short_slug}
              customDomain={link.custom_domain}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
