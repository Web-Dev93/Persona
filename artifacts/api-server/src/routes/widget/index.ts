import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, personas, personaTypes } from "@workspace/db";
import { getAllSettings } from "../../lib/settings";

const router: IRouter = Router();

/**
 * Configuration the embedded widget pulls at boot so the operator can change the
 * advisor in the admin panel without editing the snippet on the client's site.
 */
router.get("/widget/config/:slug", async (req, res): Promise<void> => {
  const slug = req.params.slug?.toLowerCase().trim();
  const settings = await getAllSettings();

  let persona = slug
    ? (await db.select().from(personas).where(eq(personas.slug, slug)))[0]
    : undefined;
  if (!persona) {
    persona = (await db.select().from(personas).where(eq(personas.isActive, true)))[0];
  }
  if (!persona) {
    res.status(404).json({ error: "Nie znaleziono persony dla widgetu" });
    return;
  }

  let effectiveStyle = persona.style ?? "professional";
  if (!persona.style && persona.personaTypeId) {
    const [pt] = await db.select().from(personaTypes).where(eq(personaTypes.id, persona.personaTypeId));
    if (pt) effectiveStyle = pt.defaultStyle;
  }

  res.json({
    slug: persona.slug,
    name: persona.name,
    title: persona.title,
    photoUrl: persona.photoUrl,
    style: effectiveStyle,
    companyName: settings["company_name"] || "Persona",
    welcomeText: `Cześć! Tu ${persona.name}. W czym mogę pomóc?`,
  });
});

const WIDGET_JS = String.raw`(function () {
  "use strict";
  if (window.__leadTrapWidgetLoaded) return;
  window.__leadTrapWidgetLoaded = true;

  var script = document.currentScript;
  var origin = (function () {
    try { return new URL(script.src).origin; } catch (e) { return window.location.origin; }
  })();

  var cfg = window.LeadTrapConfig || {};
  var slug = cfg.personaSlug || cfg.demoId || "";
  var accent = cfg.accentColor || "#0084ff";
  var position = cfg.position === "left" ? "left" : "right";
  var welcome = cfg.welcomeText || "Masz pytanie? Napisz do nas.";
  var chatUrl = origin + "/chat/" + encodeURIComponent(slug) + "?embed=1";

  var open = false;

  var style = document.createElement("style");
  style.textContent =
    ".ltw-bubble{position:fixed;bottom:20px;" + position + ":20px;width:60px;height:60px;border-radius:50%;" +
    "border:none;cursor:pointer;z-index:2147483000;box-shadow:0 8px 24px rgba(0,0,0,.22);" +
    "display:flex;align-items:center;justify-content:center;transition:transform .18s ease;}" +
    ".ltw-bubble:hover{transform:scale(1.06);}" +
    ".ltw-bubble svg{width:28px;height:28px;fill:#fff;}" +
    ".ltw-panel{position:fixed;bottom:92px;" + position + ":20px;width:380px;height:600px;max-width:calc(100vw - 32px);" +
    "max-height:calc(100vh - 120px);border:none;border-radius:16px;overflow:hidden;z-index:2147483000;" +
    "box-shadow:0 24px 60px rgba(0,0,0,.28);background:#fff;display:none;}" +
    ".ltw-panel.ltw-open{display:block;}" +
    ".ltw-teaser{position:fixed;bottom:34px;" + position + ":92px;max-width:230px;background:#fff;color:#0f172a;" +
    "font:500 13px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;padding:10px 14px;border-radius:12px;" +
    "box-shadow:0 8px 24px rgba(0,0,0,.16);z-index:2147482999;cursor:pointer;}" +
    "@media(max-width:480px){.ltw-panel{width:calc(100vw - 24px);height:calc(100vh - 110px);}.ltw-teaser{display:none;}}";
  document.head.appendChild(style);

  var frame = document.createElement("iframe");
  frame.className = "ltw-panel";
  frame.title = "Czat z doradcą";
  frame.setAttribute("allow", "clipboard-write");

  var button = document.createElement("button");
  button.className = "ltw-bubble";
  button.type = "button";
  button.setAttribute("aria-label", "Otwórz czat z doradcą");
  button.style.background = accent;
  button.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>';

  var teaser = document.createElement("div");
  teaser.className = "ltw-teaser";
  teaser.textContent = welcome;

  function toggle() {
    open = !open;
    if (open && !frame.src) frame.src = chatUrl;
    frame.classList.toggle("ltw-open", open);
    button.setAttribute("aria-label", open ? "Zamknij czat z doradcą" : "Otwórz czat z doradcą");
    teaser.style.display = open ? "none" : "";
  }

  button.addEventListener("click", toggle);
  teaser.addEventListener("click", toggle);

  function mount() {
    document.body.appendChild(frame);
    document.body.appendChild(button);
    if (welcome) document.body.appendChild(teaser);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
`;

router.get("/widget.js", (_req, res) => {
  res.type("application/javascript");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.send(WIDGET_JS);
});

export default router;
