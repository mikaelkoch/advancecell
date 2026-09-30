import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { c as trendPct, t as authMiddleware } from "./utils-CdnLhQ9B.mjs";
import { a as STATUS_LABELS } from "./domain-y13u448F.mjs";
import { cn as _enum, gn as object, yn as string } from "../_libs/@better-auth/core+[...].mjs";
import { n as iso, o as num, s as sql } from "./helpers-DClzb-S1.mjs";
import { t as ensureShopSeeded } from "./seed-C5YASBEB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/insights-B9HoP-X8.js
function periodBounds(period) {
	const end = /* @__PURE__ */ new Date();
	const start = /* @__PURE__ */ new Date();
	if (period === "today") start.setHours(0, 0, 0, 0);
	else if (period === "week") start.setDate(start.getDate() - 7);
	else if (period === "month") start.setMonth(start.getMonth() - 1);
	else start.setFullYear(start.getFullYear() - 1);
	const length = end.getTime() - start.getTime();
	const prevEnd = new Date(start.getTime());
	return {
		start,
		end,
		prevStart: new Date(start.getTime() - length),
		prevEnd
	};
}
var getDashboard_createServerFn_handler = createServerRpc({
	id: "fea45fca5bb7d97e67424df342234c8073e76de9c153ba1813fdf50505e47548",
	name: "getDashboard",
	filename: "src/lib/server/insights.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ period: _enum([
	"today",
	"week",
	"month",
	"year"
]) })).handler(getDashboard_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await ensureShopSeeded(db, context.userId);
	const { start, end, prevStart, prevEnd } = periodBounds(data.period);
	const [clients, products, ordersAll, current, previous, byStatus, lowStock, monthly] = await Promise.all([
		db.query(`select count(*)::int as n from clients where user_id = $1`, [context.userId]),
		db.query(`select count(*)::int as n from products where user_id = $1 and active = true`, [context.userId]),
		db.query(`select count(*)::int as n from service_orders where user_id = $1`, [context.userId]),
		db.query(`select count(*)::int as n, coalesce(sum(total_price),0) as revenue, coalesce(sum(paid_amount),0) as paid
         from service_orders where user_id = $1 and status <> 'CANCELLED' and created_at >= $2 and created_at <= $3`, [
			context.userId,
			start.toISOString(),
			end.toISOString()
		]),
		db.query(`select count(*)::int as n, coalesce(sum(total_price),0) as revenue
         from service_orders where user_id = $1 and status <> 'CANCELLED' and created_at >= $2 and created_at < $3`, [
			context.userId,
			prevStart.toISOString(),
			prevEnd.toISOString()
		]),
		db.query(`select status, count(*)::int as n from service_orders
         where user_id = $1 and created_at >= $2 and created_at <= $3
         group by status`, [
			context.userId,
			start.toISOString(),
			end.toISOString()
		]),
		db.query(`select p.id, p.name, p.stock, p.min_stock, c.name as category
         from products p join categories c on c.id = p.category_id
         where p.user_id = $1 and p.active = true and p.stock <= p.min_stock
         order by p.stock asc limit 8`, [context.userId]),
		db.query(`select to_char(created_at, 'YYYY-MM') as month,
                coalesce(sum(total_price),0) as revenue,
                count(*)::int as orders
         from service_orders
         where user_id = $1 and status <> 'CANCELLED' and created_at >= now() - interval '8 months'
         group by 1 order by 1`, [context.userId])
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
			revenueTrend: trendPct(revenue, prevRevenue)
		},
		ordersByStatus: byStatus.map((s) => ({
			status: s.status,
			label: STATUS_LABELS[s.status] ?? s.status,
			count: num(s.n)
		})),
		lowStock: lowStock.map((p) => ({
			id: p.id,
			name: p.name,
			stock: num(p.stock),
			minStock: num(p.min_stock),
			category: p.category
		})),
		monthly: monthly.map((m) => ({
			month: m.month,
			revenue: num(m.revenue),
			orders: num(m.orders)
		}))
	};
});
var getReports_createServerFn_handler = createServerRpc({
	id: "e396290d22454d7da7717147d0a2ca43e83fc199241bf3542f08fe3d4f4b5e03",
	name: "getReports",
	filename: "src/lib/server/insights.ts"
}, (opts) => getReports.__executeServer(opts));
var getReports = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({
	startDate: string(),
	endDate: string()
})).handler(getReports_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await ensureShopSeeded(db, context.userId);
	const start = new Date(data.startDate);
	const end = new Date(data.endDate);
	end.setHours(23, 59, 59, 999);
	const orders = await db.query(`select o.*, c.name as client_name
       from service_orders o join clients c on c.id = o.client_id
       where o.user_id = $1 and o.status <> 'CANCELLED' and o.created_at >= $2 and o.created_at <= $3
       order by o.created_at`, [
		context.userId,
		start.toISOString(),
		end.toISOString()
	]);
	const items = await db.query(`select i.product_id, p.name, c.name as category, i.quantity, i.total_price, p.cost_price
       from service_order_items i
       join products p on p.id = i.product_id
       join categories c on c.id = p.category_id
       join service_orders o on o.id = i.service_order_id
       where i.user_id = $1 and o.status <> 'CANCELLED' and o.created_at >= $2 and o.created_at <= $3`, [
		context.userId,
		start.toISOString(),
		end.toISOString()
	]);
	const svcs = await db.query(`select s.service_type_id, t.name, s.quantity, s.total_price
       from service_order_services s
       join service_types t on t.id = s.service_type_id
       join service_orders o on o.id = s.service_order_id
       where s.user_id = $1 and o.status <> 'CANCELLED' and o.created_at >= $2 and o.created_at <= $3`, [
		context.userId,
		start.toISOString(),
		end.toISOString()
	]);
	const byDay = {};
	const byClient = {};
	for (const o of orders) {
		const day = (iso(o.created_at) ?? "").slice(0, 10);
		if (!byDay[day]) byDay[day] = {
			date: day,
			orders: 0,
			revenue: 0,
			paid: 0,
			pending: 0
		};
		const total = num(o.total_price);
		const paid = num(o.paid_amount);
		byDay[day].orders += 1;
		byDay[day].revenue += total;
		byDay[day].paid += paid;
		byDay[day].pending += total - paid;
		const cid = String(o.client_id);
		if (!byClient[cid]) byClient[cid] = {
			name: String(o.client_name),
			orders: 0,
			total: 0
		};
		byClient[cid].orders += 1;
		byClient[cid].total += total;
	}
	const byProduct = {};
	for (const i of items) {
		const key = String(i.product_id);
		if (!byProduct[key]) byProduct[key] = {
			name: String(i.name),
			category: String(i.category),
			quantity: 0,
			revenue: 0,
			cost: 0
		};
		byProduct[key].quantity += num(i.quantity);
		byProduct[key].revenue += num(i.total_price);
		byProduct[key].cost += num(i.cost_price) * num(i.quantity);
	}
	const byService = {};
	for (const s of svcs) {
		const key = String(s.service_type_id);
		if (!byService[key]) byService[key] = {
			name: String(s.name),
			quantity: 0,
			revenue: 0
		};
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
			avgTicket: orders.length ? totalRevenue / orders.length : 0
		},
		byDay: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
		byProduct: Object.values(byProduct).sort((a, b) => b.quantity - a.quantity),
		byService: Object.values(byService).sort((a, b) => b.quantity - a.quantity),
		byClient: Object.values(byClient).sort((a, b) => b.total - a.total)
	};
});
//#endregion
export { getDashboard_createServerFn_handler, getReports_createServerFn_handler };
