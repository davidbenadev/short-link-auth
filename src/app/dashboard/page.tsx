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
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <header className="mb-10 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Gestiona tus enlaces cortos y códigos QR</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
          <span>{user.email}</span>
          <form action={logout}>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4 md:sticky md:top-6">
          <LinkForm />
        </div>

        <div className="md:col-span-8 space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">Tus Enlaces</h2>
          
          {links?.length === 0 && (
            <div className="text-center py-16 bg-[var(--color-background-paper)] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-[var(--color-text-muted)]">No tienes enlaces aún. Crea uno a la izquierda.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {links?.map((link) => (
              <LinkCard 
                key={link.id}
                id={link.id}
                title={link.title}
                originalUrl={link.original_url}
                shortSlug={link.short_slug}
                clicks={link.clicks || 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
