import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { extractContactInfo } from "../artifacts/api-server/src/lib/lead-intelligence";

describe("extractContactInfo", () => {
  test("reads a full contact out of one message", () => {
    const info = extractContactInfo([
      "Dzien dobry, nazywam sie Krzysztof Nowak, prowadze firme Kowalski Meble. Telefon 501 602 703, mail krzysztof@example.com",
    ]);
    assert.equal(info.name, "Krzysztof Nowak");
    assert.equal(info.email, "krzysztof@example.com");
    assert.equal(info.phone, "501602703");
    assert.equal(info.company, "Kowalski Meble");
  });

  test("accepts a sentence-initial trigger and a legal form in the company name", () => {
    const info = extractContactInfo(["Cześć! Mam na imię Anna Wiśniewska. Reprezentuję firmę Alfa Serwis sp. z o.o."]);
    assert.equal(info.name, "Anna Wiśniewska");
    assert.match(info.company ?? "", /^Alfa Serwis sp\. z o\.o/);
  });

  test("keeps the +48 prefix and strips separators", () => {
    assert.equal(extractContactInfo(["Proszę o kontakt: +48 601-234-567"]).phone, "+48601234567");
    assert.equal(extractContactInfo(["tel. 22 505 12 34"]).phone, "225051234");
  });

  test("a company name stops at the sentence boundary", () => {
    const info = extractContactInfo(["Prowadzę firmę Kowalski Meble. Mój telefon to 501 602 703."]);
    assert.equal(info.company, "Kowalski Meble");
  });

  describe("does not invent a phone number", () => {
    // Regression: a nine-digit window used to be carved out of any longer run of
    // digits, so upload timestamps were captured as phone numbers.
    const notPhones = [
      ["upload URL", "[Załącznik] brief.txt — /api/static/uploads/lead-1787341316667-9edav2.txt"],
      ["order number", "Numer zamówienia 1787341316667"],
      ["price and year", "Zamówienie 2024 na kwotę 120000 zł"],
      ["e-mail digits", "kontakt: biuro123456789@example.com"],
    ];
    for (const [label, text] of notPhones) {
      test(label, () => assert.equal(extractContactInfo([text]).phone, null));
    }
  });

  test("returns nulls for a message with no contact details", () => {
    assert.deepEqual(extractContactInfo(["Dzień dobry, chciałbym poznać ofertę."]), {
      name: null,
      email: null,
      phone: null,
      company: null,
    });
  });

  test("scans every message in the conversation", () => {
    const info = extractContactInfo(["Dzień dobry.", "Interesuje mnie kuchnia.", "Mój mail to a.b@firma.pl"]);
    assert.equal(info.email, "a.b@firma.pl");
  });
});
