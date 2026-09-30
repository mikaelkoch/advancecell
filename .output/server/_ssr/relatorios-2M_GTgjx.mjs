import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as formatDate, r as formatCurrency } from "./utils-CdnLhQ9B.mjs";
import { t as PageHeader } from "./page-header-DJhAiFIL.mjs";
import { n as getReports } from "./insights-Ddkk9ayC.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
import { n as Input, t as Field } from "./field-DA7_JQDB.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/relatorios-2M_GTgjx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isoDay(d) {
	return d.toISOString().slice(0, 10);
}
function Page() {
	const end = /* @__PURE__ */ new Date();
	const start = /* @__PURE__ */ new Date();
	start.setDate(start.getDate() - 30);
	const [startDate, setStartDate] = (0, import_react.useState)(isoDay(start));
	const [endDate, setEndDate] = (0, import_react.useState)(isoDay(end));
	const [data, setData] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getReports({ data: {
			startDate,
			endDate
		} }).then(setData).catch(() => toast.error("Não foi possível montar o relatório."));
	}, [startDate, endDate]);
	const s = data?.summary;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Relatórios",
			description: "Vendas, peças, serviços e clientes no intervalo."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 grid max-w-md grid-cols-2 gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "De",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: startDate,
					onChange: (e) => setStartDate(e.target.value)
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Até",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: endDate,
					onChange: (e) => setEndDate(e.target.value)
				})
			})]
		}),
		s ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Ordens",
					value: String(s.totalOrders)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Faturamento",
					value: formatCurrency(s.totalRevenue)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Recebido",
					value: formatCurrency(s.totalPaid)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Ticket médio",
					value: formatCurrency(s.avgTicket)
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 rounded-[var(--radius-lg)] border border-line bg-surface p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-base font-semibold",
				children: "Faturamento por dia"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 h-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: data?.byDay ?? [],
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "#e2d9cc",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "date",
								tick: {
									fontSize: 11,
									fill: "#6e6860"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: {
								fontSize: 12,
								fill: "#6e6860"
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => formatCurrency(Number(v)) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "revenue",
								fill: "#0f6e6a",
								radius: [
									6,
									6,
									0,
									0
								]
							})
						]
					})
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBlock, {
					title: "Peças",
					rows: (data?.byProduct ?? []).map((p) => [
						p.name,
						`${p.quantity} un · ${p.category}`,
						formatCurrency(p.revenue)
					])
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBlock, {
					title: "Serviços",
					rows: (data?.byService ?? []).map((p) => [
						p.name,
						`${p.quantity} un`,
						formatCurrency(p.revenue)
					])
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBlock, {
					title: "Clientes",
					rows: (data?.byClient ?? []).map((p) => [
						p.name,
						`${p.orders} OS`,
						formatCurrency(p.total)
					])
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBlock, {
					title: "A receber",
					rows: s ? [[
						`Pendências no período`,
						formatDate(endDate),
						formatCurrency(s.totalPending)
					]] : []
				})
			]
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
function TableBlock({ title, rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-[var(--radius-lg)] border border-line bg-surface p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-base font-semibold",
			children: title
		}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-muted",
			children: "Sem dados neste intervalo."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-3 text-sm",
			children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: r[0]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: r[1]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: r[2]
				})]
			}, i))
		})]
	});
}
//#endregion
export { Page as component };
