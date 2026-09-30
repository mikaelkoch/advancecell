import { createFileRoute, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <main className="grid min-h-screen place-items-center bg-bg text-muted">Carregando…</main>;
  }
  if (user) return <Navigate to="/" />;

  return (
    <main className="grid min-h-screen bg-bg lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-fg lg:flex">
        <div>
          <div className="grid h-12 w-12 place-items-center rounded-[var(--radius-sm)] bg-accent text-accent-fg">
            <span className="font-display text-xl font-semibold">A</span>
          </div>
          <h1 className="mt-10 font-display text-4xl font-semibold leading-tight">
            A oficina, no ritmo
            <br />
            da bancada.
          </h1>
          <p className="mt-4 max-w-md text-sidebar-muted">
            Ordens de serviço, estoque, caixa e avisos ao cliente — um sistema para a Advancecell
            operar o dia inteiro sem planilha.
          </p>
        </div>
        <p className="text-sm text-sidebar-muted">Advancecell · Assistência técnica e acessórios</p>
      </section>
      <section className="grid place-items-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p className="font-display text-xl font-semibold">Advancecell</p>
            <p className="text-sm text-muted">Assistência técnica</p>
          </div>
          <h2 className="font-display text-2xl font-semibold">Entrar</h2>
          <p className="mt-1 text-sm text-muted">Acesse o painel da loja com sua conta.</p>
          <div className="mt-6 space-y-2">
            {authEnabled ? (
              GROK_PROVIDERS.map((p) => (
                <button
                  key={p.providerId}
                  type="button"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                  className="h-12 w-full rounded-[var(--radius-sm)] border border-line bg-surface text-sm font-medium text-ink hover:bg-bg"
                >
                  Continuar com {p.label}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted">O acesso está desativado.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
