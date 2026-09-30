import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./utils-CdnLhQ9B.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { dn as boolean, gn as object, hn as number, yn as string } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-B_-rBXw1.js
var bootstrapShop = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("7f7a7a1adf5d520d05a85a7d4f89dee9d06ad1f51cca1d67defd687fc76ffb64"));
var listCategories = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("599f6ef157822c87192cc0213fef3f49c7a84d058a3039012c70ae9f73b7e713"));
var saveCategory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string().optional(),
	name: string().min(1),
	description: string().optional().nullable()
})).handler(createSsrRpc("34e2988bf9996672437f04fc094f238dd6f3aec94ebc9b8804d99ed049f0d35a"));
var deleteCategory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(createSsrRpc("9eb42e48b77923f6f24dce9c328a12b242634ee333edaae064660ab84c24ec5a"));
var listProducts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2f3cb902609e50ac96044f7e96228fa2f59f70d4c357ba5479010af2a225aea2"));
var saveProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string().optional(),
	categoryId: string(),
	name: string().min(1),
	description: string().optional().nullable(),
	price: number(),
	costPrice: number().optional().nullable(),
	stock: number().int(),
	minStock: number().int(),
	sku: string().optional().nullable(),
	barcode: string().optional().nullable(),
	active: boolean()
})).handler(createSsrRpc("d35fbb49ad0f5d235f2c3e807592a06bd850914ed7f683bb68f4a36fb8e7898b"));
var deleteProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(createSsrRpc("d6eeef7b0d95b10bf5d10a020a920628a8a2dca9176d9ee3549af392e9e37229"));
var listClients = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("58a639ac2291221aadfa06c6fd1ebe206c9ec78b870d36dae188babd0ce8bb56"));
var saveClient = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string().optional(),
	name: string().min(1),
	email: string().optional().nullable(),
	phone: string().min(8),
	whatsapp: string().optional().nullable(),
	cpfCnpj: string().optional().nullable(),
	address: string().optional().nullable(),
	neighborhood: string().optional().nullable(),
	city: string().optional().nullable(),
	state: string().optional().nullable(),
	zipCode: string().optional().nullable(),
	notes: string().optional().nullable()
})).handler(createSsrRpc("f124d57d2e88778660601692d87dc59f3dba6cd55500f7089c05d423e364fec7"));
var deleteClient = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(createSsrRpc("2dea0028f171b18d092ae1534369c23aedc7ff92586a5021d9cce84e6872e869"));
var listServiceTypes = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("ff33265942a461ac1d1fe557f58742198292b182b42b1f4e5e4b10f986677960"));
var saveServiceType = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string().optional(),
	name: string().min(1),
	description: string().optional().nullable(),
	price: number(),
	durationMin: number().int(),
	active: boolean()
})).handler(createSsrRpc("71c99ba1b756762b2e15f7b7f7033256dfc8ec6a2320aed75d228cfd01a69798"));
var deleteServiceType = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(createSsrRpc("c0ea6bbb792a5a60b94f79b321fdb5166c453432939c8c64c6b7d8ffc3fd4232"));
//#endregion
export { deleteServiceType as a, listProducts as c, saveClient as d, saveProduct as f, deleteProduct as i, listServiceTypes as l, deleteCategory as n, listCategories as o, saveServiceType as p, deleteClient as r, listClients as s, bootstrapShop as t, saveCategory as u };
