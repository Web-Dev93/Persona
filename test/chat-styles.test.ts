import { test, describe } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

import {
  CHAT_STYLES,
  CHAT_STYLES_LIST,
  generateEmbedScript,
  getStyleConfig,
} from "../artifacts/lead-catcher/src/lib/chat-styles";

describe("generateEmbedScript", () => {
  // Regression: the studio passed a style id where an options object was
  // expected, and reading options.welcomeText.replace threw, blanking the page.
  test("accepts a bare style id instead of an options object", () => {
    const snippet = generateEmbedScript("ania", "whatsapp");
    assert.match(snippet, /theme: "whatsapp"/);
    assert.match(snippet, /personaSlug: "ania"/);
    assert.match(snippet, /widget\.js/);
  });

  test("works with no second argument at all", () => {
    assert.match(generateEmbedScript("ania"), /personaSlug: "ania"/);
  });

  test("fills accent colour and welcome text from the theme", () => {
    const snippet = generateEmbedScript("tomek", { theme: "telegram" });
    assert.match(snippet, new RegExp(`accentColor: "${CHAT_STYLES.telegram.accentColor}"`));
    assert.ok(snippet.includes(CHAT_STYLES.telegram.sampleGreeting));
  });

  test("explicit options win over theme defaults", () => {
    const snippet = generateEmbedScript("x", {
      personaSlug: "kasia",
      theme: "whatsapp",
      accentColor: "#123456",
      welcomeText: "Cześć!",
      position: "left",
    });
    assert.match(snippet, /personaSlug: "kasia"/);
    assert.match(snippet, /accentColor: "#123456"/);
    assert.match(snippet, /position: "left"/);
  });

  test("stays parseable JavaScript when values contain quotes or backslashes", () => {
    const welcomeText = 'Powiedz "cześć" \\ i kliknij';
    const snippet = generateEmbedScript('per"sona\\', { welcomeText, theme: "whatsapp" });

    // Run the generated inline script for real: if escaping is wrong, the
    // snippet a client pastes into their page is a syntax error.
    const inline = snippet.slice(snippet.indexOf("<script>") + 8, snippet.indexOf("</script>"));
    const sandbox: { window: Record<string, any> } = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(inline, sandbox);

    const cfg = sandbox.window.LeadTrapConfig;
    assert.equal(cfg.welcomeText, welcomeText);
    assert.equal(cfg.personaSlug, 'per"sona\\');
    assert.equal(cfg.theme, "whatsapp");
  });

  test("an unpublished advisor still yields a snippet", () => {
    assert.match(generateEmbedScript("", {}), /personaSlug: ""/);
  });
});

describe("style resolution", () => {
  test("an unknown or empty id falls back to whatsapp", () => {
    assert.equal(getStyleConfig("zupelnie-nieznany").id, "whatsapp");
    assert.equal(getStyleConfig(null).id, "whatsapp");
    assert.equal(getStyleConfig(undefined).id, "whatsapp");
  });

  test("a known id returns its own style", () => {
    assert.equal(getStyleConfig("telegram").id, "telegram");
    assert.equal(getStyleConfig("corporate_dark").id, "corporate_dark");
  });

  test("every style carries the fields the chat UI reads", () => {
    for (const style of CHAT_STYLES_LIST) {
      for (const field of ["sampleGreeting", "headerBg", "headerText", "botText", "accentColor"] as const) {
        assert.ok(style[field], `${style.id} is missing ${field}`);
      }
    }
  });

  test("a style's key matches its own id", () => {
    for (const [key, style] of Object.entries(CHAT_STYLES)) assert.equal(key, style.id);
  });
});
