const BASE = process.env.CHROMA_SERVER_HOST || "http://localhost:8000";

export type UpsertBody = { id: string; vector: number[]; metadata?: any; doc?: string };
export type QueryBody = { vector: number[]; n_results?: number };

export async function upsertToChroma(body: UpsertBody) {
  const res = await fetch(`${BASE}/upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Chroma upsert failed: ${res.status}`);
  return res.json();
}

export async function queryChroma(body: QueryBody) {
  const res = await fetch(`${BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Chroma query failed: ${res.status}`);
  return res.json();
}