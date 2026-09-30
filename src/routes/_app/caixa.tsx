import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { MOVEMENT_LABELS, PAYMENT_METHODS, type CashMovementType } from "@/lib/domain";
import { addCashMovement, closeCashRegister, listCashRegisters, openCashRegister } from "@/lib/server/cash";
import type { CashRegister } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/caixa")({ component: Page });

function Page() {
  const [rows, setRows] = useState<CashRegister[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [amount, setAmount] = useState("200");
  const [notes, setNotes] = useState("");
  const [openedBy, setOpenedBy] = useState("Loja");
  const [view, setView] = useState<CashRegister | null>(null);
  const [moveType, setMoveType] = useState<Exclude<CashMovementType, "OPENING" | "CLOSING">>("SANGRIA");
  const [moveAmount, setMoveAmount] = useState("");
  const [moveDesc, setMoveDesc] = useState("");
  const [moveMethod, setMoveMethod] = useState("Dinheiro");
  const [closing, setClosing] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    listCashRegisters()
      .then((list) => {
        setRows(list);
        setView((v) => (v ? list.find((r) => r.id === v.id) ?? null : list.find((r) => r.status === "OPEN") ?? null));
      })
      .catch(() => toast.error("Não foi possível carregar o caixa."));

  useEffect(() => {
    void load();
  }, []);

  const current = view ?? rows.find((r) => r.status === "OPEN") ?? rows[0] ?? null;
  const hasOpen = rows.some((r) => r.status === "OPEN");

  return (
    <div>
      <PageHeader
        title="Caixa"
        description="Abertura, movimentos e conferência do dia."
        actions={
          !hasOpen ? (
            <Button onClick={() => setOpenForm(true)}>Abrir caixa</Button>
          ) : (
            <p className="text-sm text-ok">Caixa aberto</p>
          )
        }
      />

      {current ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Abertura" value={formatCurrency(current.openingAmount)} />
          <Stat label="Vendas" value={formatCurrency(current.summary.sales)} />
          <Stat label="Saídas" value={formatCurrency(current.summary.sangrias + current.summary.expenses)} />
          <Stat label="Esperado" value={formatCurrency(current.summary.expectedClosing)} />
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted">Nenhum caixa ainda. Abra o primeiro do dia.</p>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="font-display text-base font-semibold">Sessões</h2>
          <ul className="mt-3 space-y-2">
            {rows.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setView(r)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm",
                    current?.id === r.id ? "bg-bg" : "hover:bg-bg",
                  )}
                >
                  <span>
                    Sessão #{r.sessionNumber}
                    <span className="ml-2 text-muted">{r.status === "OPEN" ? "Aberto" : "Fechado"}</span>
                  </span>
                  <span className="tabular-nums text-muted">{formatCurrency(r.openingAmount)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-3">
          {current ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold">Movimentos · sessão #{current.sessionNumber}</h2>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead className="text-muted">
                    <tr>
                      <th className="pb-2 font-medium">Tipo</th>
                      <th className="pb-2 font-medium">Descrição</th>
                      <th className="pb-2 font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {current.movements.map((m) => (
                      <tr key={m.id} className="border-t border-line">
                        <td className="py-2">{MOVEMENT_LABELS[m.type]}</td>
                        <td className="py-2 text-muted">
                          {m.description || m.paymentMethod || "—"}
                          <div className="text-xs">{formatDateTime(m.createdAt)}</div>
                        </td>
                        <td className="py-2 tabular-nums">{formatCurrency(m.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {current.status === "OPEN" ? (
                <form
                  className="mt-6 grid gap-3 sm:grid-cols-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    try {
                      await addCashMovement({
                        data: {
                          cashRegisterId: current.id,
                          type: moveType,
                          amount: Number(moveAmount),
                          description: moveDesc,
                          paymentMethod: moveMethod,
                          createdBy: "Loja",
                        },
                      });
                      toast.success("Movimento lançado");
                      setMoveAmount("");
                      setMoveDesc("");
                      void load();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Erro");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <Field label="Tipo">
                    <Select value={moveType} onChange={(e) => setMoveType(e.target.value as typeof moveType)}>
                      <option value="SALE">Venda</option>
                      <option value="REFUND">Estorno</option>
                      <option value="SANGRIA">Sangria</option>
                      <option value="SUPRIMENTO">Suprimento</option>
                      <option value="EXPENSE">Despesa</option>
                    </Select>
                  </Field>
                  <Field label="Valor">
                    <Input type="number" step="0.01" value={moveAmount} onChange={(e) => setMoveAmount(e.target.value)} required />
                  </Field>
                  <Field label="Pagamento">
                    <Select value={moveMethod} onChange={(e) => setMoveMethod(e.target.value)}>
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Descrição">
                    <Input value={moveDesc} onChange={(e) => setMoveDesc(e.target.value)} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={busy}>
                      Lançar
                    </Button>
                  </div>
                </form>
              ) : null}

              {current.status === "OPEN" ? (
                <form
                  className="mt-8 border-t border-line pt-5"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    try {
                      const res = await closeCashRegister({
                        data: {
                          id: current.id,
                          closingAmount: Number(closing),
                          notes: closeNotes,
                          closedBy: "Loja",
                        },
                      });
                      toast.success(
                        `Caixa fechado. Diferença: ${formatCurrency(res.difference)}`,
                      );
                      setClosing("");
                      void load();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Erro");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <h3 className="font-display text-sm font-semibold">Fechar caixa</h3>
                  <p className="mt-1 text-sm text-muted">
                    Esperado em caixa: {formatCurrency(current.summary.expectedClosing)}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Valor contado">
                      <Input type="number" step="0.01" value={closing} onChange={(e) => setClosing(e.target.value)} required />
                    </Field>
                    <Field label="Notas">
                      <Input value={closeNotes} onChange={(e) => setCloseNotes(e.target.value)} />
                    </Field>
                  </div>
                  <Button variant="secondary" className="mt-3" type="submit" disabled={busy}>
                    Conferir e fechar
                  </Button>
                </form>
              ) : current.difference != null ? (
                <p className="mt-4 text-sm">
                  Fechado com diferença de <span className="tabular-nums font-medium">{formatCurrency(current.difference)}</span>
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted">Selecione uma sessão.</p>
          )}
        </section>
      </div>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} title="Abrir caixa">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await openCashRegister({
                data: { openingAmount: Number(amount), notes, openedBy },
              });
              toast.success("Caixa aberto");
              setOpenForm(false);
              void load();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Erro");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Valor de abertura">
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </Field>
          <Field label="Operador">
            <Input value={openedBy} onChange={(e) => setOpenedBy(e.target.value)} />
          </Field>
          <Field label="Observação">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpenForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              Abrir
            </Button>
          </div>
        </form>
      </Dialog>
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
