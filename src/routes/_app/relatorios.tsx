import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
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
import { Field, Input } from "@/components/ui/field";
import { getReports } from "@/lib/server/insights";
import { formatCurrency, formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_app/relatorios")({ component: Page });

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

function Page() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const [startDate, setStartDate] = useState(isoDay(start));
  const [endDate, setEndDate] = useState(isoDay(end));
  const [data, setData] = useState<Awaited<ReturnType<typeof getReports>> | null>(null);

  useEffect(() => {
    getReports({ data: { startDate, endDate } })
      .then(setData)
      .catch(() => toast.error("Não foi possível montar o relatório."));
  }, [startDate, endDate]);

  const s = data?.summary;

  return (
    <div>
      <PageHeader title="Relatórios" description="Vendas, peças, serviços e clientes no intervalo." />
      <div className="mb-6 grid max-w-md grid-cols-2 gap-3">
        <Field label="De">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
        <Field label="Até">
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </Field>
      </div>

      {s ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Ordens" value={String(s.totalOrders)} />
          <Stat label="Faturamento" value={formatCurrency(s.totalRevenue)} />
          <Stat label="Recebido" value={formatCurrency(s.totalPaid)} />
          <Stat label="Ticket médio" value={formatCurrency(s.avgTicket)} />
        </div>
      ) : null}

      <section className="mt-6 rounded-[var(--radius-lg)] border border-line bg-surface p-5">
        <h2 className="font-display text-base font-semibold">Faturamento por dia</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.byDay ?? []}>
              <CartesianGrid stroke="#e2d9cc" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6e6860" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6e6860" }} />
              <Tooltip formatter={(v: number) => formatCurrency(Number(v))} />
              <Bar dataKey="revenue" fill="#0f6e6a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TableBlock
          title="Peças"
          rows={(data?.byProduct ?? []).map((p) => [p.name, `${p.quantity} un · ${p.category}`, formatCurrency(p.revenue)])}
        />
        <TableBlock
          title="Serviços"
          rows={(data?.byService ?? []).map((p) => [p.name, `${p.quantity} un`, formatCurrency(p.revenue)])}
        />
        <TableBlock
          title="Clientes"
          rows={(data?.byClient ?? []).map((p) => [p.name, `${p.orders} OS`, formatCurrency(p.total)])}
        />
        <TableBlock
          title="A receber"
          rows={
            s
              ? [[`Pendências no período`, formatDate(endDate), formatCurrency(s.totalPending)]]
              : []
          }
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{value}</p>
    </article>
  );
}

function TableBlock({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Sem dados neste intervalo.</p>
      ) : (
        <ul className="mt-4 space-y-3 text-sm">
          {rows.map((r, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{r[0]}</p>
                <p className="text-muted">{r[1]}</p>
              </div>
              <span className="tabular-nums">{r[2]}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
