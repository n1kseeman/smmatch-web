import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { isTrustedRequestOrigin } from "./request";

describe("isTrustedRequestOrigin", () => {
  it("accepts a matching browser origin", () => {
    const request = new NextRequest("https://smmatch.test/auth/signout", {
      method: "POST",
      headers: { host: "smmatch.test", origin: "https://smmatch.test" },
    });

    expect(isTrustedRequestOrigin(request)).toBe(true);
  });

  it("rejects a cross-site origin", () => {
    const request = new NextRequest("https://smmatch.test/auth/signout", {
      method: "POST",
      headers: { host: "smmatch.test", origin: "https://attacker.test" },
    });

    expect(isTrustedRequestOrigin(request)).toBe(false);
  });

  it("accepts only same-origin fallback navigations without Origin", () => {
    const request = new NextRequest("https://smmatch.test/auth/signout", {
      method: "POST",
      headers: { host: "smmatch.test", "sec-fetch-site": "same-origin" },
    });
    const crossSiteRequest = new NextRequest(
      "https://smmatch.test/auth/signout",
      {
        method: "POST",
        headers: { host: "smmatch.test", "sec-fetch-site": "cross-site" },
      },
    );

    expect(isTrustedRequestOrigin(request)).toBe(true);
    expect(isTrustedRequestOrigin(crossSiteRequest)).toBe(false);
  });
});
