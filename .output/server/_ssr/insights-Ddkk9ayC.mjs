import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./utils-CdnLhQ9B.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { cn as _enum, gn as object, yn as string } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/insights-Ddkk9ayC.js
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ period: _enum([
	"today",
	"week",
	"month",
	"year"
]) })).handler(createSsrRpc("fea45fca5bb7d97e67424df342234c8073e76de9c153ba1813fdf50505e47548"));
var getReports = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({
	startDate: string(),
	endDate: string()
})).handler(createSsrRpc("e396290d22454d7da7717147d0a2ca43e83fc199241bf3542f08fe3d4f4b5e03"));
//#endregion
export { getReports as n, getDashboard as t };
