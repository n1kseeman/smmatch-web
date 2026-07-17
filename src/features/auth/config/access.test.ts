import { describe, expect, it } from "vitest";

import { canAccessRoute, getRoleHome } from "./access";

describe("route access", () => {
  it("keeps public pages available to guests", () => {
    expect(canAccessRoute("guest", "/specialists")).toBe(true);
  });

  it("rejects guests and cross-role dashboard access", () => {
    expect(canAccessRoute("guest", "/dashboard/business")).toBe(false);
    expect(canAccessRoute("customer", "/dashboard/specialist")).toBe(false);
  });

  it("allows admins into every protected workspace", () => {
    expect(canAccessRoute("admin", "/dashboard/business/orders")).toBe(true);
    expect(canAccessRoute("admin", "/dashboard/specialist/finance")).toBe(true);
  });

  it("maps users to a stable home route", () => {
    expect(getRoleHome("customer")).toBe("/dashboard/business");
    expect(getRoleHome("freelancer")).toBe("/dashboard/specialist");
    expect(getRoleHome("admin")).toBe("/admin");
  });
});
