import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as formatCurrency } from "./utils-CdnLhQ9B.mjs";
import { t as PageHeader } from "./page-header-DJhAiFIL.mjs";
import { c as listProducts, f as saveProduct, i as deleteProduct, o as listCategories } from "./catalog-B_-rBXw1.mjs";
import { t as Button } from "./button-P70Ng_DC.mjs";
import { t as Dialog } from "./dialog-zoDB_X19.mjs";
import { i as Textarea, n as Input, r as Select, t as Field } from "./field-DA7_JQDB.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/produtos-QeMd9yPZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var empty = {
	name: "",
	categoryId: "",
	description: "",
	price: "",
	costPrice: "",
	stock: "0",
	minStock: "5",
	sku: "",
	active: true
};
function Page() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [cats, setCats] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(empty);
	const [q, setQ] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const load = () => Promise.all([listProducts(), listCategories()]).then(([p, c]) => {
		setRows(p);
		setCats(c);
	}).catch(() => toast.error("Não foi possível carregar."));
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const start = (row) => {
		setEditing(row ?? null);
		setForm(row ? {
			name: row.name,
			categoryId: row.categoryId,
			description: row.description ?? "",
			price: String(row.price),
			costPrice: row.costPrice == null ? "" : String(row.costPrice),
			stock: String(row.stock),
			minStock: String(row.minStock),
			sku: row.sku ?? "",
			active: row.active
		} : {
			...empty,
			categoryId: cats[0]?.id ?? ""
		});
		setOpen(true);
	};
	const filtered = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()) || (r.sku ?? "").toLowerCase().includes(q.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Produtos",
			description: "Peças e acessórios com controle de estoque.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => start(),
				children: "Novo produto"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			className: "mb-4 max-w-sm",
			placeholder: "Buscar nome ou SKU",
			value: q,
			onChange: (e) => setQ(e.target.value)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[40rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-line text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Produto"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Categoria"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Preço"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Estoque"
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
								children: r.sku || "sem SKU"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: r.categoryName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 tabular-nums",
							children: formatCurrency(r.price)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: `px-4 py-3 tabular-nums ${r.stock <= r.minStock ? "text-danger" : ""}`,
							children: [r.stock, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [" / min ", r.minStock]
							})]
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
										await deleteProduct({ data: { id: r.id } });
										toast.success("Produto removido");
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
			title: editing ? "Editar produto" : "Novo produto",
			wide: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-4 sm:grid-cols-2",
				onSubmit: async (e) => {
					e.preventDefault();
					setBusy(true);
					try {
						await saveProduct({ data: {
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
							active: form.active
						} });
						toast.success("Produto salvo");
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
						label: "Categoria",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.categoryId,
							onChange: (e) => setForm({
								...form,
								categoryId: e.target.value
							}),
							required: true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Selecione"
							}), cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c.id,
								children: c.name
							}, c.id))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "SKU",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.sku,
							onChange: (e) => setForm({
								...form,
								sku: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Preço de venda",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							step: "0.01",
							value: form.price,
							onChange: (e) => setForm({
								...form,
								price: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Custo",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							step: "0.01",
							value: form.costPrice,
							onChange: (e) => setForm({
								...form,
								costPrice: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Estoque",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: form.stock,
							onChange: (e) => setForm({
								...form,
								stock: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Estoque mínimo",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: form.minStock,
							onChange: (e) => setForm({
								...form,
								minStock: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Descrição",
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: form.description,
							onChange: (e) => setForm({
								...form,
								description: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: form.active,
							onChange: (e) => setForm({
								...form,
								active: e.target.checked
							})
						}), "Ativo"]
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
