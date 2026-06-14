import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/?/, "");
  const store = getStore({ name: "gcq", consistency: "strong" });
  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  };
  const json = (o, s = 200) =>
    new Response(JSON.stringify(o), { status: s, headers: { ...cors, "content-type": "application/json" } });

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    if (path === "ping") return json({ ok: true });

    if (path === "get") {
      const key = url.searchParams.get("key");
      if (!key) return json({ error: "key required" }, 400);
      const value = await store.get(key);
      return json({ value: value ?? null });
    }

    if (path === "set" && req.method === "POST") {
      const { key, value } = await req.json();
      if (!key) return json({ error: "key required" }, 400);
      await store.set(key, value ?? "");
      return json({ ok: true });
    }

    if (path === "list") {
      const prefix = url.searchParams.get("prefix") || "";
      const { blobs } = await store.list({ prefix });
      return json({ keys: blobs.map((b) => b.key) });
    }

    if (path === "delete" && req.method === "POST") {
      const { key } = await req.json();
      if (!key) return json({ error: "key required" }, 400);
      await store.delete(key);
      return json({ ok: true });
    }

    if (path === "clear" && req.method === "POST") {
      const { prefix } = await req.json();
      if (!prefix) return json({ error: "prefix required" }, 400);
      const { blobs } = await store.list({ prefix });
      let n = 0;
      for (const b of blobs) { await store.delete(b.key); n++; }
      return json({ ok: true, deleted: n });
    }

    return json({ error: "not found" }, 404);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
};

export const config = { path: "/api/*" };
