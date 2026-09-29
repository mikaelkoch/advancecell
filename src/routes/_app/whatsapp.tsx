import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { MESSAGE_TYPE_LABELS, type WhatsAppMessageType } from "@/lib/domain";
import { listOrders } from "@/lib/server/orders";
import { getWhatsApp, saveWhatsAppSettings, sendWhatsApp } from "@/lib/server/whatsapp";
import type { ServiceOrder, WhatsAppLog } from "@/lib/types";
import { formatDateTime, formatPhone } from "@/lib/utils";

export const Route = createFileRoute("/_app/whatsapp")({ component: Page });

function Page() {
  const [active, setActive] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [orderId, setOrderId] = useState("");
  const [type, setType] = useState<WhatsAppMessageType>("OS_STATUS_CHANGED");
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([getWhatsApp(), listOrders()])
      .then(([w, o]) => {
        setActive(w.settings.active);
        setPhoneNumber(w.settings.phoneNumber);
        setLogs(w.logs);
        setOrders(o);
        if (!orderId && o[0]) setOrderId(o[0].id);
      })
      .catch(() => toast.error("Não foi possível carregar o WhatsApp."));

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader
        title="WhatsApp"
        description="Avisos automáticos de OS (modo simulado). As mensagens ficam no histórico da loja."
      />
      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="font-display text-base font-semibold">Configuração</h2>
          <form
            className="mt-4 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await saveWhatsAppSettings({ data: { phoneNumber, active } });
                toast.success("Configuração salva");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Erro");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Enviar avisos automaticamente
            </label>
            <Field label="Número da loja">
              <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="11999999999" />
            </Field>
            <p className="text-xs text-muted">
              Provedor: simulação (MOCK). Cada envio é registrado como enviado para o telefone do cliente.
            </p>
            <Button type="submit" disabled={busy}>
              Salvar
            </Button>
          </form>

          <form
            className="mt-8 space-y-4 border-t border-line pt-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await sendWhatsApp({
                  data: { orderId, type, message: custom || undefined },
                });
                toast.success("Mensagem registrada");
                setCustom("");
                void load();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Erro");
              } finally {
                setBusy(false);
              }
            }}
          >
            <h3 className="font-display text-sm font-semibold">Enviar agora</h3>
            <Field label="Ordem">
              <Select value={orderId} onChange={(e) => setOrderId(e.target.value)}>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.orderNumber} · {o.clientName}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Modelo">
              <Select value={type} onChange={(e) => setType(e.target.value as WhatsAppMessageType)}>
                {Object.entries(MESSAGE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Texto extra (opcional)">
              <Textarea value={custom} onChange={(e) => setCustom(e.target.value)} />
            </Field>
            <Button type="submit" disabled={busy || !orderId}>
              Enviar
            </Button>
          </form>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-3">
          <h2 className="font-display text-base font-semibold">Histórico</h2>
          <ul className="mt-4 space-y-4">
            {logs.map((l) => (
              <li key={l.id} className="rounded-[var(--radius-md)] border border-line p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{MESSAGE_TYPE_LABELS[l.type as WhatsAppMessageType] ?? l.type}</span>
                  <span className="text-muted">{formatDateTime(l.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{formatPhone(l.phoneTo)} · {l.status}</p>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-ink">{l.message}</pre>
              </li>
            ))}
            {logs.length === 0 ? <p className="text-sm text-muted">Nenhuma mensagem ainda.</p> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
