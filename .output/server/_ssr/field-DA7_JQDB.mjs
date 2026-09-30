import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./utils-CdnLhQ9B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/field-DA7_JQDB.js
var import_jsx_runtime = require_jsx_runtime();
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("mb-1.5 block text-sm font-medium text-ink", className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-[var(--radius-sm)] border border-line bg-surface px-3 text-base text-ink outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-24 w-full rounded-[var(--radius-sm)] border border-line bg-surface px-3 py-2 text-base text-ink outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20", className),
		...props
	});
}
function Select({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn("h-11 w-full rounded-[var(--radius-sm)] border border-line bg-surface px-3 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20", className),
		...props,
		children
	});
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
//#endregion
export { Textarea as i, Input as n, Select as r, Field as t };
