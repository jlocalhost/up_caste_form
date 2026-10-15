import { describe, expect, it } from "vitest";
import { cleanName, formatPhone, isValidName, isValidPhone, normalizePhone } from "./submitter";

describe("normalizePhone", () => {
  it.each([
    ["98765 43210", "9876543210"],
    ["+91 98765-43210", "9876543210"],
    ["919876543210", "9876543210"],
    ["09876543210", "9876543210"],
    ["9123456789", "9123456789"],
    ["98765432109", "9876543210"],
    ["abc", ""],
  ])("%s → %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it("keeps a number intact while it is typed digit by digit, even with a +91 prefix", () => {
    let value = "";
    for (const key of "+919876543210") value = normalizePhone(value + key);
    expect(value).toBe("9876543210");
  });
});

describe("isValidPhone", () => {
  it("accepts 10-digit Indian mobiles starting with 6–9", () => {
    expect(isValidPhone("9876543210")).toBe(true);
    expect(isValidPhone("6000000000")).toBe(true);
  });

  it.each(["5876543210", "987654321", "98765432100", "", "98765 43210"])("rejects %s", (phone) => {
    expect(isValidPhone(phone)).toBe(false);
  });
});

describe("isValidName", () => {
  it.each(["राम कुमार", "Ram Kumar", "श्री. मोहन", "O'Neil", "अ ब"])("accepts %s", (name) => {
    expect(isValidName(name)).toBe(true);
  });

  it.each(["", " ", "र", "Ram123", "9876543210", "-राम", "क".repeat(61)])("rejects %s", (name) => {
    expect(isValidName(name)).toBe(false);
  });

  it("collapses extra spaces before checking", () => {
    expect(cleanName("  राम   कुमार ")).toBe("राम कुमार");
  });
});

describe("formatPhone", () => {
  it("groups 5+5 digits", () => {
    expect(formatPhone("9876543210")).toBe("98765 43210");
  });
});
