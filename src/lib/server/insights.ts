import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { STATUS_LABELS, type ServiceOrderStatus } from "@/lib/domain";
import { trendPct } from "@/lib/utils";
import { iso, num, sql } from "./helpers";
import { ensureShopSeeded } from "./seed";

function periodBounds(period: "today" | "week" | "month" | "year") {
  const end = new Date();
  const start = new Date();
  if (period === "today") start.setHours(0, 0, 0, 0);
  else if (period === "week") start.setDate(start.getDate() - 7);
  else if (period === "month") start.setMonth(start.getMonth() - 1);
  else start.setFullYear(start.getFullYear() - 1);
  const length = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime());
  const prevStart = new Date(start.getTime() - length);
  return { start, end, prevStart, prevEnd };
}

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ period: z.enum(["today", "week", "month", "year"]) }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    await ensureShopSeeded(db, context.userId);
    const { start, end, prevStart, prevEnd } = periodBounds(data.period);

    const [clients, products, ordersAll, current, previous, byStatus, lowStock, monthly] = await Promise.all([
      db.query<{ n: number }>(`select count(*)::int as n from clients where user_id = $1`, [context.userId]),
      db.query<{ n: number }>(
        `select count(*)::int as n from products where user_id = $1 and active = true`,
        [context.userId],
      ),
      db.query<{ n: number }>(`select count(*)::int as n from service_orders where user_id = $1`, [context.userId]),
      db.query<{ n: number; revenue: unknown; paid: unknown }>(
        `select count(*)::int as n, coalesce(sum(total_price),0) as revenue, coalesce(sum(paid_amount),0) as paid
         from service_orders where user_id = $1 and status <> 'CANCELLED' and created_at >= $2 and created_at <= $3`,
        [context.userId, start.toISOString(), end.toISOString()],
      ),
      db.query<{ n: number; revenue: unknown }>(
        `select count(*)::int as n, coalesce(sum(total_price),0) as revenue
         from service_orders where user_id = $1 and status <> 'CANCELLED' and created_at >= $2 and created_at < $3`,
        [context.userId, prevStart.toISOString(), prevEnd.toISOString()],
      ),
      db.query<{ status: string; n: number }>(
        `select status, count(*)::int as n from service_orders
         where user_id = $1 and created_at >= $2 and created_at <= $3
         group by status`,
        [context.userId, start.toISOString(), end.toISOString()],
      ),
      db.query<{ id: string; name: string; stock: number; min_stock: number; category: string }>(
        `select p.id, p.name, p.stock, p.min_stock, c.name as category
         from products p join categories c on c.id = p.category_id
         where p.user_id = $1 and p.active = true and p.stock <= p.min_stock
         order by p.stock asc limit 8`,
        [context.userId],
      ),
      db.query<{ month: string; revenue: unknown; orders: number }>(
        `select to_char(created_at, 'YYYY-MM') as month,
                coalesce(sum(total_price),0) as revenue,
                count(*)::int as orders
         from service_orders
         where user_id = $1 and status <> 'CANCELLED' and created_at >= now() - interval '8 months'
         group by 1 order by 1`,
        [context.userId],
      ),
    ]);

    const ordersPeriod = num(current[0]?.n);
    const revenue = num(current[0]?.revenue);
    const paid = num(current[0]?.paid);
    const prevOrders = num(previous[0]?.n);
    const prevRevenue = num(previous[0]?.revenue);

    return {
      period: data.period,
      kpis: {
        totalClients: num(clients[0]?.n),
        totalProducts: num(products[0]?.n),
        totalOrders: num(ordersAll[0]?.n),
        ordersPeriod,
        revenue,
        paid,
        pending: revenue - paid,
        avgTicket: ordersPeriod > 0 ? revenue / ordersPeriod : 0,
        ordersTrend: trendPct(ordersPeriod, prevOrders),
        revenueTrend: trendPct(revenue, prevRevenue),
      },
      ordersByStatus: byStatus.map((s) => ({
        status: s.status as ServiceOrderStatus,
        label: STATUS_LABELS[s.status as ServiceOrderStatus] ?? s.status,
        count: num(s.n),
      })),
      lowStock: lowStock.map((p) => ({
        id: p.id,
        name: p.name,
        stock: num(p.stock),
        minStock: num(p.min_stock),
        category: p.category,
      })),
      monthly: monthly.map((m) => ({
        month: m.month,
        revenue: num(m.revenue),
        orders: num(m.orders),
      })),
    };
  });

