import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Wallet,
  MessageCircle,
  Wrench,
  Package,
  FolderOpen,
  Users,
  Settings2,
  Menu,
  X,
} from "lucide-react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { bootstrapShop } from "@/lib/server/catalog";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/ordens", label: "Ordens", icon: Wrench },
  { to: "/caixa", label: "Caixa", icon: Wallet },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/categorias", label: "Categorias", icon: FolderOpen },
  { to: "/servicos", label: "Serviços", icon: Settings2 },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    void bootstrapShop();
  }, [user]);

  if (isPending) {
    return (
      <div className="flex min-h-screen bg-bg">
        <div className="hidden w-64 bg-sidebar md:block" />
        <div className="flex-1 p-6">
          <div className="h-8 w-48 animate-pulse rounded-md bg-line" />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="h-28 animate-pulse rounded-[var(--radius-lg)] bg-line" />
            <div className="h-28 animate-pulse rounded-[var(--radius-lg)] bg-line" />
            <div className="h-28 animate-pulse rounded-[var(--radius-lg)] bg-line" />
          </div>
        </div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const links = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Navegação principal">
      {nav.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 text-sm font-medium transition-colors",
              active ? "bg-accent text-accent-fg" : "text-sidebar-fg/80 hover:bg-white/8 hover:text-sidebar-fg",
            )}
            aria-current={active ? "page" : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg text-ink md:grid md:grid-cols-[16rem_1fr]">
      <aside className="hidden flex-col bg-sidebar text-sidebar-fg md:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] bg-accent text-accent-fg">
            <span className="font-display text-lg font-semibold">A</span>
          </div>
          <div>
            <p className="font-display text-base font-semibold leading-tight">Advancecell</p>
            <p className="text-xs text-sidebar-muted">Assistência técnica</p>
          </div>
        </div>
        {links}
        <div className="mt-auto border-t border-white/10 p-4 text-sidebar-fg">
          <UserButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-accent text-accent-fg">
              <span className="font-display text-sm font-semibold">A</span>
            </div>
            <span className="font-display text-sm font-semibold">Advancecell</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>
        {open ? (
          <div className="fixed inset-0 z-40 bg-sidebar md:hidden">
            <div className="flex h-14 items-center justify-between px-4">
              <span className="font-display text-sidebar-fg">Menu</span>
              <Button variant="ghost" size="icon" className="text-sidebar-fg" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {links}
            <div className="p-4 text-sidebar-fg">
              <UserButton />
            </div>
          </div>
        ) : null}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
