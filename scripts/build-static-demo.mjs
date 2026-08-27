/**
 * Builds a single self-contained HTML file that runs the real frontend bundle
 * against recorded API responses. Used for read-only previews (an artifact, a
 * file opened straight from disk) where no server is available.
 *
 *   node scripts/build-static-demo.mjs <api-snapshot.json> <out.html>
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = path.join(root, "artifacts/lead-catcher");
const dist = path.join(app, "dist/public");

const [snapshotPath, outPath] = process.argv.slice(2);
if (!snapshotPath || !outPath) {
  console.error("usage: build-static-demo.mjs <api-snapshot.json> <out.html>");
  process.exit(1);
}

console.log("[demo] building frontend with hash routing…");
execFileSync("npx", ["vite", "build", "--config", "vite.config.ts"], {
  cwd: app,
  stdio: "inherit",
  env: { ...process.env, VITE_HASH_ROUTER: "1", BASE_PATH: "./" },
});

const assetDir = path.join(dist, "assets");
const assets = fs.readdirSync(assetDir);

const read = (ext) => {
  const name = assets.find((f) => f.endsWith(ext));
  if (!name) throw new Error(`no ${ext} bundle in ${assetDir}`);
  return { name, body: fs.readFileSync(path.join(assetDir, name), "utf8") };
};

const css = read(".css");
let js = read(".js");

// Images referenced from CSS/JS become data URIs; nothing may hit the network.
const mime = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp" };
let cssBody = css.body;
for (const file of assets) {
  const ext = path.extname(file);
  if (!mime[ext]) continue;
  const uri = `data:${mime[ext]};base64,${fs.readFileSync(path.join(assetDir, file)).toString("base64")}`;
  const ref = new RegExp(`(\\./)?(assets/)?${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");
  cssBody = cssBody.replace(ref, uri);
  js.body = js.body.replace(ref, uri);
}

const snapshot = fs.readFileSync(snapshotPath, "utf8");
// The preview is a distinct thing from the product, so it carries its own name
// rather than inheriting the application's document title.
const title = process.env.DEMO_TITLE || "Persona na żywo";

const shim = `
<script>
// ─── Recorded API ────────────────────────────────────────────────────────────
// This preview has no backend. Reads replay responses captured from a real run;
// writes are kept in memory so the interface stays usable, and the advisor's
// replies are scripted rather than generated.
(function () {
  const DB = ${snapshot};
  const memory = { conversations: [], nextId: 9000, settings: { ...DB["/api/admin/settings"] } };

  const REPLIES = [
    "Dzień dobry! Bardzo się cieszę, że Pan/Pani pisze. Proszę powiedzieć, czego dokładnie potrzebujecie — dobiorę najlepsze rozwiązanie i przygotuję orientacyjną wycenę.",
    "Rozumiem. Żeby policzyć to rzetelnie, potrzebuję dwóch informacji: jakie są wymiary oraz na kiedy realizacja miałaby być gotowa?",
    "Dziękuję. To bardzo pomaga. Czy mogę prosić o numer telefonu? Prześlę na niego kalkulację razem z terminami.",
    "Świetnie, zapisałem. Przekazuję wszystko zespołowi — odezwiemy się w ciągu jednego dnia roboczego z konkretną propozycją.",
  ];
  let turn = 0;

  const json = (body, status) =>
    new Response(JSON.stringify(body), { status: status || 200, headers: { "Content-Type": "application/json" } });

  function sse(text) {
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        const words = text.split(" ");
        let i = 0;
        const tick = () => {
          if (i >= words.length) {
            controller.enqueue(enc.encode('data: {"done":true}\\n\\n'));
            controller.close();
            return;
          }
          const chunk = words[i++] + (i < words.length ? " " : "");
          controller.enqueue(enc.encode("data: " + JSON.stringify({ content: chunk }) + "\\n\\n"));
          setTimeout(tick, 45);
        };
        setTimeout(tick, 260);
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
  }

  const realFetch = window.fetch.bind(window);

  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : input.url;
    const method = ((init && init.method) || (input && input.method) || "GET").toUpperCase();
    const p = url.replace(/^https?:\\/\\/[^/]+/, "").split("?")[0];

    if (!p.startsWith("/api/")) return realFetch(input, init);

    // Chat: stream a scripted advisor reply.
    if (method === "POST" && /^\\/api\\/anthropic\\/conversations\\/\\d+\\/messages$/.test(p)) {
      return sse(REPLIES[Math.min(turn++, REPLIES.length - 1)]);
    }
    if (method === "POST" && p === "/api/anthropic/conversations") {
      const id = memory.nextId++;
      const body = init && init.body ? JSON.parse(init.body) : {};
      const conv = { id, title: body.title || "Rozmowa", sessionToken: body.sessionToken || String(id),
        emailSent: false, webhookSent: false, completed: false, summary: null, requirements: null,
        contactName: null, contactEmail: null, contactPhone: null, contactCompany: null,
        personaId: body.personaId ?? null, createdAt: new Date().toISOString() };
      memory.conversations.push(conv);
      return json(conv, 201);
    }
    if (method === "POST" && /^\\/api\\/leads\\/\\d+\\/complete$/.test(p)) {
      return json({ success: true, message: "Rozmowa została zakończona i zapisana jako lead",
        emailSent: true, webhookSent: true, summary: "Podsumowanie w tym podglądzie jest przykładowe.",
        contactInfo: { name: null, email: null, phone: null, company: null } });
    }
    if (method === "POST" && p === "/api/leads/upload") {
      return json({ success: true, message: "Plik został zapisany", id: memory.nextId++,
        fileName: "zalacznik.pdf", fileUrl: "#", mimeType: "application/pdf", sizeBytes: 24576 }, 201);
    }
    if (method === "POST" && p === "/api/admin/webhook-test") {
      return json({ success: true, message: "Testowe zgłoszenie zostało wysłane (podgląd)" });
    }
    if (method === "POST" && /\\/summarize$/.test(p)) {
      return json({ summary: "Podsumowanie AI jest w tym podglądzie przykładowe.", requirements: null,
        contactInfo: { name: null, email: null, phone: null, company: null } });
    }
    if (method === "PUT" && p === "/api/admin/settings") {
      Object.assign(memory.settings, init && init.body ? JSON.parse(init.body) : {});
      return json(memory.settings);
    }
    if (method === "GET" && p === "/api/admin/settings") return json(memory.settings);
    if (method === "POST" || method === "PUT" || method === "DELETE") {
      return json({ success: true, message: "Zapis jest wyłączony w tym podglądzie" });
    }

    if (DB[p]) return json(DB[p]);
    if (/^\\/api\\/leads\\/session\\//.test(p)) return json({ error: "Session not found" }, 404);
    if (/^\\/api\\/personas\\/by-slug\\//.test(p)) return json({ error: "Persona not found" }, 404);
    if (/\\/attachments$/.test(p)) return json([]);
    return json({ error: "Ten endpoint nie jest dostępny w podglądzie" }, 404);
  };

  // Land on the studio rather than a blank route.
  if (!location.hash || location.hash === "#") location.hash = "#/";
})();
</script>

<style>
  #demo-banner {
    position:fixed; left:0; right:0; bottom:0; z-index:2147483000;
    display:flex; gap:10px; align-items:center; justify-content:center; flex-wrap:wrap;
    padding:9px 16px; background:#0b1220; color:#cbd5e1; border-top:1px solid #1e293b;
    font:500 12px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;
  }
  #demo-banner b { color:#f8fafc; font-weight:600; }
  #demo-banner .tag {
    font:600 10px/1 ui-monospace,monospace; letter-spacing:.1em; text-transform:uppercase;
    padding:4px 8px; border-radius:999px; background:#f59e0b1f; color:#fbbf24; border:1px solid #f59e0b3d;
  }
  #demo-banner a { color:#38bdf8; }
  #demo-banner button {
    margin-left:4px; background:none; border:1px solid #334155; color:#94a3b8;
    border-radius:6px; padding:3px 9px; font:inherit; font-size:11px; cursor:pointer;
  }
  #demo-banner button:hover { color:#e2e8f0; border-color:#475569; }
  body { padding-bottom:44px; }
  /* Full-height screens (the chat) would otherwise put their composer under the banner. */
  .h-\\[100dvh\\] { height: calc(100dvh - 44px) !important; }
  .min-h-screen { min-height: calc(100vh - 44px) !important; }
</style>
<div id="demo-banner">
  <span class="tag">Podgląd</span>
  <span><b>Interfejs jest prawdziwy, backend nagrany.</b>
  Dane pochodzą z rzeczywistego uruchomienia; odpowiedzi doradcy są napisane z góry, nie generowane przez model.</span>
  <button type="button" onclick="document.getElementById('demo-banner').remove()">Ukryj</button>
</div>
`;

const html = `<title>${title}</title>
<style>${cssBody}</style>
${shim}
<div id="root"></div>
<script type="module">${js.body}</script>
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html);
console.log(`[demo] ${outPath} — ${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB`);
