import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { STITCH_MATERIALS } from "./data";

export function MaterialPage() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const index = STITCH_MATERIALS.findIndex((item) => item.id === materialId);

  if (index < 0) return <Navigate to="/app/notebook" replace />;

  const material = STITCH_MATERIALS[index]!;
  const previous = STITCH_MATERIALS[index - 1];
  const next = STITCH_MATERIALS[index + 1];

  const wireLesson = useCallback((frame: HTMLIFrameElement) => {
    const document = frame.contentDocument;
    if (!document) return;

    const goBack = () => navigate(previous ? `/app/materials/${previous.id}` : "/app/notebook");
    const goForward = () => navigate(next ? `/app/materials/${next.id}` : "/app/flashcards");

    const showAnswerFeedback = () => {
      const inputs = [...document.querySelectorAll<HTMLInputElement>('input[type="text"]')];
      if (inputs.length < 2) return;

      const commaAnswer = inputs[0]!.value.trim();
      const wordsAnswer = inputs[1]!.value
        .toLowerCase()
        .replace(/[–—-]/g, " ")
        .replace(/[^a-z\s]/g, " ")
        .replace(/\band\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const results = [
        /^67\s*,\s*492$/.test(commaAnswer) || /after\s+67/i.test(commaAnswer),
        wordsAnswer === "twelve thousand five hundred four",
      ];

      inputs.forEach((input, answerIndex) => {
        const correct = results[answerIndex];
        input.setAttribute("aria-invalid", correct ? "false" : "true");
        input.style.borderColor = correct ? "#15803d" : "#ba1a1a";
        input.style.backgroundColor = correct ? "#f0fdf4" : "#fff1f2";
      });

      let feedback = document.querySelector<HTMLElement>("[data-vidya-answer-feedback]");
      if (!feedback) {
        feedback = document.createElement("p");
        feedback.dataset.vidyaAnswerFeedback = "true";
        feedback.setAttribute("role", "status");
        feedback.style.margin = "16px 0 0";
        feedback.style.padding = "12px 16px";
        feedback.style.borderRadius = "12px";
        feedback.style.fontWeight = "700";
        document.querySelector("main")?.append(feedback);
      }
      const allCorrect = results.every(Boolean);
      feedback.textContent = allCorrect
        ? "Both answers are correct — excellent work!"
        : "Not quite yet. Check the highlighted answer and try again.";
      feedback.style.color = allCorrect ? "#166534" : "#991b1b";
      feedback.style.background = allCorrect ? "#dcfce7" : "#ffe4e6";
      if (!allCorrect) inputs[results.findIndex((result) => !result)]?.focus();
    };

    document.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
      if (button.dataset.vidyaWired) return;
      button.dataset.vidyaWired = "true";
      const label = button.textContent?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";

      if (label.includes("account_circle")) {
        button.setAttribute("aria-label", "Open settings");
        button.addEventListener("click", () => navigate("/app/settings"));
      } else if (label.includes("check answers")) {
        button.addEventListener("click", showAnswerFeedback);
      } else if (
        label.includes("next concept") ||
        label === "finish" ||
        label.includes("finish chapter")
      ) {
        button.addEventListener("click", goForward);
      } else if (
        label.includes("arrow_back") ||
        label.includes("chevron_left") ||
        label === "back" ||
        label.includes("previous lesson")
      ) {
        button.setAttribute("aria-label", previous ? `Back to ${previous.title}` : "Back to materials");
        button.addEventListener("click", goBack);
      }
    });

    document.querySelectorAll<HTMLInputElement>('input[type="text"]').forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") showAnswerFeedback();
      });
    });
  }, [navigate, next, previous]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let retry: number | undefined;

    const connect = () => {
      const document = frame.contentDocument;
      if (document?.querySelector("button")) {
        wireLesson(frame);
      } else {
        retry = window.setTimeout(connect, 50);
      }
    };

    frame.addEventListener("load", connect);
    connect();
    return () => {
      frame.removeEventListener("load", connect);
      if (retry) window.clearTimeout(retry);
    };
  }, [material.source, wireLesson]);

  return (
    <div className="stitch-material">
      <header className="stitch-material__bar">
        <Link to="/app/notebook" className="stitch-material__back">
          <ArrowLeft aria-hidden /> Materials
        </Link>
        <div>
          <strong>{material.title}</strong>
          <span>Large Numbers and Place Value · Class 5 Mathematics · {index + 1} of {STITCH_MATERIALS.length}</span>
        </div>
        <nav aria-label="Lesson navigation">
          {previous ? (
            <Link to={`/app/materials/${previous.id}`} aria-label={`Previous: ${previous.title}`}>
              <ArrowLeft aria-hidden />
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/app/materials/${next.id}`} aria-label={`Next: ${next.title}`}>
              <ArrowRight aria-hidden />
            </Link>
          ) : (
            <Link to="/app/flashcards" aria-label="Review chapter flashcards">
              <ArrowRight aria-hidden />
            </Link>
          )}
          <a href={material.source} target="_blank" rel="noreferrer" aria-label="Open original Stitch page in a new tab">
            <ExternalLink aria-hidden />
          </a>
        </nav>
      </header>
      <iframe
        ref={frameRef}
        className="stitch-material__frame"
        src={material.source}
        title={`${material.title} — original Google Stitch lesson`}
      />
    </div>
  );
}
