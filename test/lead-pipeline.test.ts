import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const SERVER_ENTRY = path.join(REPO_ROOT, "artifacts/api-server/src/index.ts");

let server: ChildProcess;
let webhook: http.Server;
let base = "";
let workDir = "";
const received: any[] = [];

async function waitForHealth(url: string, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url + "/api/healthz");
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error(`API did not become healthy within ${timeoutMs}ms`);
}

const api = (p: string, init?: RequestInit) => fetch(base + p, init);
const json = async (p: string, init?: RequestInit) => (await api(p, init)).json();
const put = (p: string, body: unknown) =>
  api(p, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const post = (p: string, body?: unknown) =>
  api(p, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

before(async () => {
  // A throwaway cwd gives the run its own PGlite database and uploads directory.
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), "persona-test-"));

  const hookPort = await new Promise<number>(resolve => {
    webhook = http.createServer((req, res) => {
      let body = "";
      req.on("data", c => (body += c));
      req.on("end", () => {
        received.push(JSON.parse(body || "{}"));
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end('{"ok":true}');
      });
    });
    webhook.listen(0, "127.0.0.1", () => resolve((webhook.address() as any).port));
  });

  const apiPort = 4100 + Math.floor(Math.random() * 800);
  base = `http://127.0.0.1:${apiPort}`;

  // cwd stays at the repo root so `tsx` resolves; storage is isolated by env.
  server = spawn(process.execPath, ["--import", "tsx", SERVER_ENTRY], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      PORT: String(apiPort),
      DATABASE_URL: "",
      PGLITE_DATA_DIR: path.join(workDir, "pgdata"),
      UPLOAD_DIR: path.join(workDir, "uploads"),
      NO_PROXY: "127.0.0.1,localhost",
      no_proxy: "127.0.0.1,localhost",
    },
    stdio: "ignore",
  });

  await waitForHealth(base);
  await put("/api/admin/settings", {
    companyName: "Testowa Agencja",
    notificationEmail: "leads@example.com",
    webhookUrl: `http://127.0.0.1:${hookPort}/crm`,
  });
});

after(async () => {
  server?.kill();
  await new Promise<void>(r => webhook.close(() => r()));
  fs.rmSync(workDir, { recursive: true, force: true });
});

describe("seeded data", () => {
  test("personas and their types are seeded", async () => {
    const personas = await json("/api/admin/personas");
    assert.ok(personas.length >= 10, `expected seeded personas, got ${personas.length}`);
    const types = await json("/api/admin/persona-types");
    assert.ok(types.length > 0);
  });

  test("a persona is reachable by slug, an unknown one is a 404", async () => {
    assert.equal((await api("/api/personas/by-slug/ania")).status, 200);
    assert.equal((await api("/api/personas/by-slug/nie-ma-takiej")).status, 404);
  });

  test("the widget serves its loader and per-persona config", async () => {
    const js = await api("/widget.js");
    assert.equal(js.status, 200);
    assert.match(js.headers.get("content-type") ?? "", /javascript/);
    assert.match(await js.text(), /LeadTrapConfig|ltw-bubble/);

    const cfg = await json("/api/widget/config/ania");
    assert.equal(cfg.name, "Ania");
    assert.ok(cfg.style);
  });
});

