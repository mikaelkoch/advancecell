import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Package, Users, Wrench, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getDashboard } from "@/lib/server/insights";
import { listOrders } from "@/lib/server/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ServiceOrder } from "@/lib/types";

export const Route = createFileRoute("/_app/")({ component: DashboardPage });

type Dash = Awaited<ReturnType<typeof getDashboard>>;

function Trend({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-muted">sem base anterior</span>;
  const up = value >= 0;
  return (
    <span className={up ? "text-xs text-ok" : "text-xs text-danger"}>
      {up ? "+" : ""}
      {value}% vs período anterior
    </span>
  );
}

function DashboardPage() {
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">("month");
  const [data, setData] = useState<Dash | null>(null);
  const [recent, setRecent] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    Promise.all([getDashboard({ data: { period } }), listOrders()])
      .then(([d, orders]) => {
        if (!live) return;
        setData(d);
        setRecent(orders.slice(0, 6));
      })
      .catch(() => {
        if (live) setData(null);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [period]);

  const kpis = data?.kpis;

  return (
    <div>
      <PageHeader
        title="Painel"
        description="Movimento da oficina no período selecionado."
        actions={
          <div className="flex rounded-[var(--radius-sm)] border border-line bg-surface p-1">
            {(
              [
                ["today", "Hoje"],
                ["week", "7 dias"],
                ["month", "30 dias"],
                ["year", "12 meses"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPeriod(id)}
                className={`h-9 rounded-md px-3 text-sm ${period === id ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-[var(--radius-lg)] bg-line" />
          ))}
        </div>
      ) : null}

      {kpis ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi icon={Wallet} label="Faturamento" value={formatCurrency(kpis.revenue)} trend={kpis.revenueTrend} />
          <Kpi icon={Wrench} label="OS no período" value={String(kpis.ordersPeriod)} trend={kpis.ordersTrend} />
          <Kpi icon={Users} label="Clientes" value={String(kpis.totalClients)} />
          <Kpi icon={Package} label="Ticket médio" value={formatCurrency(kpis.avgTicket)} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-3">
          <h2 className="font-display text-base font-semibold">Faturamento mensal</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthly ?? []}>
                <CartesianGrid stroke="#e2d9cc" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6e6860" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6e6860" }} />
                <Tooltip formatter={(v: number) => formatCurrency(Number(v))} />
                <Bar dataKey="revenue" fill="#0f6e6a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="font-display text-base font-semibold">OS por status</h2>
          <ul className="mt-4 space-y-3">
            {(data?.ordersByStatus ?? []).map((s) => (
              <li key={s.status} className="flex items-center justify-between text-sm">
                <StatusBadge status={s.status} />
                <span className="tabular-nums font-medium">{s.count}</span>
              </li>
            ))}
            {data && data.ordersByStatus.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma OS neste período.</p>
            ) : null}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Ordens recentes</h2>
            <Link to="/ordens" className="text-sm text-accent hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-2 font-medium">OS</th>
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Aparelho</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="py-3 tabular-nums">#{o.orderNumber}</td>
                    <td className="py-3">{o.clientName}</td>
                    <td className="py-3 text-muted">
                      {o.deviceBrand} {o.deviceModel}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 tabular-nums">{formatCurrency(o.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <AlertTriangle className="h-4 w-4 text-warn" />
            Estoque baixo
          </h2>
          <ul className="mt-4 space-y-3">
            {(data?.lowStock ?? []).map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-muted">{p.category}</p>
                </div>
                <span className="tabular-nums text-danger">
                  {p.stock}/{p.minStock}
                </span>
              </li>
            ))}
            {data && data.lowStock.length === 0 ? (
              <p className="text-sm text-muted">Nenhum item abaixo do mínimo.</p>
            ) : null}
          </ul>
          <Link
            to="/produtos"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-sm)] border border-line text-sm font-medium hover:bg-bg"
          >
            Ir para produtos
          </Link>
        </section>
      </div>
      <p className="mt-4 hidden text-xs text-muted">{kpis ? formatDate(new Date()) : null}</p>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  trend?: number | null;
}) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4" />
        <p className="text-sm">{label}</p>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tabular-nums">{value}</p>
      {trend !== undefined ? <div className="mt-2"><Trend value={trend} /></div> : null}
    </article>
  );
}
