import { readUnverifiedSessionToken } from "../session.edge";

describe("readUnverifiedSessionToken", () => {
  it("returns null for undefined token", () => {
    expect(readUnverifiedSessionToken(undefined)).toBeNull();
  });

  it("returns null for empty token", () => {
    expect(readUnverifiedSessionToken("")).toBeNull();
  });

  it("returns null for invalid base64", () => {
    expect(readUnverifiedSessionToken("invalid")).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    const invalidPayload = btoa("invalid json");
    expect(readUnverifiedSessionToken(`${invalidPayload}.signature`)).toBeNull();
  });

  it("returns null for expired token", () => {
    const expiredPayload = { user: { id: "1", email: "test@example.com" }, exp: Math.floor(Date.now() / 1000) - 100 };
    const encodedPayload = btoa(JSON.stringify(expiredPayload));
    expect(readUnverifiedSessionToken(`${encodedPayload}.signature`)).toBeNull();
  });

  it("returns payload for valid token", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = { user: { id: "1", email: "test@example.com" }, exp: futureExp };
    const encodedPayload = btoa(JSON.stringify(payload));
    const result = readUnverifiedSessionToken(`${encodedPayload}.signature`);
    expect(result).toEqual(payload);
  });
});