import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PAYMENT_METHODS, STATUS_FLOW, STATUS_LABELS, type ServiceOrderStatus } from "@/lib/domain";
import { listClients, listProducts, listServiceTypes } from "@/lib/server/catalog";
import { changeOrderStatus, deleteOrder, listOrders, saveOrder } from "@/lib/server/orders";
import type { Client, Product, ServiceOrder, ServiceType } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_app/ordens")({ component: Page });

type ItemLine = { productId: string; quantity: number; unitPrice: string };
type SvcLine = { serviceTypeId: string; quantity: number; unitPrice: string; notes: string };

const emptyForm = {
  clientId: "",
  deviceBrand: "",
  deviceModel: "",
  deviceSerial: "",
  deviceImei: "",
  defectDesc: "",
  accessories: "",
  diagnosis: "",
  solution: "",
  technician: "",
  warrantyDays: "90",
  discount: "0",
  paidAmount: "0",
  paymentMethod: "",
  notes: "",
  estimatedDate: "",
  items: [] as ItemLine[],
  services: [] as SvcLine[],
};

function Page() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [status, setStatus] = useState<ServiceOrderStatus | "all">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceOrder | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([listOrders(), listClients(), listProducts(), listServiceTypes()])
      .then(([o, c, p, t]) => {
        setOrders(o);
        setClients(c);
        setProducts(p);
        setTypes(t);
      })
      .catch(() => toast.error("Não foi possível carregar as ordens."));

  useEffect(() => {
    void load();
  }, []);

  const start = (row?: ServiceOrder) => {
    setEditing(row ?? null);
    setForm(
      row
        ? {
            clientId: row.clientId,
            deviceBrand: row.deviceBrand,
            deviceModel: row.deviceModel,
            deviceSerial: row.deviceSerial ?? "",
            deviceImei: row.deviceImei ?? "",
            defectDesc: row.defectDesc,
            accessories: row.accessories ?? "",
            diagnosis: row.diagnosis ?? "",
            solution: row.solution ?? "",
            technician: row.technician ?? "",
            warrantyDays: String(row.warrantyDays),
            discount: String(row.discount),
            paidAmount: String(row.paidAmount),
            paymentMethod: row.paymentMethod ?? "",
            notes: row.notes ?? "",
            estimatedDate: row.estimatedDate ? row.estimatedDate.slice(0, 10) : "",
            items: row.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: String(i.unitPrice),
            })),
            services: row.services.map((s) => ({
              serviceTypeId: s.serviceTypeId,
              quantity: s.quantity,
              unitPrice: String(s.unitPrice),
              notes: s.notes ?? "",
            })),
          }
        : { ...emptyForm, clientId: clients[0]?.id ?? "" },
    );
    setOpen(true);
  };

  const totals = useMemo(() => {
    const parts = form.items.reduce((s, i) => s + i.quantity * Number(i.unitPrice || 0), 0);
    const labor = form.services.reduce((s, i) => s + i.quantity * Number(i.unitPrice || 0), 0);
    const discount = Number(form.discount || 0);
    return { parts, labor, total: parts + labor - discount };
  }, [form]);

  const filtered = orders.filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    if (!q) return true;
    const hay = `${o.orderNumber} ${o.clientName} ${o.deviceBrand} ${o.deviceModel}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        title="Ordens de serviço"
        description="Da entrada na bancada até a entrega."
        actions={<Button onClick={() => start()}>Nova OS</Button>}
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input className="max-w-sm" placeholder="Buscar OS, cliente ou aparelho" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="max-w-xs" value={status} onChange={(e) => setStatus(e.target.value as ServiceOrderStatus | "all")}>
          <option value="all">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">OS</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Aparelho</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-line align-top">
                <td className="px-4 py-3">
                  <p className="font-medium tabular-nums">#{o.orderNumber}</p>
                  <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                </td>
                <td className="px-4 py-3">{o.clientName}</td>
                <td className="px-4 py-3">
                  <p>
                    {o.deviceBrand} {o.deviceModel}
                  </p>
                  <p className="text-muted">{o.defectDesc}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                  <div className="mt-2 flex flex-wrap gap-1">
                    {STATUS_FLOW[o.status].map((next) => (
                      <button
                        key={next}
                        type="button"
                        className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted hover:text-ink"
                        onClick={async () => {
                          try {
                            await changeOrderStatus({ data: { id: o.id, status: next } });
                            toast.success(`OS #${o.orderNumber} → ${STATUS_LABELS[next]}`);
                            void load();
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "Erro");
                          }
                        }}
                      >
                        {STATUS_LABELS[next]}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(o.totalPrice)}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(o.paidAmount)}</td>
                <td className="px-4 py-3 text-right">
                  <Link to="/ordens/$id/imprimir" params={{ id: o.id }} className="mr-2 text-sm text-accent hover:underline">
                    Imprimir
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => start(o)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    onClick={async () => {
                      try {
                        await deleteOrder({ data: { id: o.id } });
                        toast.success("OS removida");
                        void load();
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Erro");
                      }
                    }}
                  >
                    Apagar
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  Nenhuma ordem encontrada.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? `Editar OS #${editing.orderNumber}` : "Nova ordem de serviço"} wide>
        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await saveOrder({
                data: {
                  id: editing?.id,
                  clientId: form.clientId,
                  deviceBrand: form.deviceBrand,
                  deviceModel: form.deviceModel,
                  deviceSerial: form.deviceSerial,
                  deviceImei: form.deviceImei,
                  defectDesc: form.defectDesc,
                  accessories: form.accessories,
                  diagnosis: form.diagnosis,
                  solution: form.solution,
                  technician: form.technician,
                  warrantyDays: Number(form.warrantyDays),
                  discount: Number(form.discount || 0),
                  paidAmount: Number(form.paidAmount || 0),
                  paymentMethod: form.paymentMethod,
                  notes: form.notes,
                  estimatedDate: form.estimatedDate,
                  items: form.items.map((i) => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    unitPrice: Number(i.unitPrice || 0),
                  })),
                  services: form.services.map((s) => ({
                    serviceTypeId: s.serviceTypeId,
                    quantity: s.quantity,
                    unitPrice: Number(s.unitPrice || 0),
                    notes: s.notes,
                  })),
                },
              });
              toast.success(editing ? "OS atualizada" : "OS criada e aviso enviado");
              setOpen(false);
              void load();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Erro");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cliente">
              <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
                <option value="">Selecione</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Técnico">
              <Input value={form.technician} onChange={(e) => setForm({ ...form, technician: e.target.value })} />
            </Field>
            <Field label="Marca">
              <Input value={form.deviceBrand} onChange={(e) => setForm({ ...form, deviceBrand: e.target.value })} required />
            </Field>
            <Field label="Modelo">
              <Input value={form.deviceModel} onChange={(e) => setForm({ ...form, deviceModel: e.target.value })} required />
            </Field>
            <Field label="Serial">
              <Input value={form.deviceSerial} onChange={(e) => setForm({ ...form, deviceSerial: e.target.value })} />
            </Field>
            <Field label="IMEI">
              <Input value={form.deviceImei} onChange={(e) => setForm({ ...form, deviceImei: e.target.value })} />
            </Field>
            <Field label="Defeito relatado" className="sm:col-span-2">
              <Textarea value={form.defectDesc} onChange={(e) => setForm({ ...form, defectDesc: e.target.value })} required />
            </Field>
            <Field label="Acessórios">
              <Input value={form.accessories} onChange={(e) => setForm({ ...form, accessories: e.target.value })} />
            </Field>
            <Field label="Previsão">
              <Input type="date" value={form.estimatedDate} onChange={(e) => setForm({ ...form, estimatedDate: e.target.value })} />
            </Field>
            <Field label="Diagnóstico">
              <Textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
            </Field>
            <Field label="Solução">
              <Textarea value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} />
            </Field>
          </div>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Serviços</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setForm({
                    ...form,
                    services: [
                      ...form.services,
                      { serviceTypeId: types[0]?.id ?? "", quantity: 1, unitPrice: String(types[0]?.price ?? 0), notes: "" },
                    ],
                  })
                }
              >
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {form.services.map((line, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_4.5rem_7rem_auto] gap-2">
                  <Select
                    value={line.serviceTypeId}
                    onChange={(e) => {
                      const t = types.find((x) => x.id === e.target.value);
                      const next = [...form.services];
                      next[idx] = { ...line, serviceTypeId: e.target.value, unitPrice: String(t?.price ?? line.unitPrice) };
                      setForm({ ...form, services: next });
                    }}
                  >
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => {
                      const next = [...form.services];
                      next[idx] = { ...line, quantity: Number(e.target.value) };
                      setForm({ ...form, services: next });
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(e) => {
                      const next = [...form.services];
                      next[idx] = { ...line, unitPrice: e.target.value };
                      setForm({ ...form, services: next });
                    }}
                  />
                  <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, services: form.services.filter((_, i) => i !== idx) })}>
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Peças</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setForm({
                    ...form,
                    items: [
                      ...form.items,
                      { productId: products[0]?.id ?? "", quantity: 1, unitPrice: String(products[0]?.price ?? 0) },
                    ],
                  })
                }
              >
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {form.items.map((line, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_4.5rem_7rem_auto] gap-2">
                  <Select
                    value={line.productId}
                    onChange={(e) => {
                      const p = products.find((x) => x.id === e.target.value);
                      const next = [...form.items];
                      next[idx] = { ...line, productId: e.target.value, unitPrice: String(p?.price ?? line.unitPrice) };
                      setForm({ ...form, items: next });
                    }}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => {
                      const next = [...form.items];
                      next[idx] = { ...line, quantity: Number(e.target.value) };
                      setForm({ ...form, items: next });
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(e) => {
                      const next = [...form.items];
                      next[idx] = { ...line, unitPrice: e.target.value };
                      setForm({ ...form, items: next });
                    }}
                  />
                  <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })}>
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Desconto">
              <Input type="number" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
            </Field>
            <Field label="Pago">
              <Input type="number" step="0.01" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} />
            </Field>
            <Field label="Pagamento">
              <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                <option value="">Selecione</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Garantia (dias)">
              <Input type="number" value={form.warrantyDays} onChange={(e) => setForm({ ...form, warrantyDays: e.target.value })} />
            </Field>
            <Field label="Observações" className="sm:col-span-2">
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] bg-bg px-4 py-3 text-sm">
            <span className="text-muted">
              Peças {formatCurrency(totals.parts)} · Mão de obra {formatCurrency(totals.labor)}
            </span>
            <span className="font-display text-lg font-semibold tabular-nums">{formatCurrency(totals.total)}</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              Salvar OS
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
