import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./utils-CdnLhQ9B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-P70Ng_DC.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:bg-accent-2",
			secondary: "border border-line bg-surface text-ink hover:bg-bg",
			ghost: "text-ink hover:bg-line/60",
			danger: "bg-danger text-accent-fg hover:opacity-90"
		},
		size: {
			sm: "h-9 px-3 text-sm",
			md: "h-11 px-4 text-sm",
			lg: "h-12 px-5 text-base",
			icon: "h-11 w-11"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button as t };
