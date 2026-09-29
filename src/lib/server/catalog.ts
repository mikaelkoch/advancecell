import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { slugify } from "@/lib/utils";
import type { Category, Client, Product, ServiceType } from "@/lib/types";
import { fail, iso, nid, num, sql } from "./helpers";
import { ensureShopSeeded } from "./seed";

export const bootstrapShop = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await sql();
    await ensureShopSeeded(db, context.userId);
    const row = await db.query<{ shop_name: string }>(
      `select shop_name from shop_profiles where user_id = $1`,
      [context.userId],
    );
    return { shopName: row[0]?.shop_name ?? "Advancecell" };
  });

export const listCategories = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Category[]> => {
    const db = await sql();
    await ensureShopSeeded(db, context.userId);
    const rows = await db.query<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      product_count: number;
      created_at: unknown;
    }>(
      `select c.id, c.name, c.slug, c.description, c.created_at,
              (select count(*)::int from products p where p.category_id = c.id) as product_count
       from categories c where c.user_id = $1 order by c.name`,
      [context.userId],
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      productCount: num(r.product_count),
      createdAt: iso(r.created_at) ?? "",
    }));
  });

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      description: z.string().optional().nullable(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = await sql();
    const name = data.name.trim();
    const slug = slugify(name) || `cat-${Date.now()}`;
    if (data.id) {
      const res = await db.query(
        `update categories set name = $1, slug = $2, description = $3
         where id = $4 and user_id = $5`,
        [name, slug, data.description || null, data.id, context.userId],
      );
      void res;
      return { id: data.id };
    }
    const id = nid();
    await db.query(
      `insert into categories (id, user_id, name, slug, description) values ($1,$2,$3,$4,$5)`,
      [id, context.userId, name, slug, data.description || null],
    );
    return { id };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    const used = await db.query<{ n: number }>(
      `select count(*)::int as n from products where category_id = $1 and user_id = $2`,
      [data.id, context.userId],
    );
    if (num(used[0]?.n) > 0) fail("Categoria com produtos. Mova ou apague os produtos primeiro.");
    await db.query(`delete from categories where id = $1 and user_id = $2`, [data.id, context.userId]);
    return { ok: true };
  });