export const getReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      startDate: z.string(),
      endDate: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = await sql();
    await ensureShopSeeded(db, context.userId);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    end.setHours(23, 59, 59, 999);

    const orders = await db.query<Record<string, unknown>>(
      `select o.*, c.name as client_name
       from service_orders o join clients c on c.id = o.client_id
       where o.user_id = $1 and o.status <> 'CANCELLED' and o.created_at >= $2 and o.created_at <= $3
       order by o.created_at`,
      [context.userId, start.toISOString(), end.toISOString()],
    );

    const items = await db.query<Record<string, unknown>>(
      `select i.product_id, p.name, c.name as category, i.quantity, i.total_price, p.cost_price
       from service_order_items i
       join products p on p.id = i.product_id
       join categories c on c.id = p.category_id
       join service_orders o on o.id = i.service_order_id
       where i.user_id = $1 and o.status <> 'CANCELLED' and o.created_at >= $2 and o.created_at <= $3`,
      [context.userId, start.toISOString(), end.toISOString()],
    );

    const svcs = await db.query<Record<string, unknown>>(
      `select s.service_type_id, t.name, s.quantity, s.total_price
       from service_order_services s
       join service_types t on t.id = s.service_type_id
       join service_orders o on o.id = s.service_order_id
       where s.user_id = $1 and o.status <> 'CANCELLED' and o.created_at >= $2 and o.created_at <= $3`,
      [context.userId, start.toISOString(), end.toISOString()],
    );

    const byDay: Record<string, { date: string; orders: number; revenue: number; paid: number; pending: number }> = {};
    const byClient: Record<string, { name: string; orders: number; total: number }> = {};
    for (const o of orders) {
      const day = (iso(o.created_at) ?? "").slice(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, orders: 0, revenue: 0, paid: 0, pending: 0 };
      const total = num(o.total_price);
      const paid = num(o.paid_amount);
      byDay[day].orders += 1;
      byDay[day].revenue += total;
      byDay[day].paid += paid;
      byDay[day].pending += total - paid;
      const cid = String(o.client_id);
      if (!byClient[cid]) byClient[cid] = { name: String(o.client_name), orders: 0, total: 0 };
      byClient[cid].orders += 1;
      byClient[cid].total += total;
    }

    const byProduct: Record<string, { name: string; category: string; quantity: number; revenue: number; cost: number }> =
      {};
    for (const i of items) {
      const key = String(i.product_id);
      if (!byProduct[key])
        byProduct[key] = { name: String(i.name), category: String(i.category), quantity: 0, revenue: 0, cost: 0 };
      byProduct[key].quantity += num(i.quantity);
      byProduct[key].revenue += num(i.total_price);
      byProduct[key].cost += num(i.cost_price) * num(i.quantity);
    }

    const byService: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const s of svcs) {
      const key = String(s.service_type_id);
      if (!byService[key]) byService[key] = { name: String(s.name), quantity: 0, revenue: 0 };
      byService[key].quantity += num(s.quantity);
      byService[key].revenue += num(s.total_price);
    }

    const totalRevenue = orders.reduce((s, o) => s + num(o.total_price), 0);
    const totalPaid = orders.reduce((s, o) => s + num(o.paid_amount), 0);

    return {
      summary: {
        totalOrders: orders.length,
        totalRevenue,
        totalPaid,
        totalPending: totalRevenue - totalPaid,
        avgTicket: orders.length ? totalRevenue / orders.length : 0,
      },
      byDay: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
      byProduct: Object.values(byProduct).sort((a, b) => b.quantity - a.quantity),
      byService: Object.values(byService).sort((a, b) => b.quantity - a.quantity),
      byClient: Object.values(byClient).sort((a, b) => b.total - a.total),
    };
  });
