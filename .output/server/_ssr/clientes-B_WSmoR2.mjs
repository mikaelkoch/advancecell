import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as formatPhone } from "./utils-CdnLhQ9B.mjs";
import { t as PageHeader } from "./page-header-DJhAiFIL.mjs";
import { d as saveClient, r as deleteClient, s as listClients } from "./catalog-B_-rBXw1.mjs";
import { t as Button } from "./button-P70Ng_DC.mjs";
import { t as Dialog } from "./dialog-zoDB_X19.mjs";
import { i as Textarea, n as Input, t as Field } from "./field-DA7_JQDB.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/clientes-B_WSmoR2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var empty = {
	name: "",
	phone: "",
	whatsapp: "",
	email: "",
	cpfCnpj: "",
	city: "",
	state: "",
	notes: ""
};
function Page() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(empty);
	const [q, setQ] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const load = () => listClients().then(setRows).catch(() => toast.error("Não foi possível carregar."));
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const start = (row) => {
		setEditing(row ?? null);
		setForm(row ? {
			name: row.name,
			phone: row.phone,
			whatsapp: row.whatsapp ?? "",
			email: row.email ?? "",
			cpfCnpj: row.cpfCnpj ?? "",
			city: row.city ?? "",
			state: row.state ?? "",
			notes: row.notes ?? ""
		} : empty);
		setOpen(true);
	};
	const filtered = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()) || r.phone.includes(q) || (r.email ?? "").toLowerCase().includes(q.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Clientes",
			description: "Cadastro da oficina. Telefone é obrigatório para avisos.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => start(),
				children: "Novo cliente"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			className: "mb-4 max-w-sm",
			placeholder: "Buscar nome, telefone ou e-mail",
			value: q,
			onChange: (e) => setQ(e.target.value)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[36rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-line text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Cliente"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Telefone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Cidade"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "OS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3 font-medium" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: r.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: r.email || "sem e-mail"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 tabular-nums",
							children: formatPhone(r.phone)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted",
							children: [r.city, r.state].filter(Boolean).join(" / ") || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 tabular-nums",
							children: r.orderCount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => start(r),
								children: "Editar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "text-danger",
								onClick: async () => {
									try {
										await deleteClient({ data: { id: r.id } });
										toast.success("Cliente removido");
										load();
									} catch (e) {
										toast.error(e instanceof Error ? e.message : "Erro");
									}
								},
								children: "Apagar"
							})]
						})
					]
				}, r.id)) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onClose: () => setOpen(false),
			title: editing ? "Editar cliente" : "Novo cliente",
			wide: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-4 sm:grid-cols-2",
				onSubmit: async (e) => {
					e.preventDefault();
					setBusy(true);
					try {
						await saveClient({ data: {
							id: editing?.id,
							name: form.name,
							phone: form.phone,
							whatsapp: form.whatsapp || form.phone,
							email: form.email,
							cpfCnpj: form.cpfCnpj,
							city: form.city,
							state: form.state,
							notes: form.notes
						} });
						toast.success("Cliente salvo");
						setOpen(false);
						load();
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Erro");
					} finally {
						setBusy(false);
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nome",
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Telefone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.phone,
							onChange: (e) => setForm({
								...form,
								phone: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "WhatsApp",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.whatsapp,
							onChange: (e) => setForm({
								...form,
								whatsapp: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "E-mail",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: form.email,
							onChange: (e) => setForm({
								...form,
								email: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "CPF/CNPJ",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.cpfCnpj,
							onChange: (e) => setForm({
								...form,
								cpfCnpj: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Cidade",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.city,
							onChange: (e) => setForm({
								...form,
								city: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "UF",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.state,
							onChange: (e) => setForm({
								...form,
								state: e.target.value
							}),
							maxLength: 2
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Observações",
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: form.notes,
							onChange: (e) => setForm({
								...form,
								notes: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setOpen(false),
							children: "Cancelar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							children: "Salvar"
						})]
					})
				]
			})
		})
	] });
}
//#endregion
export { Page as component };
