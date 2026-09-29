import { createFileRoute, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn, authClient } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Field } from "@/components/ui/field";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending: authPending } = useCurrentUserState();
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authPending) {
    return <main className="grid min-h-screen place-items-center bg-bg text-muted">Carregando…</main>;
  }
  if (user) return <Navigate to="/" />;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (error) throw new Error(error.message);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

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
              <>
                <div className="space-y-2">
                  {GROK_PROVIDERS.map((p) => (
                    <button
                      key={p.providerId}
                      type="button"
                      onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                      className="h-12 w-full rounded-[var(--radius-sm)] border border-line bg-surface text-sm font-medium text-ink hover:bg-bg"
                    >
                      Continuar com {p.label}
                    </button>
                  ))}
                </div>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-bg px-2 text-muted">ou</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEmailLogin(true)}
                >
                  Entrar com email e senha
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted">O acesso está desativado.</p>
            )}
          </div>

          {isEmailLogin && (
            <div className="mt-6 p-6 border border-line bg-surface rounded-[var(--radius-sm)]">
              <h3 className="font-display text-lg font-semibold mb-1">
                {isSignUp ? "Criar conta" : "Entrar com email"}
              </h3>
              <form onSubmit={handleEmailSignIn} className="space-y-4 mt-4">
{error && (
                    <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-[var(--radius-sm)]">
                      {error}
                    </div>
                  )}
                  {isSignUp && (
                    <Field label="Nome">
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Seu nome"
                        autoComplete="name"
                      />
                    </Field>
                  )}
                  <Field label="Email">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </Field>
                <Field label="Senha">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                </Field>
                <Button type="submit" className="w-full" loading={loading}>
                  {loading ? "Entrando..." : (isSignUp ? "Criar conta" : "Entrar")}
                </Button>
                <p className="text-center text-sm text-muted">
                  {isSignUp ? "Já tem conta? " : "Não tem conta? "}
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                    className="text-accent hover:underline"
                  >
                    {isSignUp ? "Entrar" : "Criar conta"}
                  </button>
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setIsEmailLogin(false)}
                >
                  Voltar
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}