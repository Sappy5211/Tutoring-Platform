export const GRAMMAR_VERSION = "cbse-5-8-v1" as const;

export type MathToken =
  | { type: "digit"; value: string }
  | { type: "operator"; value: "+" | "-" | "=" | ":" | "%" | "." }
  | { type: "symbol"; value: "x" | "y" | "pi" | "degree" | "angle" }
  | { type: "command"; value: "sqrt" | "square" }
  | { type: "fraction"; numerator: string; denominator: string }
  | { type: "unit"; value: "cm" | "m" | "km" | "g" | "kg" | "l" | "ml" };

const unsafe = /[^0-9xy+\-=:.%/()\s\\a-z²°∠π]/i;
export function validateMathSource(source: string): { valid: boolean; message?: string } {
  if (source.length > 96) return { valid: false, message: "Keep the answer under 96 characters." };
  if (unsafe.test(source)) return { valid: false, message: "That symbol is not available for this question." };
  let depth = 0;
  for (const char of source) { if (char === "(") depth += 1; if (char === ")") depth -= 1; if (depth < 0) return { valid: false, message: "Check the brackets." }; }
  if (depth !== 0) return { valid: false, message: "Close the open bracket." };
  return { valid: true };
}

export function sourceToLatex(source: string): string {
  return source
    .replace(/π/g, "\\pi")
    .replace(/°/g, "^{\\circ}")
    .replace(/∠/g, "\\angle ")
    .replace(/sqrt\(([^()]*)\)/g, "\\sqrt{$1}")
    .replace(/([0-9xy)])²/g, "$1^{2}")
    .replace(/(-?[0-9xy.]+)\/(-?[0-9xy.]+)/g, "\\frac{$1}{$2}")
    .replace(/\*/g, "\\times ");
}

export function insertAt(source: string, insertion: string, start: number, end = start) {
  const next = source.slice(0, start) + insertion + source.slice(end);
  const placeholder = insertion.indexOf("□");
  return { source: next, caret: placeholder >= 0 ? start + placeholder : start + insertion.length };
}
