import { useMemo, useRef, useState } from "react";
import katex from "katex";
import { GRAMMAR_VERSION, insertAt, sourceToLatex, validateMathSource } from "./grammar";
export { GRAMMAR_VERSION, insertAt, sourceToLatex, validateMathSource } from "./grammar";

const layers = {
  Main: ["7", "8", "9", "4", "5", "6", "1", "2", "3", "−", "0", ".", "+", "=", "fraction", "⌫"],
  ABC: ["x", "y", "(", ")", "−", "+", "=", ":", "%", "space"],
  Functions: ["square", "sqrt", "fraction", "(", ")", "×"],
  Symbols: ["π", "°", "∠", "cm", "m", "km", "g", "kg", "l", "ml"]
} as const;
type Layer = keyof typeof layers;

function insertionFor(key: string) {
  if (key === "fraction") return "□/□";
  if (key === "square") return "²";
  if (key === "sqrt") return "sqrt(□)";
  if (key === "space") return " ";
  if (key === "−") return "-";
  if (key === "×") return "*";
  return key;
}

export function MathInput({ value, onChange, staticPrefix, disabled = false }: { value: string; onChange: (value: string) => void; staticPrefix?: string; disabled?: boolean }) {
  const [layer, setLayer] = useState<Layer>("Main");
  const inputRef = useRef<HTMLInputElement>(null);
  const result = validateMathSource(value);
  const html = useMemo(() => {
    try { return katex.renderToString(sourceToLatex(value || "\\square"), { throwOnError: false, output: "html" }); }
    catch { return ""; }
  }, [value]);
  const press = (key: string) => {
    const input = inputRef.current;
    if (key === "⌫") {
      const start = input?.selectionStart ?? value.length;
      if (start > 0) onChange(value.slice(0, start - 1) + value.slice(input?.selectionEnd ?? start));
      requestAnimationFrame(() => input?.focus());
      return;
    }
    const selectionStart = input?.selectionStart ?? value.length;
    const selectionEnd = input?.selectionEnd ?? selectionStart;
    const inserted = insertAt(value, insertionFor(key), selectionStart, selectionEnd);
    onChange(inserted.source.replace("□", ""));
    requestAnimationFrame(() => { input?.focus(); input?.setSelectionRange(inserted.caret, inserted.caret); });
  };
  return <div className="math-input" data-grammar={GRAMMAR_VERSION}>
    <div className={`math-input__field ${result.valid ? "" : "is-invalid"}`}>
      {staticPrefix && <span className="math-input__prefix" dangerouslySetInnerHTML={{ __html: katex.renderToString(staticPrefix, { throwOnError: false }) }} />}
      <input ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} aria-label="Your mathematical answer" autoComplete="off" spellCheck={false} inputMode="text" />
      <div className="math-input__preview" aria-live="polite" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
    {!result.valid && <p className="math-input__error" role="alert">{result.message}</p>}
    <div className="math-keyboard" aria-label="Maths keyboard">
      <div className="math-keyboard__tabs" role="tablist">{(Object.keys(layers) as Layer[]).map((name) => <button role="tab" aria-selected={layer === name} key={name} onClick={() => setLayer(name)}>{name}</button>)}</div>
      <div className="math-keyboard__keys">{layers[layer].map((key) => <button type="button" key={key} onClick={() => press(key)} aria-label={key === "fraction" ? "Insert fraction" : key === "square" ? "Square" : key === "sqrt" ? "Square root" : key === "⌫" ? "Delete" : key}>{key === "fraction" ? "a⁄b" : key === "square" ? "x²" : key === "sqrt" ? "√" : key}</button>)}</div>
    </div>
  </div>;
}
