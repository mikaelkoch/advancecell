import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { deleteClient, listClients, saveClient } from "@/lib/server/catalog";
import type { Client } from "@/lib/types";
import { formatPhone } from "@/lib/utils";

export const Route = createFileRoute("/_app/clientes")({ component: Page });

const empty = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  cpfCnpj: "",
  city: "",
  state: "",
  notes: "",
};

function Page() {
  const [rows, setRows] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(empty);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => listClients().then(setRows).catch(() => toast.error("Não foi possível carregar."));
  useEffect(() => {
    void load();
  }, []);

  const start = (row?: Client) => {
    setEditing(row ?? null);
    setForm(
      row
        ? {
            name: row.name,
            phone: row.phone,
            whatsapp: row.whatsapp ?? "",
            email: row.email ?? "",
            cpfCnpj: row.cpfCnpj ?? "",
            city: row.city ?? "",
            state: row.state ?? "",
            notes: row.notes ?? "",
          }
        : empty,
    );
    setOpen(true);
  };

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.phone.includes(q) ||
      (r.email ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro da oficina. Telefone é obrigatório para avisos."
        actions={<Button onClick={() => start()}>Novo cliente</Button>}
      />
      <Input className="mb-4 max-w-sm" placeholder="Buscar nome, telefone ou e-mail" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Cidade</th>
              <th className="px-4 py-3 font-medium">OS</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-muted">{r.email || "sem e-mail"}</p>
                </td>
                <td className="px-4 py-3 tabular-nums">{formatPhone(r.phone)}</td>
                <td className="px-4 py-3 text-muted">
                  {[r.city, r.state].filter(Boolean).join(" / ") || "—"}
                </td>
                <td className="px-4 py-3 tabular-nums">{r.orderCount}</td>
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
                        await deleteClient({ data: { id: r.id } });
                        toast.success("Cliente removido");
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
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Editar cliente" : "Novo cliente"} wide>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await saveClient({
                data: {
                  id: editing?.id,
                  name: form.name,
                  phone: form.phone,
                  whatsapp: form.whatsapp || form.phone,
                  email: form.email,
                  cpfCnpj: form.cpfCnpj,
                  city: form.city,
                  state: form.state,
                  notes: form.notes,
                },
              });
              toast.success("Cliente salvo");
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
          <Field label="Telefone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </Field>
          <Field label="WhatsApp">
            <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="CPF/CNPJ">
            <Input value={form.cpfCnpj} onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })} />
          </Field>
          <Field label="Cidade">
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Field label="UF">
            <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} maxLength={2} />
          </Field>
          <Field label="Observações" className="sm:col-span-2">
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
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
