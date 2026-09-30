import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./utils-CdnLhQ9B.mjs";
import { a as STATUS_LABELS } from "./domain-y13u448F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/status-badge-_-KxaRT6.js
var import_jsx_runtime = require_jsx_runtime();
var tones = {
	RECEIVED: "bg-ink/8 text-ink",
	DIAGNOSING: "bg-accent/10 text-accent-2",
	WAITING_APPROVAL: "bg-warn/15 text-warn",
	IN_REPAIR: "bg-accent/15 text-accent-2",
	READY: "bg-ok/15 text-ok",
	DELIVERED: "bg-muted/20 text-muted",
	CANCELLED: "bg-danger/12 text-danger"
};
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[status]),
		children: STATUS_LABELS[status]
	});
}
//#endregion
export { StatusBadge as t };
