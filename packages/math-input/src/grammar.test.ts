import { describe, expect, it } from "vitest";
import { insertAt, sourceToLatex, validateMathSource } from "./grammar";

describe("CBSE 5–8 maths grammar", () => {
  it.each(["42", "-7", "3.75", "3/4", "2 1/3", "3:4", "25%", "2x+6", "3²", "sqrt(49)", "90°", "2.5 kg"])("accepts %s", (source) => expect(validateMathSource(source).valid).toBe(true));
  it("rejects unsupported markup", () => expect(validateMathSource("\\htmlClass{bad}{x}").valid).toBe(false));
  it("serializes supported structures", () => expect(sourceToLatex("3/4 + sqrt(49)")).toContain("\\frac{3}{4}"));
  it("inserts at the caret", () => expect(insertAt("26", ".", 1).source).toBe("2.6"));
});