describe("lead lifecycle", () => {
  let conversationId = 0;

  test("a conversation can be opened for a persona", async () => {
    const conv = await json("/api/anthropic/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test", sessionToken: "tok-" + Date.now(), personaId: 3 }),
    });
    conversationId = conv.id;
    assert.ok(conversationId > 0);
  });

  test("contact details are captured from the visitor's message", async () => {
    // The AI reply fails without a provider key; capture happens before that call.
    await post(`/api/anthropic/conversations/${conversationId}/messages`, {
      content: "Nazywam sie Krzysztof Nowak, firma Kowalski Meble, tel 501 602 703, mail k@example.com",
    });
    const lead = await json(`/api/admin/leads/${conversationId}`);
    assert.equal(lead.contactInfo.name, "Krzysztof Nowak");
    assert.equal(lead.contactInfo.phone, "501602703");
    assert.equal(lead.contactInfo.email, "k@example.com");
    assert.equal(lead.contactInfo.company, "Kowalski Meble");
  });

  test("an allowed file is stored and linked to the conversation", async () => {
    const form = new FormData();
    form.append("file", new Blob(["brief projektu"], { type: "text/plain" }), "brief.txt");
    form.append("conversationId", String(conversationId));
    const res = await api("/api/leads/upload", { method: "POST", body: form });
    assert.equal(res.status, 201);

    const attachments = await json(`/api/leads/${conversationId}/attachments`);
    assert.equal(attachments.length, 1);
    assert.equal(attachments[0].fileName, "brief.txt");
  });

  test("a disallowed file type is refused with 400, not 500", async () => {
    const form = new FormData();
    form.append("file", new Blob(["#!/bin/sh"], { type: "application/x-sh" }), "evil.sh");
    const res = await api("/api/leads/upload", { method: "POST", body: form });
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /typ pliku/i);
  });

  test("completing the lead delivers it to the webhook", async () => {
    received.length = 0;
    const result = await json(`/api/leads/${conversationId}/complete`, { method: "POST" });
    assert.equal(result.success, true);
    assert.equal(result.webhookSent, true);
    // No RESEND_API_KEY here, so the flag must report the truth rather than optimism.
    assert.equal(result.emailSent, false);

    assert.equal(received.length, 1);
    assert.equal(received[0].event, "lead.completed");
    assert.equal(received[0].data.contact.phone, "501602703");
    assert.ok(received[0].data.transcript.length > 0);
  });

  test("the session resumes from its token", async () => {
    const lead = await json(`/api/admin/leads/${conversationId}`);
    const resumed = await json(`/api/leads/session/${lead.sessionToken}`);
    assert.equal(resumed.id, conversationId);
    assert.equal(resumed.completed, true);
  });

  test("a captured lead can be re-sent on demand", async () => {
    received.length = 0;
    const result = await json(`/api/admin/leads/${conversationId}/resend`, { method: "POST" });
    assert.equal(result.webhookSent, true);
    assert.deepEqual(result.errors, []);
    assert.equal(received.length, 1);
  });

  test("analytics counts each real contact once", async () => {
    const overview = await json("/api/admin/analytics/overview");
    // One phone and one e-mail. The attachment URL's timestamp is not a phone.
    assert.equal(overview.capturedContactsCount, 2);
    assert.deepEqual(
      overview.capturedContacts.map((c: any) => c.type).sort(),
      ["email", "phone"],
    );
  });
});

describe("settings", () => {
  test("notification targets round-trip", async () => {
    const saved = await (await put("/api/admin/settings", { companyName: "Inna Nazwa" })).json();
    assert.equal(saved.companyName, "Inna Nazwa");
    assert.equal((await json("/api/admin/settings")).companyName, "Inna Nazwa");
  });

  test("public settings expose only what visitors may see", async () => {
    const pub = await json("/api/public/settings");
    assert.deepEqual(Object.keys(pub).sort(), [
      "companyName",
      "consultantName",
      "salesEnabled",
      "timerHours",
      "timerMode",
    ]);
    assert.ok(!("webhookUrl" in pub), "the webhook URL must never reach visitors");
    assert.ok(!("systemPrompt" in pub), "the system prompt must never reach visitors");
  });

  test("the webhook can be tested from the panel", async () => {
    received.length = 0;
    const res = await post("/api/admin/webhook-test", {});
    assert.equal(res.status, 200);
    assert.equal(received.length, 1);
    assert.equal(received[0].data.conversationId, 0);
  });

  test("testing an unreachable webhook reports 502 instead of throwing", async () => {
    const res = await post("/api/admin/webhook-test", { webhookUrl: "http://127.0.0.1:1/nope" });
    assert.equal(res.status, 502);
    assert.ok((await res.json()).error);
  });
});
