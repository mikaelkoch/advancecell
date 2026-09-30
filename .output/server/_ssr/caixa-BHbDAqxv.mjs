import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { a as formatDateTime, n as cn, r as formatCurrency, t as authMiddleware } from "./utils-CdnLhQ9B.mjs";
import { t as PageHeader } from "./page-header-DJhAiFIL.mjs";
import { n as MOVEMENT_LABELS, r as PAYMENT_METHODS } from "./domain-y13u448F.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { cn as _enum, gn as object, hn as number, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as Button } from "./button-P70Ng_DC.mjs";
import { t as Dialog } from "./dialog-zoDB_X19.mjs";
import { i as Textarea, n as Input, r as Select, t as Field } from "./field-DA7_JQDB.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/caixa-BHbDAqxv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var listCashRegisters = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("66147989131a0e1b8c4f427abb3898cb6c23fa42b42bc822635315fd5d79874e"));
var openCashRegister = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	openingAmount: number(),
	notes: string().optional(),
	openedBy: string()
})).handler(createSsrRpc("98a00dae93bc1cdb946ea9067d6415347876f0bab748872e09b12f357874818c"));
var closeCashRegister = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	closingAmount: number(),
	notes: string().optional(),
	closedBy: string()
})).handler(createSsrRpc("54cd9fbc8147816ad249e3941119f93fd34489412a6e245939a0ee86af30c05d"));
var addCashMovement = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	cashRegisterId: string(),
	type: _enum([
		"SALE",
		"REFUND",
		"SANGRIA",
		"SUPRIMENTO",
		"EXPENSE"
	]),
	amount: number().positive(),
	description: string().optional(),
	paymentMethod: string().optional(),
	createdBy: string()
})).handler(createSsrRpc("859978a65b3e944dfb2386ce946512be57172142860a8b23413b2a85c0da43b9"));
function Page() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [openForm, setOpenForm] = (0, import_react.useState)(false);
	const [amount, setAmount] = (0, import_react.useState)("200");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [openedBy, setOpenedBy] = (0, import_react.useState)("Loja");
	const [view, setView] = (0, import_react.useState)(null);
	const [moveType, setMoveType] = (0, import_react.useState)("SANGRIA");
	const [moveAmount, setMoveAmount] = (0, import_react.useState)("");
	const [moveDesc, setMoveDesc] = (0, import_react.useState)("");
	const [moveMethod, setMoveMethod] = (0, import_react.useState)("Dinheiro");
	const [closing, setClosing] = (0, import_react.useState)("");
	const [closeNotes, setCloseNotes] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const load = () => listCashRegisters().then((list) => {
		setRows(list);
		setView((v) => v ? list.find((r) => r.id === v.id) ?? null : list.find((r) => r.status === "OPEN") ?? null);
	}).catch(() => toast.error("Não foi possível carregar o caixa."));
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const current = view ?? rows.find((r) => r.status === "OPEN") ?? rows[0] ?? null;
	const hasOpen = rows.some((r) => r.status === "OPEN");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Caixa",
			description: "Abertura, movimentos e conferência do dia.",
			actions: !hasOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => setOpenForm(true),
				children: "Abrir caixa"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ok",
				children: "Caixa aberto"
			})
		}),
		current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Abertura",
					value: formatCurrency(current.openingAmount)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Vendas",
					value: formatCurrency(current.summary.sales)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Saídas",
					value: formatCurrency(current.summary.sangrias + current.summary.expenses)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Esperado",
					value: formatCurrency(current.summary.expectedClosing)
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-6 text-sm text-muted",
			children: "Nenhum caixa ainda. Abra o primeiro do dia."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-semibold",
					children: "Sessões"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setView(r),
						className: cn("flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm", current?.id === r.id ? "bg-bg" : "hover:bg-bg"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Sessão #",
							r.sessionNumber,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-muted",
								children: r.status === "OPEN" ? "Aberto" : "Fechado"
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-muted",
							children: formatCurrency(r.openingAmount)
						})]
					}) }, r.id))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-3",
				children: current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-between",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-display text-base font-semibold",
							children: ["Movimentos · sessão #", current.sessionNumber]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[28rem] text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 font-medium",
										children: "Tipo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 font-medium",
										children: "Descrição"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 font-medium",
										children: "Valor"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: current.movements.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-line",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2",
										children: MOVEMENT_LABELS[m.type]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-2 text-muted",
										children: [m.description || m.paymentMethod || "—", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs",
											children: formatDateTime(m.createdAt)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 tabular-nums",
										children: formatCurrency(m.amount)
									})
								]
							}, m.id)) })]
						})
					}),
					current.status === "OPEN" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-6 grid gap-3 sm:grid-cols-2",
						onSubmit: async (e) => {
							e.preventDefault();
							setBusy(true);
							try {
								await addCashMovement({ data: {
									cashRegisterId: current.id,
									type: moveType,
									amount: Number(moveAmount),
									description: moveDesc,
									paymentMethod: moveMethod,
									createdBy: "Loja"
								} });
								toast.success("Movimento lançado");
								setMoveAmount("");
								setMoveDesc("");
								load();
							} catch (err) {
								toast.error(err instanceof Error ? err.message : "Erro");
							} finally {
								setBusy(false);
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Tipo",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: moveType,
									onChange: (e) => setMoveType(e.target.value),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "SALE",
											children: "Venda"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "REFUND",
											children: "Estorno"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "SANGRIA",
											children: "Sangria"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "SUPRIMENTO",
											children: "Suprimento"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "EXPENSE",
											children: "Despesa"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Valor",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									step: "0.01",
									value: moveAmount,
									onChange: (e) => setMoveAmount(e.target.value),
									required: true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Pagamento",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									value: moveMethod,
									onChange: (e) => setMoveMethod(e.target.value),
									children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: m }, m))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Descrição",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: moveDesc,
									onChange: (e) => setMoveDesc(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: busy,
									children: "Lançar"
								})
							})
						]
					}) : null,
					current.status === "OPEN" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-8 border-t border-line pt-5",
						onSubmit: async (e) => {
							e.preventDefault();
							setBusy(true);
							try {
								const res = await closeCashRegister({ data: {
									id: current.id,
									closingAmount: Number(closing),
									notes: closeNotes,
									closedBy: "Loja"
								} });
								toast.success(`Caixa fechado. Diferença: ${formatCurrency(res.difference)}`);
								setClosing("");
								load();
							} catch (err) {
								toast.error(err instanceof Error ? err.message : "Erro");
							} finally {
								setBusy(false);
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-sm font-semibold",
								children: "Fechar caixa"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: ["Esperado em caixa: ", formatCurrency(current.summary.expectedClosing)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Valor contado",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										step: "0.01",
										value: closing,
										onChange: (e) => setClosing(e.target.value),
										required: true
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Notas",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: closeNotes,
										onChange: (e) => setCloseNotes(e.target.value)
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "mt-3",
								type: "submit",
								disabled: busy,
								children: "Conferir e fechar"
							})
						]
					}) : current.difference != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm",
						children: ["Fechado com diferença de ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums font-medium",
							children: formatCurrency(current.difference)
						})]
					}) : null
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Selecione uma sessão."
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: openForm,
			onClose: () => setOpenForm(false),
			title: "Abrir caixa",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4",
				onSubmit: async (e) => {
					e.preventDefault();
					setBusy(true);
					try {
						await openCashRegister({ data: {
							openingAmount: Number(amount),
							notes,
							openedBy
						} });
						toast.success("Caixa aberto");
						setOpenForm(false);
						load();
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Erro");
					} finally {
						setBusy(false);
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Valor de abertura",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							step: "0.01",
							value: amount,
							onChange: (e) => setAmount(e.target.value),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Operador",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: openedBy,
							onChange: (e) => setOpenedBy(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Observação",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: notes,
							onChange: (e) => setNotes(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setOpenForm(false),
							children: "Cancelar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							children: "Abrir"
						})]
					})
				]
			})
		})
	] });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-[var(--radius-lg)] border border-line bg-surface p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 font-display text-2xl font-semibold tabular-nums",
			children: value
		})]
	});
}
//#endregion
export { Page as component };
