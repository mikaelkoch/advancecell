import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { deleteServiceType, listServiceTypes, saveServiceType } from "@/lib/server/catalog";
import type { ServiceType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/_app/servicos")({ component: Page });

function Page() {
  const [rows, setRows] = useState<ServiceType[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [durationMin, setDurationMin] = useState("60");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => listServiceTypes().then(setRows).catch(() => toast.error("Não foi possível carregar."));
  useEffect(() => {
    void load();
  }, []);

  const start = (row?: ServiceType) => {
    setEditing(row ?? null);
    setName(row?.name ?? "");
    setDescription(row?.description ?? "");
    setPrice(row ? String(row.price) : "0");
    setDurationMin(row ? String(row.durationMin) : "60");
    setActive(row?.active ?? true);
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Tipos de serviço"
        description="Mão de obra cobrada nas ordens."
        actions={<Button onClick={() => start()}>Novo serviço</Button>}
      />
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Serviço</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Duração</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.name}</p>
                  {r.description ? <p className="text-muted">{r.description}</p> : null}
                </td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(r.price)}</td>
                <td className="px-4 py-3 tabular-nums">{r.durationMin} min</td>
                <td className="px-4 py-3">{r.active ? "Ativo" : "Inativo"}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => start(r)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    onClick={async () => {
                      try {
                        await deleteServiceType({ data: { id: r.id } });
                        toast.success("Serviço removido");
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
          </tbody>
        </table>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Editar serviço" : "Novo serviço"}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await saveServiceType({
                data: {
                  id: editing?.id,
                  name,
                  description,
                  price: Number(price),
                  durationMin: Number(durationMin),
                  active,
                },
              });
              toast.success("Serviço salvo");
              setOpen(false);
              void load();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Erro");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Nome">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Descrição">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço">
              <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <Field label="Duração (min)">
              <Input type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Ativo
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              Salvar
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
