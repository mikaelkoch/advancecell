import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as formatDateTime, o as formatPhone } from "./utils-CdnLhQ9B.mjs";
import { t as PageHeader } from "./page-header-DJhAiFIL.mjs";
import { t as MESSAGE_TYPE_LABELS } from "./domain-y13u448F.mjs";
import { i as listOrders } from "./orders-DmG7RgXZ.mjs";
import { t as Button } from "./button-P70Ng_DC.mjs";
import { i as Textarea, n as Input, r as Select, t as Field } from "./field-DA7_JQDB.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as sendWhatsApp, r as saveWhatsAppSettings, t as getWhatsApp } from "./whatsapp-BRR8n3vh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/whatsapp-WkNggRPW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const [active, setActive] = (0, import_react.useState)(true);
	const [phoneNumber, setPhoneNumber] = (0, import_react.useState)("");
	const [logs, setLogs] = (0, import_react.useState)([]);
	const [orders, setOrders] = (0, import_react.useState)([]);
	const [orderId, setOrderId] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("OS_STATUS_CHANGED");
	const [custom, setCustom] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const load = () => Promise.all([getWhatsApp(), listOrders()]).then(([w, o]) => {
		setActive(w.settings.active);
		setPhoneNumber(w.settings.phoneNumber);
		setLogs(w.logs);
		setOrders(o);
		if (!orderId && o[0]) setOrderId(o[0].id);
	}).catch(() => toast.error("Não foi possível carregar o WhatsApp."));
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "WhatsApp",
		description: "Avisos automáticos de OS (modo simulado). As mensagens ficam no histórico da loja."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-semibold",
					children: "Configuração"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 space-y-4",
					onSubmit: async (e) => {
						e.preventDefault();
						setBusy(true);
						try {
							await saveWhatsAppSettings({ data: {
								phoneNumber,
								active
							} });
							toast.success("Configuração salva");
						} catch (err) {
							toast.error(err instanceof Error ? err.message : "Erro");
						} finally {
							setBusy(false);
						}
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: active,
								onChange: (e) => setActive(e.target.checked)
							}), "Enviar avisos automaticamente"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Número da loja",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: phoneNumber,
								onChange: (e) => setPhoneNumber(e.target.value),
								placeholder: "11999999999"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Provedor: simulação (MOCK). Cada envio é registrado como enviado para o telefone do cliente."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							children: "Salvar"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-8 space-y-4 border-t border-line pt-5",
					onSubmit: async (e) => {
						e.preventDefault();
						setBusy(true);
						try {
							await sendWhatsApp({ data: {
								orderId,
								type,
								message: custom || void 0
							} });
							toast.success("Mensagem registrada");
							setCustom("");
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
							children: "Enviar agora"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Ordem",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: orderId,
								onChange: (e) => setOrderId(e.target.value),
								children: orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: o.id,
									children: [
										"#",
										o.orderNumber,
										" · ",
										o.clientName
									]
								}, o.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Modelo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: type,
								onChange: (e) => setType(e.target.value),
								children: Object.entries(MESSAGE_TYPE_LABELS).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: k,
									children: v
								}, k))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Texto extra (opcional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: custom,
								onChange: (e) => setCustom(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy || !orderId,
							children: "Enviar"
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-[var(--radius-lg)] border border-line bg-surface p-5 lg:col-span-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-base font-semibold",
				children: "Histórico"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-4 space-y-4",
				children: [logs.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-[var(--radius-md)] border border-line p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: MESSAGE_TYPE_LABELS[l.type] ?? l.type
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: formatDateTime(l.createdAt)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: [
								formatPhone(l.phoneTo),
								" · ",
								l.status
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-3 whitespace-pre-wrap font-sans text-sm text-ink",
							children: l.message
						})
					]
				}, l.id)), logs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Nenhuma mensagem ainda."
				}) : null]
			})]
		})]
	})] });
}
//#endregion
export { Page as component };
