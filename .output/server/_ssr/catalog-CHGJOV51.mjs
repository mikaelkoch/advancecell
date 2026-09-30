import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { s as slugify, t as authMiddleware } from "./utils-CdnLhQ9B.mjs";
import { dn as boolean, gn as object, hn as number, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { a as nid, n as iso, o as num, s as sql, t as fail } from "./helpers-DClzb-S1.mjs";
import { t as ensureShopSeeded } from "./seed-C5YASBEB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-CHGJOV51.js
var bootstrapShop_createServerFn_handler = createServerRpc({
	id: "7f7a7a1adf5d520d05a85a7d4f89dee9d06ad1f51cca1d67defd687fc76ffb64",
	name: "bootstrapShop",
	filename: "src/lib/server/catalog.ts"
}, (opts) => bootstrapShop.__executeServer(opts));
var bootstrapShop = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(bootstrapShop_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	await ensureShopSeeded(db, context.userId);
	return { shopName: (await db.query(`select shop_name from shop_profiles where user_id = $1`, [context.userId]))[0]?.shop_name ?? "Advancecell" };
});
var listCategories_createServerFn_handler = createServerRpc({
	id: "599f6ef157822c87192cc0213fef3f49c7a84d058a3039012c70ae9f73b7e713",
	name: "listCategories",
	filename: "src/lib/server/catalog.ts"
}, (opts) => listCategories.__executeServer(opts));
var listCategories = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listCategories_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	await ensureShopSeeded(db, context.userId);
	return (await db.query(`select c.id, c.name, c.slug, c.description, c.created_at,
              (select count(*)::int from products p where p.category_id = c.id) as product_count
       from categories c where c.user_id = $1 order by c.name`, [context.userId])).map((r) => ({
		id: r.id,
		name: r.name,
		slug: r.slug,
		description: r.description,
		productCount: num(r.product_count),
		createdAt: iso(r.created_at) ?? ""
	}));
});
var saveCategory_createServerFn_handler = createServerRpc({
	id: "34e2988bf9996672437f04fc094f238dd6f3aec94ebc9b8804d99ed049f0d35a",
	name: "saveCategory",
	filename: "src/lib/server/catalog.ts"
}, (opts) => saveCategory.__executeServer(opts));
var saveCategory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string().optional(),
	name: string().min(1),
	description: string().optional().nullable()
})).handler(saveCategory_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const name = data.name.trim();
	const slug = slugify(name) || `cat-${Date.now()}`;
	if (data.id) {
		await db.query(`update categories set name = $1, slug = $2, description = $3
         where id = $4 and user_id = $5`, [
			name,
			slug,
			data.description || null,
			data.id,
			context.userId
		]);
		return { id: data.id };
	}
	const id = nid();
	await db.query(`insert into categories (id, user_id, name, slug, description) values ($1,$2,$3,$4,$5)`, [
		id,
		context.userId,
		name,
		slug,
		data.description || null
	]);
	return { id };
});
var deleteCategory_createServerFn_handler = createServerRpc({
	id: "9eb42e48b77923f6f24dce9c328a12b242634ee333edaae064660ab84c24ec5a",
	name: "deleteCategory",
	filename: "src/lib/server/catalog.ts"
}, (opts) => deleteCategory.__executeServer(opts));
var deleteCategory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(deleteCategory_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const used = await db.query(`select count(*)::int as n from products where category_id = $1 and user_id = $2`, [data.id, context.userId]);
	if (num(used[0]?.n) > 0) fail("Categoria com produtos. Mova ou apague os produtos primeiro.");
	await db.query(`delete from categories where id = $1 and user_id = $2`, [data.id, context.userId]);
	return { ok: true };
});
var listProducts_createServerFn_handler = createServerRpc({
	id: "2f3cb902609e50ac96044f7e96228fa2f59f70d4c357ba5479010af2a225aea2",
	name: "listProducts",
	filename: "src/lib/server/catalog.ts"
}, (opts) => listProducts.__executeServer(opts));
var listProducts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listProducts_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	await ensureShopSeeded(db, context.userId);
	return (await db.query(`select p.*, c.name as category_name
       from products p join categories c on c.id = p.category_id
       where p.user_id = $1 order by p.name`, [context.userId])).map((r) => ({
		id: r.id,
		categoryId: r.category_id,
		categoryName: r.category_name,
		name: r.name,
		slug: r.slug,
		description: r.description,
		price: num(r.price),
		costPrice: r.cost_price == null ? null : num(r.cost_price),
		stock: num(r.stock),
		minStock: num(r.min_stock),
		sku: r.sku,
		barcode: r.barcode,
		active: Boolean(r.active),
		createdAt: iso(r.created_at) ?? ""
	}));
});
var saveProduct_createServerFn_handler = createServerRpc({
	id: "d35fbb49ad0f5d235f2c3e807592a06bd850914ed7f683bb68f4a36fb8e7898b",
	name: "saveProduct",
	filename: "src/lib/server/catalog.ts"
}, (opts) => saveProduct.__executeServer(opts));
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
})).handler(saveProduct_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	if (!(await db.query(`select id from categories where id = $1 and user_id = $2`, [data.categoryId, context.userId]))[0]) fail("Categoria inválida.");
	const name = data.name.trim();
	const slug = slugify(name) || `prod-${Date.now()}`;
	if (data.id) {
		await db.query(`update products set category_id=$1, name=$2, slug=$3, description=$4, price=$5, cost_price=$6,
         stock=$7, min_stock=$8, sku=$9, barcode=$10, active=$11
         where id=$12 and user_id=$13`, [
			data.categoryId,
			name,
			slug,
			data.description || null,
			data.price,
			data.costPrice ?? null,
			data.stock,
			data.minStock,
			data.sku || null,
			data.barcode || null,
			data.active,
			data.id,
			context.userId
		]);
		return { id: data.id };
	}
	const id = nid();
	await db.query(`insert into products (id, user_id, category_id, name, slug, description, price, cost_price, stock, min_stock, sku, barcode, active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [
		id,
		context.userId,
		data.categoryId,
		name,
		slug,
		data.description || null,
		data.price,
		data.costPrice ?? null,
		data.stock,
		data.minStock,
		data.sku || null,
		data.barcode || null,
		data.active
	]);
	return { id };
});
var deleteProduct_createServerFn_handler = createServerRpc({
	id: "d6eeef7b0d95b10bf5d10a020a920628a8a2dca9176d9ee3549af392e9e37229",
	name: "deleteProduct",
	filename: "src/lib/server/catalog.ts"
}, (opts) => deleteProduct.__executeServer(opts));
var deleteProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(deleteProduct_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const used = await db.query(`select count(*)::int as n from service_order_items where product_id = $1 and user_id = $2`, [data.id, context.userId]);
	if (num(used[0]?.n) > 0) fail("Produto já usado em ordens. Desative em vez de apagar.");
	await db.query(`delete from products where id = $1 and user_id = $2`, [data.id, context.userId]);
	return { ok: true };
});
var listClients_createServerFn_handler = createServerRpc({
	id: "58a639ac2291221aadfa06c6fd1ebe206c9ec78b870d36dae188babd0ce8bb56",
	name: "listClients",
	filename: "src/lib/server/catalog.ts"
}, (opts) => listClients.__executeServer(opts));
var listClients = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listClients_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	await ensureShopSeeded(db, context.userId);
	return (await db.query(`select c.*, (select count(*)::int from service_orders o where o.client_id = c.id) as order_count
       from clients c where c.user_id = $1 order by c.name`, [context.userId])).map((r) => ({
		id: String(r.id),
		name: String(r.name),
		email: r.email ?? null,
		phone: String(r.phone),
		whatsapp: r.whatsapp ?? null,
		cpfCnpj: r.cpf_cnpj ?? null,
		address: r.address ?? null,
		neighborhood: r.neighborhood ?? null,
		city: r.city ?? null,
		state: r.state ?? null,
		zipCode: r.zip_code ?? null,
		notes: r.notes ?? null,
		orderCount: num(r.order_count),
		createdAt: iso(r.created_at) ?? ""
	}));
});
var saveClient_createServerFn_handler = createServerRpc({
	id: "f124d57d2e88778660601692d87dc59f3dba6cd55500f7089c05d423e364fec7",
	name: "saveClient",
	filename: "src/lib/server/catalog.ts"
}, (opts) => saveClient.__executeServer(opts));
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
})).handler(saveClient_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const fields = [
		data.name.trim(),
		data.email || null,
		data.phone.trim(),
		data.whatsapp || null,
		data.cpfCnpj || null,
		data.address || null,
		data.neighborhood || null,
		data.city || null,
		data.state || null,
		data.zipCode || null,
		data.notes || null
	];
	if (data.id) {
		await db.query(`update clients set name=$1, email=$2, phone=$3, whatsapp=$4, cpf_cnpj=$5, address=$6,
         neighborhood=$7, city=$8, state=$9, zip_code=$10, notes=$11
         where id=$12 and user_id=$13`, [
			...fields,
			data.id,
			context.userId
		]);
		return { id: data.id };
	}
	const id = nid();
	await db.query(`insert into clients (id, user_id, name, email, phone, whatsapp, cpf_cnpj, address, neighborhood, city, state, zip_code, notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [
		id,
		context.userId,
		...fields
	]);
	return { id };
});
var deleteClient_createServerFn_handler = createServerRpc({
	id: "2dea0028f171b18d092ae1534369c23aedc7ff92586a5021d9cce84e6872e869",
	name: "deleteClient",
	filename: "src/lib/server/catalog.ts"
}, (opts) => deleteClient.__executeServer(opts));
var deleteClient = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(deleteClient_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const used = await db.query(`select count(*)::int as n from service_orders where client_id = $1 and user_id = $2`, [data.id, context.userId]);
	if (num(used[0]?.n) > 0) fail("Cliente com ordens. Não é possível apagar.");
	await db.query(`delete from clients where id = $1 and user_id = $2`, [data.id, context.userId]);
	return { ok: true };
});
var listServiceTypes_createServerFn_handler = createServerRpc({
	id: "ff33265942a461ac1d1fe557f58742198292b182b42b1f4e5e4b10f986677960",
	name: "listServiceTypes",
	filename: "src/lib/server/catalog.ts"
}, (opts) => listServiceTypes.__executeServer(opts));
var listServiceTypes = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listServiceTypes_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	await ensureShopSeeded(db, context.userId);
	return (await db.query(`select * from service_types where user_id = $1 order by name`, [context.userId])).map((r) => ({
		id: String(r.id),
		name: String(r.name),
		description: r.description ?? null,
		price: num(r.price),
		durationMin: num(r.duration_min),
		active: Boolean(r.active),
		createdAt: iso(r.created_at) ?? ""
	}));
});
var saveServiceType_createServerFn_handler = createServerRpc({
	id: "71c99ba1b756762b2e15f7b7f7033256dfc8ec6a2320aed75d228cfd01a69798",
	name: "saveServiceType",
	filename: "src/lib/server/catalog.ts"
}, (opts) => saveServiceType.__executeServer(opts));
var saveServiceType = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string().optional(),
	name: string().min(1),
	description: string().optional().nullable(),
	price: number(),
	durationMin: number().int(),
	active: boolean()
})).handler(saveServiceType_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	if (data.id) {
		await db.query(`update service_types set name=$1, description=$2, price=$3, duration_min=$4, active=$5
         where id=$6 and user_id=$7`, [
			data.name.trim(),
			data.description || null,
			data.price,
			data.durationMin,
			data.active,
			data.id,
			context.userId
		]);
		return { id: data.id };
	}
	const id = nid();
	await db.query(`insert into service_types (id, user_id, name, description, price, duration_min, active)
       values ($1,$2,$3,$4,$5,$6,$7)`, [
		id,
		context.userId,
		data.name.trim(),
		data.description || null,
		data.price,
		data.durationMin,
		data.active
	]);
	return { id };
});
var deleteServiceType_createServerFn_handler = createServerRpc({
	id: "c0ea6bbb792a5a60b94f79b321fdb5166c453432939c8c64c6b7d8ffc3fd4232",
	name: "deleteServiceType",
	filename: "src/lib/server/catalog.ts"
}, (opts) => deleteServiceType.__executeServer(opts));
var deleteServiceType = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(deleteServiceType_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	const used = await db.query(`select count(*)::int as n from service_order_services where service_type_id = $1 and user_id = $2`, [data.id, context.userId]);
	if (num(used[0]?.n) > 0) fail("Tipo já usado em ordens. Desative em vez de apagar.");
	await db.query(`delete from service_types where id = $1 and user_id = $2`, [data.id, context.userId]);
	return { ok: true };
});
//#endregion
export { bootstrapShop_createServerFn_handler, deleteCategory_createServerFn_handler, deleteClient_createServerFn_handler, deleteProduct_createServerFn_handler, deleteServiceType_createServerFn_handler, listCategories_createServerFn_handler, listClients_createServerFn_handler, listProducts_createServerFn_handler, listServiceTypes_createServerFn_handler, saveCategory_createServerFn_handler, saveClient_createServerFn_handler, saveProduct_createServerFn_handler, saveServiceType_createServerFn_handler };
