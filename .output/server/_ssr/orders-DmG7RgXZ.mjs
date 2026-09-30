import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./utils-CdnLhQ9B.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { gn as object, hn as number, un as array, yn as string } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-DmG7RgXZ.js
var lineSchema = object({
	productId: string().optional(),
	serviceTypeId: string().optional(),
	quantity: number().int().positive(),
	unitPrice: number(),
	notes: string().optional().nullable()
});
var orderInput = object({
	id: string().optional(),
	clientId: string(),
	deviceBrand: string().min(1),
	deviceModel: string().min(1),
	deviceSerial: string().optional().nullable(),
	deviceImei: string().optional().nullable(),
	defectDesc: string().min(1),
	accessories: string().optional().nullable(),
	diagnosis: string().optional().nullable(),
	solution: string().optional().nullable(),
	technician: string().optional().nullable(),
	warrantyDays: number().int(),
	discount: number(),
	paidAmount: number(),
	paymentMethod: string().optional().nullable(),
	notes: string().optional().nullable(),
	estimatedDate: string().optional().nullable(),
	items: array(lineSchema),
	services: array(lineSchema)
});
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("793eb89f41fc353dd831198d961ae3d0fe4f57a46a3adb9684529ff10a506bc5"));
var getOrder = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(createSsrRpc("4bbba65387e9b762e625d09aaf3ae74b507d424b64422083b85578320de0debf"));
var saveOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(orderInput).handler(createSsrRpc("c6450b83d6c209372505a866e8a02375a57fb88b3411620260a9aa0b28d1152b"));
var changeOrderStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	status: string()
})).handler(createSsrRpc("4d78b8e387b7e6726f42267972ee895cc8c4ed7e47995c2626d6af34a0f5e4cd"));
var deleteOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(createSsrRpc("1b347647fb53748b6af33e6caa9b051a42f89816045a9c86cdf91a1a4c440dc8"));
//#endregion
export { saveOrder as a, listOrders as i, deleteOrder as n, getOrder as r, changeOrderStatus as t };
