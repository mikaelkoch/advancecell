import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { deleteCategory, listCategories, saveCategory } from "@/lib/server/catalog";
import type { Category } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_app/categorias")({ component: Page });

function Page() {
  const [rows, setRows] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => listCategories().then(setRows).catch(() => toast.error("Não foi possível carregar."));
  useEffect(() => {
    void load();
  }, []);

  const start = (row?: Category) => {
    setEditing(row ?? null);
    setName(row?.name ?? "");
    setDescription(row?.description ?? "");
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Categorias"
        description="Organize peças e acessórios por família."
        actions={<Button onClick={() => start()}>Nova categoria</Button>}
      />
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Produtos</th>
              <th className="px-4 py-3 font-medium">Criada</th>
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
                <td className="px-4 py-3 tabular-nums">{r.productCount}</td>
                <td className="px-4 py-3 text-muted">{formatDate(r.createdAt)}</td>
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
                        await deleteCategory({ data: { id: r.id } });
                        toast.success("Categoria removida");
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  Nenhuma categoria ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Editar categoria" : "Nova categoria"}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await saveCategory({ data: { id: editing?.id, name, description } });
              toast.success("Categoria salva");
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
          <div className="flex justify-end gap-2 pt-2">
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
