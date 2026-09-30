import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { deleteProduct, listCategories, listProducts, saveProduct } from "@/lib/server/catalog";
import type { Category, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/_app/produtos")({ component: Page });

const empty = {
  name: "",
  categoryId: "",
  description: "",
  price: "",
  costPrice: "",
  stock: "0",
  minStock: "5",
  sku: "",
  active: true,
};

function Page() {
  const [rows, setRows] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([listProducts(), listCategories()])
      .then(([p, c]) => {
        setRows(p);
        setCats(c);
      })
      .catch(() => toast.error("Não foi possível carregar."));

  useEffect(() => {
    void load();
  }, []);

  const start = (row?: Product) => {
    setEditing(row ?? null);
    setForm(
      row
        ? {
            name: row.name,
            categoryId: row.categoryId,
            description: row.description ?? "",
            price: String(row.price),
            costPrice: row.costPrice == null ? "" : String(row.costPrice),
            stock: String(row.stock),
            minStock: String(row.minStock),
            sku: row.sku ?? "",
            active: row.active,
          }
        : { ...empty, categoryId: cats[0]?.id ?? "" },
    );
    setOpen(true);
  };

  const filtered = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()) || (r.sku ?? "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Peças e acessórios com controle de estoque."
        actions={<Button onClick={() => start()}>Novo produto</Button>}
      />
      <Input className="mb-4 max-w-sm" placeholder="Buscar nome ou SKU" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Estoque</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-muted">{r.sku || "sem SKU"}</p>
                </td>
                <td className="px-4 py-3">{r.categoryName}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(r.price)}</td>
                <td className={`px-4 py-3 tabular-nums ${r.stock <= r.minStock ? "text-danger" : ""}`}>
                  {r.stock}
                  <span className="text-muted"> / min {r.minStock}</span>
                </td>
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
                        await deleteProduct({ data: { id: r.id } });
                        toast.success("Produto removido");
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
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Editar produto" : "Novo produto"} wide>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await saveProduct({
                data: {
                  id: editing?.id,
                  categoryId: form.categoryId,
                  name: form.name,
                  description: form.description,
                  price: Number(form.price),
                  costPrice: form.costPrice === "" ? null : Number(form.costPrice),
                  stock: Number(form.stock),
                  minStock: Number(form.minStock),
                  sku: form.sku,
                  barcode: null,
                  active: form.active,
                },
              });
              toast.success("Produto salvo");
              setOpen(false);
              void load();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Erro");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Nome" className="sm:col-span-2">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Categoria">
            <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">Selecione</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="SKU">
            <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </Field>
          <Field label="Preço de venda">
            <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </Field>
          <Field label="Custo">
            <Input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
          </Field>
          <Field label="Estoque">
            <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </Field>
          <Field label="Estoque mínimo">
            <Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
          </Field>
          <Field label="Descrição" className="sm:col-span-2">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Ativo
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
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
