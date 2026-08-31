import { Eraser, Pen, Redo2, Trash2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

interface Point { x: number; y: number; pressure: number }
interface Stroke { points: Point[]; colour: string; width: number; erase: boolean }

const COLOURS = ["ink", "primary", "accent", "danger"] as const;

/** Real stylus input, not a placeholder: pointer events carry `pressure` from a
 *  pen and `pointerType` tells us pen from finger. Coalesced events matter on
 *  high-rate styluses - without them fast strokes come out as polygons. */
export function HandwritingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [undone, setUndone] = useState<Stroke[]>([]);
  const [colour, setColour] = useState<string>("ink");
  const [erasing, setErasing] = useState(false);
  const drawing = useRef<Stroke | null>(null);

  const cssVar = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim() || "#222";

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const all = drawing.current ? [...strokes, drawing.current] : strokes;
    for (const stroke of all) {
      if (stroke.points.length < 2) continue;
      ctx.globalCompositeOperation = stroke.erase ? "destination-out" : "source-over";
      ctx.strokeStyle = stroke.erase ? "#000" : cssVar(stroke.colour);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 1; i < stroke.points.length; i += 1) {
        const a = stroke.points[i - 1]!;
        const b = stroke.points[i]!;
        // Width tracks pressure, which is what makes pen strokes look like ink
        // rather than a constant-width marker.
        ctx.lineWidth = stroke.width * (0.35 + b.pressure * 1.3);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = "source-over";
  }, [strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.getContext("2d")?.scale(dpr, dpr);
      redraw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]);

  useEffect(redraw, [redraw]);

  /** Takes the rect from the canvas ref, not from `currentTarget`: coalesced
   *  events have a null currentTarget, so reading it there silently loses every
   *  intermediate sample. */
  const pointFrom = (e: { clientX: number; clientY: number; pressure: number; pointerType: string }): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
      // A finger or mouse reports pressure 0 or 0.5; only a pen varies it.
      pressure: e.pointerType === "pen" && e.pressure > 0 ? e.pressure : 0.5,
    };
  };

  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = {
      points: [pointFrom(event)],
      colour, width: erasing ? 18 : 3, erase: erasing,
    };
  };

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const native = event.nativeEvent as unknown as {
      getCoalescedEvents?: () => Array<{ clientX: number; clientY: number; pressure: number; pointerType: string }>;
    };
    // getCoalescedEvents returns an EMPTY array for untrusted (dispatched)
    // events and in some browsers generally - so an empty result must fall back
    // to the event itself, or the stroke records no points at all.
    const coalesced = native.getCoalescedEvents?.() ?? [];
    const samples = coalesced.length > 0 ? coalesced : [event];
    for (const sample of samples) drawing.current.points.push(pointFrom(sample));
    redraw();
  };

  const end = () => {
    if (drawing.current && drawing.current.points.length > 1) {
      setStrokes((prev) => [...prev, drawing.current!]);
      setUndone([]);
    }
    drawing.current = null;
    redraw();
  };

  const undo = () => setStrokes((prev) => {
    if (!prev.length) return prev;
    const last = prev[prev.length - 1]!;
    setUndone((u) => [...u, last]);
    return prev.slice(0, -1);
  });
  const redo = () => setUndone((prev) => {
    if (!prev.length) return prev;
    const last = prev[prev.length - 1]!;
    setStrokes((s) => [...s, last]);
    return prev.slice(0, -1);
  });

  return (
    <div className="hw">
      <div className="hw__tools" role="toolbar" aria-label="Handwriting tools">
        <button className={!erasing ? "is-active" : ""} onClick={() => setErasing(false)} aria-pressed={!erasing}>
          <Pen size={16} aria-hidden /> Pen
        </button>
        <button className={erasing ? "is-active" : ""} onClick={() => setErasing(true)} aria-pressed={erasing}>
          <Eraser size={16} aria-hidden /> Erase
        </button>
        <span className="hw__swatches">
          {COLOURS.map((c) => (
            <button
              key={c}
              className={`hw__swatch hw__swatch--${c}${colour === c && !erasing ? " is-active" : ""}`}
              onClick={() => { setColour(c); setErasing(false); }}
              aria-label={`${c} ink`}
              aria-pressed={colour === c && !erasing}
            />
          ))}
        </span>
        <button onClick={undo} disabled={!strokes.length} aria-label="Undo stroke"><Undo2 size={16} /></button>
        <button onClick={redo} disabled={!undone.length} aria-label="Redo stroke"><Redo2 size={16} /></button>
        <button onClick={() => { setStrokes([]); setUndone([]); }} disabled={!strokes.length} aria-label="Clear page">
          <Trash2 size={16} />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="hw__canvas"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        // Without this the browser scrolls the page instead of drawing on touch.
        style={{ touchAction: "none" }}
        aria-label="Handwriting area"
      />
      <p className="hw__hint">
        Write with a stylus or finger. Pen pressure changes stroke weight.
        You can still add a card here — draw the question, then use the arrow button on the page.
      </p>
    </div>
  );
}
