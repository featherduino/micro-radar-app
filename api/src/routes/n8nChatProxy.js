const router = require("express").Router();
const fetch = (...args) => import("node-fetch").then(({ default: fetchFn }) => fetchFn(...args));

function buildTargetUrl(base, query) {
  const target = new URL(base);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => target.searchParams.append(key, v));
    } else if (value !== undefined) {
      target.searchParams.append(key, value);
    }
  });
  return target;
}

router.all("/n8n-chat", async (req, res) => {
  try {
    const baseUrl = process.env.N8N_CHAT_WEBHOOK_URL;
    if (!baseUrl) {
      return res.status(500).json({ error: "N8N_CHAT_WEBHOOK_URL is not configured" });
    }

    const target = buildTargetUrl(baseUrl, req.query);
    const headers = {
      "content-type": req.headers["content-type"] || "application/json",
    };

    const body =
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : req.body && Object.keys(req.body).length > 0
        ? JSON.stringify(req.body)
        : undefined;

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
    });

    const contentType = upstream.headers.get("content-type") || "";
    const buffer = await upstream.arrayBuffer();

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) {
        return;
      }
      res.setHeader(key, value);
    });

    if (contentType.includes("application/json")) {
      res.json(JSON.parse(Buffer.from(buffer).toString("utf8")));
    } else {
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    console.error("N8N CHAT PROXY ERROR:", err);
    res.status(500).json({ error: "failed to reach n8n chat webhook" });
  }
});

module.exports = router;
