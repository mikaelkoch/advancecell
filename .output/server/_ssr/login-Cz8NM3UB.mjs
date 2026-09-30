import { S as Navigate, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn } from "./client-1vAx-gM_.mjs";
import { t as GROK_PROVIDERS } from "./server-BdzMmpMB.mjs";
import { n as useCurrentUserState } from "./use-current-user-BYyFvsCd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Cz8NM3UB.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-bg text-muted",
		children: "Carregando…"
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-screen bg-bg lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "hidden flex-col justify-between bg-sidebar p-10 text-sidebar-fg lg:flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-12 w-12 place-items-center rounded-[var(--radius-sm)] bg-accent text-accent-fg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl font-semibold",
						children: "A"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-10 font-display text-4xl font-semibold leading-tight",
					children: [
						"A oficina, no ritmo",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"da bancada."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-md text-sidebar-muted",
					children: "Ordens de serviço, estoque, caixa e avisos ao cliente — um sistema para a Advancecell operar o dia inteiro sem planilha."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-sidebar-muted",
				children: "Advancecell · Assistência técnica e acessórios"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "grid place-items-center p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-8 lg:hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl font-semibold",
							children: "Advancecell"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Assistência técnica"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-semibold",
						children: "Entrar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Acesse o painel da loja com sua conta."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 space-y-2",
						children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => signIn(p.providerId, { callbackURL: "/" }),
							className: "h-12 w-full rounded-[var(--radius-sm)] border border-line bg-surface text-sm font-medium text-ink hover:bg-bg",
							children: ["Continuar com ", p.label]
						}, p.providerId))
					})
				]
			})
		})]
	});
}
//#endregion
export { Login as component };
