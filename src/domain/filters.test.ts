import { describe, expect, it } from "vitest";

import { parsePeriod, parseSegment } from "./filters";

describe("parsePeriod", () => {
  it("accepte 7, 30 ou 90", () => {
    expect(parsePeriod("7")).toBe(7);
    expect(parsePeriod("90")).toBe(90);
  });

  it("retombe sur 30 si absent ou invalide", () => {
    expect(parsePeriod(undefined)).toBe(30);
    expect(parsePeriod("42")).toBe(30);
    expect(parsePeriod("abc")).toBe(30);
  });

  it("prend la première valeur si le param est répété", () => {
    expect(parsePeriod(["7", "90"])).toBe(7);
  });
});

describe("parseSegment", () => {
  it("accepte un segment connu ou 'all'", () => {
    expect(parseSegment("enterprise")).toBe("enterprise");
    expect(parseSegment("all")).toBe("all");
  });

  it("retombe sur 'all' si absent ou invalide", () => {
    expect(parseSegment(undefined)).toBe("all");
    expect(parseSegment("bogus")).toBe("all");
  });
});
