import { getSql } from "@/lib/db";
import type { Sql } from "@/lib/db";

export function nid(): string {
  return crypto.randomUUID();
}

export function num(value: unknown): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function iso(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export async function sql(): Promise<Sql> {
  return getSql();
}

export async function nextOrderNumber(db: Sql, userId: string): Promise<number> {
  const rows = await db.query<{ n: number }>(
    `select coalesce(max(order_number), 0)::int as n from service_orders where user_id = $1`,
    [userId],
  );
  return (rows[0]?.n ?? 0) + 1;
}

export async function nextSessionNumber(db: Sql, userId: string): Promise<number> {
  const rows = await db.query<{ n: number }>(
    `select coalesce(max(session_number), 0)::int as n from cash_registers where user_id = $1`,
    [userId],
  );
  return (rows[0]?.n ?? 0) + 1;
}

export function fail(message: string): never {
  throw new Error(message);
}
