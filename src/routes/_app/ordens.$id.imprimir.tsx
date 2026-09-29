import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/lib/server/orders";
import type { ServiceOrder } from "@/lib/types";
import { formatCurrency, formatDate, formatPhone } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/domain";

export const Route = createFileRoute("/_app/ordens/$id/imprimir")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrder({ data: { id } })
      .then(setOrder)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro"));
  }, [id]);

  if (error) return <p className="text-danger">{error}</p>;
  if (!order) return <p className="text-muted">Carregando OS…</p>;

  return (
    <div>
      <div className="no-print mb-6 flex items-center justify-between">
        <PageHeader title={`OS #${order.orderNumber}`} description="Documento para o cliente e para a bancada." />
        <div className="flex gap-2">
          <Link to="/ordens" className="inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-line px-4 text-sm">
            Voltar
          </Link>
          <Button onClick={() => window.print()}>Imprimir</Button>
        </div>
      </div>
      <article className="mx-auto max-w-2xl rounded-[var(--radius-lg)] border border-line bg-surface p-8">
        <header className="flex items-start justify-between border-b border-line pb-4">
          <div>
            <p className="font-display text-xl font-semibold">Advancecell</p>
            <p className="text-sm text-muted">Assistência técnica e acessórios</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-semibold tabular-nums">OS #{order.orderNumber}</p>
            <p className="text-sm text-muted">{STATUS_LABELS[order.status]}</p>
          </div>
        </header>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted">Cliente</dt>
            <dd className="font-medium">{order.clientName}</dd>
            <dd>{formatPhone(order.clientPhone)}</dd>
          </div>
          <div>
            <dt className="text-muted">Entrada</dt>
            <dd>{formatDate(order.createdAt)}</dd>
            {order.estimatedDate ? <dd>Previsão {formatDate(order.estimatedDate)}</dd> : null}
          </div>
          <div className="col-span-2">
            <dt className="text-muted">Aparelho</dt>
            <dd className="font-medium">
              {order.deviceBrand} {order.deviceModel}
            </dd>
            {order.deviceImei ? <dd>IMEI {order.deviceImei}</dd> : null}
          </div>
          <div className="col-span-2">
            <dt className="text-muted">Defeito</dt>
            <dd>{order.defectDesc}</dd>
          </div>
          {order.diagnosis ? (
            <div className="col-span-2">
              <dt className="text-muted">Diagnóstico</dt>
              <dd>{order.diagnosis}</dd>
            </div>
          ) : null}
        </dl>
        {order.services.length > 0 ? (
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2 font-medium">Serviço</th>
                <th className="py-2 font-medium">Qtd</th>
                <th className="py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.services.map((s) => (
                <tr key={s.id} className="border-b border-line">
                  <td className="py-2">{s.serviceName}</td>
                  <td className="py-2 tabular-nums">{s.quantity}</td>
                  <td className="py-2 tabular-nums">{formatCurrency(s.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        {order.items.length > 0 ? (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2 font-medium">Peça</th>
                <th className="py-2 font-medium">Qtd</th>
                <th className="py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((s) => (
                <tr key={s.id} className="border-b border-line">
                  <td className="py-2">{s.productName}</td>
                  <td className="py-2 tabular-nums">{s.quantity}</td>
                  <td className="py-2 tabular-nums">{formatCurrency(s.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        <div className="mt-6 space-y-1 text-sm">
          <p className="flex justify-between">
            <span className="text-muted">Mão de obra</span>
            <span className="tabular-nums">{formatCurrency(order.laborPrice)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted">Peças</span>
            <span className="tabular-nums">{formatCurrency(order.partsPrice)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted">Desconto</span>
            <span className="tabular-nums">{formatCurrency(order.discount)}</span>
          </p>
          <p className="flex justify-between font-display text-lg font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(order.totalPrice)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted">Pago</span>
            <span className="tabular-nums">{formatCurrency(order.paidAmount)}</span>
          </p>
        </div>
        <p className="mt-8 text-xs text-muted">Garantia de {order.warrantyDays} dias sobre o serviço executado.</p>
      </article>
    </div>
  );
}
