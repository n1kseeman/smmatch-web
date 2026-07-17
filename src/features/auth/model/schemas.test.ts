import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./schemas";

describe("auth validation", () => {
  it("rejects malformed login values", () => {
    expect(
      loginSchema.safeParse({ email: "invalid", password: "short" }).success,
    ).toBe(false);
  });

  it("accepts a strong customer registration", () => {
    expect(
      registerSchema.safeParse({
        displayName: "Анна",
        email: "anna@example.com",
        role: "customer",
        password: "Securepass1",
        confirmPassword: "Securepass1",
        terms: true,
      }).success,
    ).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      displayName: "Анна",
      email: "anna@example.com",
      role: "freelancer",
      password: "Securepass1",
      confirmPassword: "Different2",
      terms: true,
    });
    expect(result.success).toBe(false);
  });
});