export const listProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Product[]> => {
    const db = await sql();
    await ensureShopSeeded(db, context.userId);
    const rows = await db.query<{
      id: string;
      category_id: string;
      category_name: string;
      name: string;
      slug: string;
      description: string | null;
      price: unknown;
      cost_price: unknown;
      stock: number;
      min_stock: number;
      sku: string | null;
      barcode: string | null;
      active: boolean;
      created_at: unknown;
    }>(
      `select p.*, c.name as category_name
       from products p join categories c on c.id = p.category_id
       where p.user_id = $1 order by p.name`,
      [context.userId],
    );
    return rows.map((r) => ({
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
      createdAt: iso(r.created_at) ?? "",
    }));
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().optional(),
      categoryId: z.string(),
      name: z.string().min(1),
      description: z.string().optional().nullable(),
      price: z.number(),
      costPrice: z.number().optional().nullable(),
      stock: z.number().int(),
      minStock: z.number().int(),
      sku: z.string().optional().nullable(),
      barcode: z.string().optional().nullable(),
      active: z.boolean(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = await sql();
    const cat = await db.query(
      `select id from categories where id = $1 and user_id = $2`,
      [data.categoryId, context.userId],
    );
    if (!cat[0]) fail("Categoria inválida.");
    const name = data.name.trim();
    const slug = slugify(name) || `prod-${Date.now()}`;
    if (data.id) {
      await db.query(
        `update products set category_id=$1, name=$2, slug=$3, description=$4, price=$5, cost_price=$6,
         stock=$7, min_stock=$8, sku=$9, barcode=$10, active=$11
         where id=$12 and user_id=$13`,
        [
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
          context.userId,
        ],
      );
      return { id: data.id };
    }
    const id = nid();
    await db.query(
      `insert into products (id, user_id, category_id, name, slug, description, price, cost_price, stock, min_stock, sku, barcode, active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
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
        data.active,
      ],
    );
    return { id };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    const used = await db.query<{ n: number }>(
      `select count(*)::int as n from service_order_items where product_id = $1 and user_id = $2`,
      [data.id, context.userId],
    );
    if (num(used[0]?.n) > 0) fail("Produto já usado em ordens. Desative em vez de apagar.");
    await db.query(`delete from products where id = $1 and user_id = $2`, [data.id, context.userId]);
    return { ok: true };
  });

export const listClients = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Client[]> => {
    const db = await sql();
    await ensureShopSeeded(db, context.userId);
    const rows = await db.query<Record<string, unknown>>(
      `select c.*, (select count(*)::int from service_orders o where o.client_id = c.id) as order_count
       from clients c where c.user_id = $1 order by c.name`,
      [context.userId],
    );
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      email: (r.email as string | null) ?? null,
      phone: String(r.phone),
      whatsapp: (r.whatsapp as string | null) ?? null,
      cpfCnpj: (r.cpf_cnpj as string | null) ?? null,
      address: (r.address as string | null) ?? null,
      neighborhood: (r.neighborhood as string | null) ?? null,
      city: (r.city as string | null) ?? null,
      state: (r.state as string | null) ?? null,
      zipCode: (r.zip_code as string | null) ?? null,
      notes: (r.notes as string | null) ?? null,
      orderCount: num(r.order_count),
      createdAt: iso(r.created_at) ?? "",
    }));
  });

export const saveClient = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      email: z.string().optional().nullable(),
      phone: z.string().min(8),
      whatsapp: z.string().optional().nullable(),
      cpfCnpj: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      neighborhood: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      state: z.string().optional().nullable(),
      zipCode: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    }),
  )
  .handler(async ({ context, data }) => {
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
      data.notes || null,
    ];
    if (data.id) {
      await db.query(
        `update clients set name=$1, email=$2, phone=$3, whatsapp=$4, cpf_cnpj=$5, address=$6,
         neighborhood=$7, city=$8, state=$9, zip_code=$10, notes=$11
         where id=$12 and user_id=$13`,
        [...fields, data.id, context.userId],
      );
      return { id: data.id };
    }
    const id = nid();
    await db.query(
      `insert into clients (id, user_id, name, email, phone, whatsapp, cpf_cnpj, address, neighborhood, city, state, zip_code, notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, context.userId, ...fields],
    );
    return { id };
  });

export const deleteClient = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    const used = await db.query<{ n: number }>(
      `select count(*)::int as n from service_orders where client_id = $1 and user_id = $2`,
      [data.id, context.userId],
    );
    if (num(used[0]?.n) > 0) fail("Cliente com ordens. Não é possível apagar.");
    await db.query(`delete from clients where id = $1 and user_id = $2`, [data.id, context.userId]);
    return { ok: true };
  });

export const listServiceTypes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ServiceType[]> => {
    const db = await sql();
    await ensureShopSeeded(db, context.userId);
    const rows = await db.query<Record<string, unknown>>(
      `select * from service_types where user_id = $1 order by name`,
      [context.userId],
    );
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      description: (r.description as string | null) ?? null,
      price: num(r.price),
      durationMin: num(r.duration_min),
      active: Boolean(r.active),
      createdAt: iso(r.created_at) ?? "",
    }));
  });

export const saveServiceType = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      description: z.string().optional().nullable(),
      price: z.number(),
      durationMin: z.number().int(),
      active: z.boolean(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = await sql();
    if (data.id) {
      await db.query(
        `update service_types set name=$1, description=$2, price=$3, duration_min=$4, active=$5
         where id=$6 and user_id=$7`,
        [data.name.trim(), data.description || null, data.price, data.durationMin, data.active, data.id, context.userId],
      );
      return { id: data.id };
    }
    const id = nid();
    await db.query(
      `insert into service_types (id, user_id, name, description, price, duration_min, active)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [id, context.userId, data.name.trim(), data.description || null, data.price, data.durationMin, data.active],
    );
    return { id };
  });

export const deleteServiceType = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    const used = await db.query<{ n: number }>(
      `select count(*)::int as n from service_order_services where service_type_id = $1 and user_id = $2`,
      [data.id, context.userId],
    );
    if (num(used[0]?.n) > 0) fail("Tipo já usado em ordens. Desative em vez de apagar.");
    await db.query(`delete from service_types where id = $1 and user_id = $2`, [data.id, context.userId]);
    return { ok: true };
  });
