# Lane H — Voice Input, Dictation, and Speech-to-Notes

Status: DONE_WITH_CONCERNS (see "Could not verify" and confidence column in the decision table — ASR accuracy evidence for this exact use case is thin and partly contradictory; that is reported honestly rather than smoothed over).

Owner: Lane H. Single output file, per mission brief. Evidence grades used throughout: **[observed]** = read directly in a primary source or ran myself, **[inferred]** = follows from observed facts, **[assumed]** = imported belief, flagged for verification. All external claims carry a source and a "checked" date (2026-08-30/31).

---

## 0. Verdict summary — read this first

The operator asked for "another feature like Wispr Flow." That request bundles three genuinely different things. They get three different verdicts:

| Feature | What it is | Verdict | Why |
|---|---|---|---|
| **(a) Dictation** (Wispr Flow's actual feature) — speech becomes clean text at the cursor, live, in the editor | **v1 — but scoped to the operator/author console first, student editor second.** | This is what was actually asked for. It is cheap (~$5–$400/month across the whole cost curve, see Section 1), technically well-understood, and — per Section 5 — worth more as a content-production tool for the operator converting teaching material than as a headline student feature. Ship it in the author console at launch; ship a scoped-down student version (notes editor only, not the primary input path) shortly after. |
| **(b) Lecture/session recording** (RemNote's "Record Lecture") | **Reject for v1.** | This is the feature RemNote already owns and badges `[Pro]` — see `corpus/remnote-ui-screenshots.md` §3, §6. Copying it adds transcription-pipeline cost and complexity (long-form audio, diarization, summarisation) for a feature that isn't differentiating and isn't what the operator described. If the operator has pre-recorded lecture video/audio to convert into notes, that's an **ingest** problem for Lane F's content pipeline, not a live "record" button in the student UI. Revisit in v2 only if the operator's own authoring workflow needs it (see Section 5).
| **(c) Voice as conversational input** — speaking to the AI tutor, or speaking an answer to a practice question | **Split verdict: tutor voice input = v2 (deferred, low priority); spoken practice answers = reject for v1.** | Typing a question to the tutor already works and is the lower-risk path; voice adds ASR cost and error surface for a marginal UX gain in a text-first chat product. Spoken practice answers require grading of formulas from raw audio, which compounds the two hardest open problems in this mission (Lane D's answer-equivalence grading, and this lane's maths-dictation-to-LaTeX problem) for a feature nobody asked for. Do not build it in v1. |

**The single most important call in this lane:** voice is being pitched as a student feature, but the stronger business case is the **operator's own content-production bottleneck**. The operator has to convert a large body of existing teaching material into structured notes. A fast, accurate dictation tool in the *author* console — not the student console — is where this feature pays for itself fastest. See Section 5 for the full argument.

---

## 1. ASR engine selection

### 1.1 What "Indian speech" actually means for this product

The target utterance in the brief — *"toh basically x squared ka value nikalna hai"* — is Hindi-medium discourse with embedded English mathematical vocabulary. This is **intra-sentential code-switching**, not accented English. That distinction matters because most vendor marketing tests "Indian English accent" (an Indian speaker reading English text) — a different and easier problem than transcribing a sentence that switches script and language mid-clause. Evidence below is flagged by which of the two it actually measures.

### 1.2 Independent evidence found (not vendor claims)

- **Vistaar benchmark** (AI4Bharat/Interspeech 2023, arXiv:2305.15386) **[observed]** — 59 benchmarks across 12 Indian languages built from Kathbath, FLEURS, Common Voice, IndicTTS, MUCS, GramVaani. `IndicWhisper` (Whisper fine-tuned on Vistaar's 10,700-hour training set) has the lowest WER on 39 of 59 benchmarks, averaging 4.1 WER points better than the baseline. This is a real, methodologically documented improvement over vanilla Whisper for **monolingual Indian-language and Indian-English audio** — but it predates the current generation of commercial models (Sarvam, Deepgram Nova-3, Gemini) and does not test code-switching directly.
- **VAANI Benchmark V1.0** (arXiv:2606.21408, Hindi-focused, CC-BY-4.0, independent academic) **[observed]** — compares Whisper, Sarvam Saarika v2.5, Google Chirp, Azure Speech, GPT-4o Transcribe, Gemini 3 Flash, IndicConformer-600M, IITM ASR, Hindi Wav2Vec2, Pingala v1, Omnilingual ASR, and Voxtral head-to-head on Hindi. On the WER metric, **Google Speech-to-Text scored lowest (16.2%) for Hindi**, with **Sarvam showing an unusually high insertion rate (39.15% Hindi, 36.87% English)** — i.e. Sarvam was *not* the most accurate on a strict WER read. **Caveat that matters for us [observed, same source]:** Sarvam (and ElevenLabs Scribe) keep English loanwords and numerals in Latin script/digits, while the reference transcripts are pure Devanagari — so a "translit-blind" WER penalises Sarvam once per loanword/number it correctly *doesn't* force into Devanagari. For a Hinglish EdTech product where we actually *want* "x squared" rendered as English, not transliterated Devanagari, this scoring artifact cuts against the benchmark's verdict in our specific favour — but it means **the published WER number is not a trustworthy ranking for our use case**, and this needs an in-house A/B test on our own sample utterances before launch, not a benchmark-table decision.
- **"The TTS–STT Flywheel" paper** (arXiv:2605.03073) **[observed]** — tests vanilla Whisper-large-v3, an IndicWhisper variant (`vasista22`), and Deepgram Nova-3 on **entity-dense** Indic audio (addresses, currency, brand names, code-mixed spans). Finding that matters most for us: **both the open-source Indic-tuned model and the commercial model fail badly on named entities and code-mixed spans** — `vasista22` scored an Entity-Hit-Rate of 0.027 on Telugu entity-dense audio; Deepgram Nova-3 (the better of the two) scored 0.16 — an order of magnitude better but still poor in absolute terms. On script fidelity specifically for **Hindi and Tamil**, vanilla Whisper-large-v3 already hit ≥0.98 (i.e., it reliably renders the correct script; the Telugu-specific script collapse into Kannada/Devanagari does not generalise to Hindi). Deepgram showed non-trivial script-fidelity loss (0.83–0.87) on Hindi holdouts — meaning it sometimes drops into Latin transliteration where it shouldn't.
- **Net read of the independent evidence:** there is no clean "Provider X wins on Indic" result. Whisper-family models (including IndicWhisper) are solid on plain Hindi/Tamil script rendering but bad at proper nouns and dense entities; commercial models (Deepgram, Google) are somewhat better at entities but still weak; Sarvam's apparent underperformance on the one head-to-head benchmark is confounded by a scoring artifact that may not apply to us. **This is a "pilot before you commit" situation, not a "the leaderboard says X" situation.**

### 1.3 Vendor claims (marked as such — not independently verified)

- Sarvam AI markets Saaras v3 as "state-of-the-art ASR" with dedicated `codemix` output mode built for exactly the Hindi-English switching case **[vendor claim]** (sarvam.ai, checked 2026-08-30).
- ElevenLabs claims Scribe v2 hits 96.7% accuracy for English, 98.7% for Italian, and beats Gemini 2.0 Flash, Whisper v3, and Deepgram Nova-3 on its own benchmark **[vendor claim]** (VentureBeat coverage of ElevenLabs' own announcement, checked 2026-08-30). No Hindi/Hinglish number was found in this claim.
- Gnani.ai claims a "Vachana STT" foundational Indic model trained on 1M hours under the IndiaAI Mission, and serves large Indian enterprise clients (HDFC Bank, Airtel, Tata Motors) **[vendor claim + third-party client list, not independently audited accuracy]** (gnani.ai, checked 2026-08-30). Pricing is enterprise-only/custom — no public rate card was found, which itself rules it out for a bootstrapped build regardless of accuracy.
- Reverie Language Technologies offers a Speech-to-Text API with a 10-free-hour trial; no public per-minute/hour rate for STT was found (only its TTS rate, ₹500/million characters) **[vendor claim, pricing incomplete]** (reverieinc.com, checked 2026-08-30). Treat as untested until a quote is obtained.

### 1.4 Provider comparison table

All rates checked 2026-08-30/31. USD↔INR at ₹96/$ (observed spot rate ₹95.7 on 2026-08-30, rounded for a stable script — see Section 1.5).

| Provider / model | Price (checked 2026-08-30) | Streaming? | Indic evidence | Data residency | Custom vocab |
|---|---|---|---|---|---|
| **Sarvam Saarika/Saaras** | ₹30/hr (~$0.31/hr, $0.0052/min) flat; +₹15/hr for diarization | Yes — REST (<30s), Batch (≤2hr), and true Streaming API | Purpose-built for Hindi-English codemix; independent benchmark shows high insertion rate but with a scoring artifact that likely doesn't apply to our use case (§1.2) | **India-hosted** (Indian company) — best DPDP fit found | Not documented publicly; ask before committing |
| **OpenAI Whisper-1 / gpt-4o-transcribe** | $0.006/min ($0.36/hr) | No true streaming on the classic endpoint; a separate `gpt-realtime` streaming tier exists at ~$0.017/min | Vanilla Whisper-large-v3 scores well on Hindi/Tamil script fidelity (≥0.98 SFR) but poorly on entity-dense/code-mixed spans (§1.2) | US (OpenAI); **not India-resident** — DPDP cross-border transfer implications, see Section 7 | `prompt` parameter biases vocabulary (~224 token context) but is not true boosting |
| **OpenAI gpt-4o-mini-transcribe** | $0.003/min ($0.18/hr) — cheapest OpenAI tier | No | Same model family caveats as above, cheaper/lower-fidelity variant | Same as above | Same as above |
| **AI4Bharat IndicWhisper / IndicConformer** | **Free, MIT-licensed weights** — no hosted API exists; self-host only via NeMo | Self-managed | Best-documented open Indic-tuned WER improvement (Vistaar, §1.2), but that benchmark predates current commercial models and doesn't test code-switching | **Fully on-device/self-hosted** — best possible DPDP posture, zero third-party audio transfer | Fine-tunable, but requires ML engineering capacity this team does not have per the brief's constraints |
| **Deepgram Nova-3** | $0.0043/min batch (English), $0.0077/min streaming, $0.0052/min multilingual (needed for Hindi code-switch) | Yes, real streaming, low latency (this is Deepgram's core strength) | Handles Hindi in its 10-language multilingual code-switch mode; entity-dense benchmark (§1.2) shows real but limited improvement over open Indic models | US (Deepgram) | Self-serve keyword boosting + custom vocabulary out of the box — best-documented customization story of any provider checked |
| **AssemblyAI Universal-2** | $0.15/hr async | **No Hindi in real-time streaming** (streaming multilingual = EN/ES/FR/DE/IT/PT only) — Hindi only on pre-recorded/async | Not benchmarked in any source found | US | `word_boost` array, `boost_param` low/default/high |
| **ElevenLabs Scribe v2** | $0.22/hr batch, $0.39/hr realtime (+$0.05/hr for keyterm prompting) | Yes | Vendor claims 99-language support incl. gains on low-resource languages; no independent Hindi number found; flagged Devanagari-scoring caveat above cuts both ways | US | Keyterm prompting (paid add-on) |
| **Google Cloud STT v2 (Chirp)** | $0.016/min realtime, ~$0.003/min "Dynamic Batch" (24h turnaround) | Yes (realtime tier) | **Best independent Hindi WER found (16.2%) in the VAANI benchmark** — the one clear empirical win in this table | US/global GCP regions; India region (`asia-south1`) selectable for storage, but check processing-region guarantees before relying on it for DPDP | Phrase hints / speech adaptation |
| **Azure AI Speech** | $1.00/hr realtime standard, $0.18/hr batch; commitment tiers to $0.50/hr at 50k hrs/month | Yes | No independent Hindi number found in this pass; Azure "Chirp"-equivalent India accent support claimed by vendor, not verified | India region (`centralindia`) available — check data-processing (not just storage) locality | Custom Speech model training (higher cost tier) |
| **Web Speech API (browser-native)** | Free | Yes (interim + final results) | Not benchmarked independently; expected to be materially worse on Hinglish based on general architecture (consumer dictation model, not tuned for code-switching) | **Chrome/Edge send raw audio to Google's servers**; Safari sends to Apple's; **on-device only on Safari with the language pack installed** [observed, MDN/WebKit sources] | None |

### 1.5 Cost script (100 / 1,000 / 10,000 active students)

Computed with a Python script, not mental arithmetic — full script and output below. **Usage assumptions stated explicitly** because they are the actual lever on cost, not the provider choice:

```python
# Usage assumptions (student-side optional dictation feature):
pct_students_using_voice = 0.20      # dictation is opt-in, not the primary input path (Section 6: noisy homes)
minutes_per_voice_session = 1.5      # a typical "dictate this note" burst
sessions_per_active_day = 2
active_days_per_month = 12           # secondary feature, not a daily habit like flashcards
# -> 36 minutes/month per voice-using student

# Operator/author-side (fixed, independent of student count — see Section 5):
operator_dictation_minutes_per_month = 20 * 60   # 20 hours/month of active authoring dictation

USD_INR = 96.0   # spot rate 2026-08-30 was 95.7; rounded for a stable script
```

Monthly ASR cost at each scale (operator's 20 hr/month is included in every row — it does not scale with student count):

| Provider | 100 students | 1,000 students | 10,000 students |
|---|---|---|---|
| **Sarvam Saarika (recommended primary)** | $10.00 / ₹960 | $43.75 / ₹4,200 | $381.25 / ₹36,600 |
| OpenAI gpt-4o-mini-transcribe | $5.76 / ₹553 | $25.20 / ₹2,419 | $219.60 / ₹21,082 |
| OpenAI gpt-4o-transcribe (recommended fallback) | $11.52 / ₹1,106 | $50.40 / ₹4,838 | $439.20 / ₹42,163 |
| Deepgram Nova-3 (multilingual) | $9.98 / ₹958 | $43.68 / ₹4,193 | $380.64 / ₹36,541 |
| AssemblyAI Universal-2 | $4.80 / ₹461 | $21.00 / ₹2,016 | $183.00 / ₹17,568 |
| ElevenLabs Scribe (batch) | $7.04 / ₹676 | $30.80 / ₹2,957 | $268.40 / ₹25,766 |
| Google Cloud STT (dynamic batch) | $5.76 / ₹553 | $25.20 / ₹2,419 | $219.60 / ₹21,082 |
| Google Cloud STT (realtime) | $30.72 / ₹2,949 | $134.40 / ₹12,902 | $1,171.20 / ₹112,435 |
| Azure (batch) | $5.76 / ₹553 | $25.20 / ₹2,419 | $219.60 / ₹21,082 |
| Self-hosted faster-whisper (compute only, excl. ops) | $6.00 | $26.25 | $228.75 |

**Reading this table:** at every scale in this bootstrapped build's realistic range, ASR is a rounding error next to hosting/LLM/teacher-payout costs — the most expensive realtime options top out around $1,200/month at 10,000 students, and the recommended batch options are under $450/month even at 10,000 students. **Cost is not the deciding factor here; accuracy, streaming support, and data residency are.** Self-hosting only becomes attractive past a much larger scale than this build will hit for years, and it adds ML-ops burden the brief explicitly says this team doesn't have — noted as a "do not do this in v1" call even though the raw compute number looks cheap.

**LLM cleanup-pass cost is separately negligible:** at DeepSeek-V4-Flash off-peak rates ($0.22/1M input, $0.66/1M output tokens, checked 2026-08-30 from `corpus/deepseek-pricing.md`), the punctuation/cleanup pass (Section 3) costs **$0.13/month at 100 students, $1.33/month at 1,000, $13.31/month at 10,000** — computed with the same script, ~280 input + ~260 output tokens per dictation session. This is small enough that "should we run the cleanup pass" is never a cost question, only a latency question.

### 1.6 Recommendation

**Primary: Sarvam AI Saarika/Saaras.** Reasons: cheapest per-minute rate found, **India-hosted** (best DPDP data-residency fit — see Section 7), true streaming API (needed for the Wispr Flow-style live experience in Section 3), and a `codemix` output mode purpose-built for exactly the Hindi-English switching pattern in the brief's own example utterance. Confidence: **Medium** — the one independent head-to-head benchmark found (VAANI) does not show Sarvam winning on strict WER, though the scoring methodology plausibly disadvantages it for our specific use case (Section 1.2). This is a "pilot on our own sample audio before committing" call, not a settled one.

**Fallback: OpenAI gpt-4o-transcribe** (with `gpt-4o-mini-transcribe` for cost-sensitive/lower-stakes uses). Reasons: reliable, well-documented, same vendor family already used elsewhere is not true here (DeepSeek is the LLM, not OpenAI) but OpenAI's transcription API is the most-used and best-supported option if Sarvam's reliability or accuracy disappoints in the pilot; independent evidence shows Whisper-large-v3 handles Hindi/Tamil script fidelity well. Runner-up condition: **use this as primary if the pilot shows Sarvam's insertion-rate problem is real for our data (not just a scoring artifact), or if Sarvam's API reliability/uptime is a concern** (it is a much smaller vendor than OpenAI).

**Explicitly rejected as primary:** Web Speech API — free, but sends raw student audio to Google/Apple with no contractual data processing agreement available to us, has no custom vocabulary, and is inconsistent across browsers (Firefox has it flagged off by default). It may still be worth a **client-side instant-feedback layer** (showing something on screen within ~100ms while the real request goes to the server-side provider) but must never be the system of record for a saved note. AI4Bharat IndicWhisper/IndicConformer — best independent Indic accuracy signal found, but **no hosted API exists**; self-hosting requires NeMo/ML-ops capacity this build does not have per the brief's own constraints. Revisit only if volume justifies dedicated ML infrastructure (not before ~10,000 daily active voice users, per the self-host cost curve in 1.5, and even then only with a hire dedicated to it).

---

## 2. Maths dictation — speech to correct LaTeX

### 2.1 Does any ASR handle maths natively? — verified, largely no.

Searched directly for this. Finding: **no mainstream ASR (Whisper, Sarvam, Deepgram, Google, Azure, ElevenLabs) emits LaTeX or structured math notation.** All of them emit the spoken words as prose ("x squared plus three x minus four equals zero"), leaving structuring entirely to a downstream layer. The one closely relevant piece of prior art is **arXiv:2508.03542 "Speech-to-LaTeX: New Models and Datasets for Converting Spoken Equations and Sentences"** **[observed]** — a purpose-built dataset (66,000+ annotated audio samples of spoken equations, English and Russian) and fine-tuned models specifically for this sub-task, confirming that generic ASR is treated as a separate, prior step even in the academic literature built to solve exactly this problem. This is not a solved, productised problem — it is the "hard, differentiating sub-problem" the brief correctly flags it as.

Other prior art found: **MathSpeak** (Nemeth-code-based, non-ambiguous rules for rendering MathML *to* speech for accessibility/screen-reader use — the reverse direction of what we need, but its "non-ambiguous phrasing rules" are directly reusable as a target grammar for the forward direction too) **[observed]**; **ASCIIMathML**, a linear-text-to-math-markup converter (useful as an intermediate representation, not a speech parser) **[observed]**; and a couple of small open-source hobby projects (`speech-to-latex`, `Speech-to-maths` on GitHub) that confirm the rule-based-grammar approach is the common amateur/academic starting point, not an LLM-first approach **[observed, low-confidence — these are unmaintained hobby repos, not evidence of a production-grade approach]**.

### 2.2 Recommended design: hybrid — deterministic grammar first, LLM fallback second

**Rule-based grammar, not LLM-first**, for the following reason: maths dictation needs to feel instantaneous (it's meant to compete with the "just type LaTeX" alternative a student already has), and a deterministic parser is faster, cheaper, and — critically — auditable: it either matches a known pattern or it doesn't, and "doesn't" is a knowable, testable state. An LLM-first approach makes every phrase probabilistic, which is the wrong trade for something students will rely on to get graded answers right.

**Pipeline:**

1. **Normalize.** Lowercase, strip filler words (`um`, `uh`, `like`, `basically` when used as filler rather than "ka value nikalna hai basically" style Hinglish discourse — see the disambiguation note in 2.4), collapse ASR's tendency to write numerals as digits vs words inconsistently (`"3"` vs `"three"`) into one canonical form.
2. **Tokenize into a constrained math-speech vocabulary.** Map spoken tokens to grammar terminals: `squared/cubed/to the power of N` → exponent, `over/divided by` → fraction, `square root of/cube root of` → radical, `plus/minus/times` → binary ops, `equals/is equal to` → `=`, `sub/subscript` → subscript, `sin/cos/tan/log/ln` → named functions, `the derivative of ... with respect to ...` → `\frac{d}{d\square}`, `the integral from A to B of ... d\square` → `\int_A^B`, `the limit as ... approaches ... of` → `\lim`, `the sum from ... to ... of` → `\sum`, `factorial` → `!`, `the absolute value of` → `|\cdot|`.
3. **Recursive-descent parse into an expression tree**, respecting standard precedence (exponents bind tighter than `over`/`times`, which bind tighter than `plus`/`minus`), then render the tree to LaTeX. This is the same shape as a standard calculator-expression parser; the only new work is the speech-token vocabulary in step 2.
4. **Fallback to an LLM pass (DeepSeek, since it's already the platform's chosen model)** only when the grammar fails to parse a normalized phrase — i.e., the phrase uses vocabulary or structure outside step 2's terminal set (e.g. matrices, piecewise functions, multi-line systems of equations). The LLM is given the raw phrase plus a strict instruction to emit **only** valid LaTeX or an explicit `AMBIGUOUS` marker with the candidate readings — never a confident guess when uncertain.
5. **Always render the result live in KaTeX next to the raw transcript**, so the student sees both the words they said and the notation the system produced, before it's committed to the note.

**Grammar sketch (recursive descent, illustrative pseudocode a coding agent can implement directly):**

```
expr      := term (("plus" | "minus") term)*
term      := power (("times" | "over") power)*
power     := atom ("squared" | "cubed" | "to the power of" NUMBER)?
atom      := NUMBER
           | VARIABLE ("sub" | "subscript") (NUMBER | VARIABLE)
           | "the square root of" expr
           | "the" ORDINAL "root of" expr          -- e.g. "the cube root of"
           | FUNCNAME expr                          -- sin, cos, tan, log, ln
           | "the absolute value of" expr
           | "the derivative of" expr "with respect to" VARIABLE
           | "the integral from" expr "to" expr "of" expr "d" VARIABLE
           | "the limit as" VARIABLE "approaches" expr "of" expr
           | "the sum from" VARIABLE "equals" expr "to" expr "of" expr
           | NUMBER "factorial"
           | "(" expr ")"                           -- only if student says "open bracket"/"close bracket" explicitly

equation  := expr "equals" expr
```

Render targets (examples): `power` with `squared` → `{base}^2`; `term` with `over` → `\frac{left}{right}`; `atom` with `sub` → `{var}_{index}`; derivative rule → `\frac{d}{d{var}}\left({expr}\right)`; integral rule → `\int_{lower}^{upper} {expr} \, d{var}`.

**LLM fallback prompt (for phrases the grammar rejects):**

```
System: You convert spoken mathematics into LaTeX. Rules:
1. Output ONLY the LaTeX expression, no prose, no explanation, no $ delimiters.
2. If the phrase is genuinely ambiguous between two or more standard readings,
   output exactly: AMBIGUOUS: <reading 1> | <reading 2> [| <reading 3>]
   using LaTeX for each reading. Do not silently pick one.
3. Preserve any non-mathematical words in the input verbatim, in their original
   language/script, around the mathematical expression — do not translate or
   drop Hindi/Hinglish discourse words (e.g. "toh", "basically", "ka value
   nikalna hai"). Only the mathematical content becomes LaTeX.
4. If no valid mathematical reading exists, output exactly: NO_MATH_FOUND

Examples:
Input: "x squared plus three x minus four equals zero"
Output: x^2 + 3x - 4 = 0

Input: "toh basically x squared ka value nikalna hai"
Output: toh basically x^2 ka value nikalna hai

Input: "x plus one over two"
Output: AMBIGUOUS: x + \frac{1}{2} | \frac{x+1}{2}

Input: <raw normalized phrase>
Output:
```

This prompt is deliberately small (few-shot, not a large system doc) to keep latency and DeepSeek token cost low — see Section 1.5 for the cleanup-pass cost figures, which apply to this fallback pass too (it's the same call shape, slightly larger output).

### 2.3 Test set — 15+ spoken phrases with expected LaTeX (for a coding agent to verify against)

| # | Spoken phrase | Expected LaTeX | Notes |
|---|---|---|---|
| 1 | "x squared plus three x minus four equals zero" | `x^2 + 3x - 4 = 0` | Core grammar case |
| 2 | "integral from zero to one of x squared dx" | `\int_0^1 x^2 \, dx` | Integral rule |
| 3 | "the square root of two" | `\sqrt{2}` | Radical rule |
| 4 | "a squared plus b squared equals c squared" | `a^2 + b^2 = c^2` | Pythagoras — likely a curriculum-taxonomy term (cross-ref Lane E) |
| 5 | "one half" | `\frac{1}{2}` | Common shorthand fraction, not "one over two" phrasing |
| 6 | "x plus one over two" | `AMBIGUOUS: x + \frac{1}{2} | \frac{x+1}{2}` | **Deliberately ambiguous** — see 2.4, must not be silently resolved |
| 7 | "three over four plus one over two" | `\frac{3}{4} + \frac{1}{2}` | Two fractions, unambiguous because both operands are already fractions |
| 8 | "the limit as x approaches infinity of one over x" | `\lim_{x \to \infty} \frac{1}{x}` | Limit rule |
| 9 | "sin squared theta plus cos squared theta equals one" | `\sin^2\theta + \cos^2\theta = 1` | Named function + exponent-on-function (note: exponent applies to the function name, not the argument — a known grammar edge case) |
| 10 | "f of x equals two x plus three" | `f(x) = 2x + 3` | Function notation, not multiplication of f and x |
| 11 | "the derivative of x cubed with respect to x" | `\frac{d}{dx}\left(x^3\right)` | Derivative rule |
| 12 | "x sub one plus x sub two" | `x_1 + x_2` | Subscript rule |
| 13 | "the sum from i equals one to n of i" | `\sum_{i=1}^{n} i` | Summation rule |
| 14 | "five factorial" | `5!` | Postfix operator |
| 15 | "the absolute value of x minus three" | `|x - 3|` | Absolute value rule |
| 16 | "pi r squared" | `\pi r^2` | Constant symbol (pi) recognition — needs a symbol lookup table, not just the grammar |
| 17 | "toh basically x squared ka value nikalna hai" | `toh basically x^2 ka value nikalna hai` | **The brief's own example** — Hindi discourse preserved verbatim, only the embedded math phrase converted |
| 18 | "matrix a two by two with entries one two three four" | `NO_MATH_FOUND` (v1) or explicit "unsupported" UI state | **Out of scope for the v1 grammar** — matrices are a v2 grammar extension; the system must say so, not silently mangle it |
| 19 | "two x plus three y equals seven" | `2x + 3y = 7` | Standard linear equation, tests multi-variable handling |
| 20 | "x squared ka square root" | `\sqrt{x^2}` | Hinglish word-order case: "ka square root" (postfix "of" in Hindi grammar) must still map to the same radical rule as English "the square root of x squared" |

Rows 6 and 18 are load-bearing for grading the implementation honestly: a system that silently guesses on row 6 or garbles row 18 instead of flagging it has failed the spec, even if the other 18 rows pass.

### 2.4 Ambiguity — addressed honestly, not hand-waved

"x plus one over two" is genuinely ambiguous in spoken English between `x + \frac{1}{2}` and `\frac{x+1}{2}` — no grammar or LLM can resolve this from the audio alone; a human reading the same sentence off a page has the identical problem, which is *why* real mathematical notation uses layout (vertical fraction bars, parentheses) that speech doesn't carry. **This is not a solvable-in-software problem; it needs a disambiguation UX, not a smarter parser:**

- When the grammar or LLM detects a genuinely ambiguous span (the `AMBIGUOUS:` marker in the prompt above, or a grammar-level ambiguity flag), the mic button's result view shows **both candidate renderings as tappable KaTeX chips** side by side, with the raw transcript underneath for reference, and the student picks one before it commits to the note. Default to *not* inserting anything until a choice is made, rather than guessing and letting the student silently accept a wrong answer.
- Teach the disambiguation UX once, contextually, the first time it fires (a one-line tooltip: "This could mean two things — tap the one you meant"), then get out of the way.
- For the specific `over` ambiguity, a **spoken-notation convention** can reduce (not eliminate) the problem: teach students that saying "over" implies the fraction bar spans only the immediately adjacent terms unless they say "quantity" first (a real convention borrowed from verbal math instruction — "quantity x plus one, over two" unambiguously means `\frac{x+1}{2}`). This is worth putting in a one-time onboarding tip, not worth enforcing or blocking on.

### 2.5 v1 or deferred?

**Maths dictation ships in v1, but scoped down: the grammar (Section 2.2, steps 1–3) is v1; the LLM fallback (step 4) is v1 but low-priority-polish; matrices/piecewise/multi-line systems are explicitly v2.** Reasoning: the grammar covers the algebra/trig/calculus vocabulary a CBSE/JEE-track Maths-first launch actually needs (per the mission's own subject-order priority), is cheap and fast to build (a coding agent can implement and unit-test the 20-row table in Section 2.3 directly), and is the single most differentiating piece of this entire lane — nobody else in the reference corpus (RemNote, Notion, Symbolab's input methods) does spoken-math-to-LaTeX; it is worth the build cost specifically because it's rare. Full generality (matrices, multi-line proofs, physics vector notation) is deferred because it multiplies grammar complexity for a minority of use cases and the brief's own build order is Maths first.

---

## 3. The Wispr Flow interaction pattern, specified for the web

### 3.1 Activation

**Push-to-talk on desktop, hold-to-talk on mobile — not toggle-to-record.** Push-to-talk (hold a key/button while speaking, release to stop) keeps the mental model matching the brief's example exactly ("hold a hotkey, speak, it inserts text") and avoids the failure mode of a forgotten open mic in a shared, noisy home (Section 6). Toggle mode is offered as an accessibility alternative (Section 6) for students who cannot physically hold a key/button for the duration of speech, but is opt-in, not default.

- **Desktop hotkey:** a configurable key held down (default suggestion: `Ctrl+Space` on Windows/Linux, `Cmd+Space`-adjacent but not literally that since it collides with Spotlight on macOS — suggest `Ctrl+Shift+Space` as the safe default), scoped to when the editor has focus.
- **Mobile affordance:** a **hold-to-talk mic button pinned to the persistent bottom toolbar**, in the same row as the block-type buttons already specified in `corpus/remnote-ui-screenshots.md` §4 (`Flashcard ⌄ · Heading ⌄ · Todo · Image · Table ⌄ · More ＋`) — insert it immediately after `Todo`, before `Image`, since it's a text-input method, not a media-embed action. Pressing and holding it starts capture; lifting the finger stops it; sliding away (a common mobile voice-message gesture students already know from WhatsApp) cancels without inserting anything.

### 3.2 Live feedback while speaking

- **A level meter (waveform bars), not a static "recording" icon** — driven by `AnalyserNode` off the live `MediaStream`, updated at ~30fps. This is the cheapest, most important piece of trust-building UI: students need to see the mic is actually picking up their voice, especially over background noise (Section 6).
- **Streaming partial transcript**, shown in a lighter/greyed weight below the waveform, replaced by the final cleaned text once the cleanup pass completes. Only meaningful with a streaming-capable provider (Sarvam's Streaming API or Deepgram's realtime tier — see Section 1).
- **Latency budget: partial transcript must appear within 300ms of speech onset to still read as "live."** Above ~500ms it starts to feel like a walkie-talkie, not live captioning; above ~1000ms students will start talking over/past the lag and get confused about what's been captured. This is a hard requirement on the streaming path — a batch-only provider (plain OpenAI Whisper API with no realtime tier) cannot meet this and must not be used for the primary interactive dictation surface; it's fine for background/non-interactive transcription only.

### 3.3 The cleanup pass — this is the actual product

Wispr Flow's real value, per the brief, is not the raw ASR — it's what happens after. **Hybrid: a fast rules pass first, LLM pass second**, run in sequence, not either/or:

1. **Rules pass (client- or edge-side, near-zero latency):** strip filler tokens (`um`, `uh`, `you know`) from a fixed list — but see the note in Section 2.4/2.3 row 17 that Hindi discourse particles like "toh" are *not* filler and must not be stripped by the same list used for English fillers; maintain separate filler lists per detected language segment. Basic sentence-boundary punctuation from pause detection (a >600ms pause after a falling-intonation cue, where the ASR provider exposes word-level timestamps, becomes a full stop).
2. **LLM pass (DeepSeek-V4-Flash, off-peak where possible):** auto-capitalization, grammar correction, and — the genuinely valuable part — converting spoken structure into real editor blocks: "bullet point... next bullet point..." becomes actual list items via the note editor's block schema (owned by another lane's editor spec — this lane's job is only to emit a structured intermediate format, e.g. an array of `{type: "bullet"|"paragraph"|"heading", text}` objects, that the editor consumes). Cost is negligible per Section 1.5 ($0.13–$13/month across the whole scale range); the budget that matters is **latency**, not money: target under 800ms for the LLM pass to complete after the student releases the mic button, so the total time from "release button" to "text appears" stays under ~1.2s combined with network round-trip.

**Cleanup prompt (distinct from the maths-specific prompt in Section 2.2 — this one runs on all dictation, not just maths phrases):**

```
System: Clean up this raw speech-to-text transcript for insertion into a
student's notes. Rules:
1. Remove filler words (um, uh, like, you know) — but do NOT remove Hindi/
   Hinglish discourse particles (toh, matlab, basically-as-a-connective) that
   carry meaning in code-switched speech; only remove them if they are
   pure hesitation fillers with no semantic role.
2. Fix grammar, capitalization, and punctuation.
3. If the speaker said "bullet point" / "next point" / "new line", convert
   that structure into a JSON array of blocks: [{"type": "bullet"|"paragraph",
   "text": "..."}], not literal words "bullet point" in the output.
4. If the speaker dictated a mathematical expression, hand that span to the
   math-parser pipeline (do not attempt LaTeX conversion yourself) — wrap it
   as {"type": "math_span", "raw": "<original words>"} and leave conversion
   to the downstream grammar/LLM math pass.
5. Preserve the speaker's own words and meaning. Do not summarize, do not add
   content, do not change technical terms.
Output: JSON array of blocks as described above. No prose commentary.

Transcript: <raw ASR output>
```

### 3.4 Custom vocabulary

- **Deepgram and AssemblyAI both support self-serve keyword boosting / custom vocabulary lists out of the box** (Deepgram's Nova-3 "self-serve customization" and `keywords` API; AssemblyAI's `word_boost` array) — the most concretely documented customization path of any provider checked (Section 1.4).
- **Sarvam:** no public documentation of a custom-vocabulary mechanism was found in this pass — flagged as an open question (Section "Could not verify") to resolve directly with Sarvam before committing to it as primary, since custom vocabulary is exactly what's needed for subject terms (Pythagoras, coefficient, quadratic) and teacher names.
- **OpenAI:** only the `prompt` parameter (~224-token context bias, not true boosting) — weakest customization story of the set.
- **Feed mechanism:** the platform's own curriculum taxonomy (owned by Lane E) is the natural source list — export the taxonomy's canonical term list (topic names, formula names, standard variable conventions) as a flat vocabulary file, refreshed whenever the taxonomy changes, and push it to whichever provider's boosting API is in use. This is a one-way data feed from Lane E's output into this lane's provider config; it does not require Lane E to change anything for this lane's sake — this lane consumes Lane E's taxonomy file by path once it exists. **Concretely:** if Lane E's deliverable defines topic/term names in a machine-readable list, that same list is the custom-vocabulary payload here — no separate content curation work needed for this feature specifically.

### 3.5 Insertion semantics

- Dictated text lands **at the current cursor position**, exactly like typed text — not appended to the end of the block or the document. If a text selection is active when dictation starts, the dictated text **replaces the selection** (matching standard editor convention, and matching how typed input would behave).
- **Undo:** the entire dictation-plus-cleanup insertion is a **single undo step** (one `Ctrl+Z` removes the whole inserted span), not one step per word or per block — this matches how a paste operation is normally undone and avoids a multi-press undo chore.
- **Correcting a dictation:** the student edits the inserted text like any other text — there is no separate "re-dictate" mode. If a maths span was mis-parsed (Section 2.4's ambiguity case), tapping the rendered LaTeX re-opens the disambiguation chips (Section 2.4) rather than requiring the student to delete and re-speak the whole phrase.

### 3.6 Error and permission states

| State | Trigger | UI |
|---|---|---|
| Mic permission denied | `getUserMedia` rejects with `NotAllowedError` | Inline message at the mic button: "Microphone access is off. Enable it in your browser/device settings to use voice notes." with a link to the relevant OS settings page where the platform can detect it (best-effort, OS-dependent); the button reverts to disabled-but-visible, not hidden. |
| No network | `navigator.onLine === false` or the streaming socket fails to open within ~2s | Mic button shows an offline slash icon; tapping it shows "Voice notes need an internet connection." Do not silently fall back to Web Speech API without telling the student the accuracy/privacy trade changed (Section 7). |
| Too noisy / low-confidence audio | Provider returns a low per-word confidence score across most of the utterance (threshold: e.g. mean confidence < 0.55 where the provider exposes it) | Insert the text but visually flag it (subtle underline, like a spellcheck squiggle) with a tooltip "Not sure this was captured correctly — check it," rather than blocking insertion. Never silently discard low-confidence output; the student is the final judge. |
| Nothing detected | Recording stops (button released) with zero words returned, or a VAD (voice-activity-detection) gate never triggers | "Didn't catch anything — try again," no insertion, mic button returns to idle. |
| Recording started but interrupted (tab backgrounded, call interrupts mic on mobile) | `mediaStream` track `ended` event, or `visibilitychange` while recording | Stop capture immediately, process whatever was captured up to that point (partial result), and label the result as partial rather than discarding it — losing 8 seconds of a 10-second dictation to a phone call should not cost the whole utterance. |

### 3.7 `useDictation` hook and mic button — React + TypeScript

```tsx
// useDictation.ts
// House stack: React 18 + TypeScript (per mission brief's existing stack).
// This hook owns capture + a client-side state machine only. It calls a
// platform backend relay endpoint (never a vendor ASR API directly from the
// browser — API keys must stay server-side, and server-side is also where
// consent/retention rules from Section 7 are enforced).

import { useCallback, useEffect, useRef, useState } from "react";

export type DictationState =
  | "idle"
  | "requesting-permission"
  | "permission-denied"
  | "recording"
  | "processing"
  | "reviewing-ambiguous"
  | "error-no-network"
  | "error-no-speech"
  | "error-low-confidence";

export interface DictationResult {
  /** Cleaned, structured blocks ready for the editor (Section 3.3 §3). */
  blocks: Array<{ type: "paragraph" | "bullet" | "math_span"; text: string }>;
  /** Raw provider transcript, kept for the "review what was heard" affordance. */
  rawTranscript: string;
  meanConfidence: number | null;
}

interface AmbiguousMathSpan {
  raw: string;
  candidates: string[]; // LaTeX candidate strings, Section 2.4
}

interface UseDictationOptions {
  /** ms of trailing silence before auto-stop in toggle mode; ignored in
   * push-to-talk mode where release is the stop signal (Section 3.1). */
  silenceTimeoutMs?: number;
  onResult: (result: DictationResult) => void;
  onAmbiguousMath?: (span: AmbiguousMathSpan) => void;
}

const RELAY_WS_URL = "/api/dictation/stream"; // same-origin backend relay

export function useDictation({
  silenceTimeoutMs = 1500,
  onResult,
  onAmbiguousMath,
}: UseDictationOptions) {
  const [state, setState] = useState<DictationState>("idle");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [levelMeter, setLevelMeter] = useState(0); // 0..1, drives the waveform UI

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const pickMimeType = (): string => {
    // iOS Safari (pre-18.4) only accepts audio/mp4 (AAC); Chrome/Android and
    // modern Safari accept audio/webm;codecs=opus (Section 4).
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/mp4",
      "audio/mp4;codecs=mp4a.40.2",
    ];
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
  };

  const stopLevelMeter = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const tickLevelMeter = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    let sumSquares = 0;
    for (let i = 0; i < data.length; i++) {
      const centered = (data[i] - 128) / 128;
      sumSquares += centered * centered;
    }
    const rms = Math.sqrt(sumSquares / data.length);
    setLevelMeter(Math.min(1, rms * 4)); // scaled for a visually responsive bar
    rafRef.current = requestAnimationFrame(tickLevelMeter);
  }, []);

  const start = useCallback(async () => {
    setState("requesting-permission");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000, // matches most ASR providers' native rate; avoids server-side resampling
        },
      });
    } catch (err) {
      setState("permission-denied");
      return;
    }
    if (!navigator.onLine) {
      stream.getTracks().forEach((t) => t.stop());
      setState("error-no-network");
      return;
    }

    mediaStreamRef.current = stream;

    // Level meter setup (Section 3.2).
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;
    tickLevelMeter();

    // Streaming relay socket (Section 1: Sarvam/Deepgram streaming via
    // server-side relay — the browser never holds a vendor API key).
    const socket = new WebSocket(RELAY_WS_URL);
    socketRef.current = socket;
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "partial") setPartialTranscript(msg.text);
      if (msg.type === "ambiguous_math") onAmbiguousMath?.(msg.span);
    };
    socket.onerror = () => setState("error-no-network");

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
        socket.send(e.data); // chunked streaming, Section 3.2's latency budget
      }
    };

    // Stop capture cleanly if the track ends unexpectedly (call interrupt,
    // screen lock on some Android builds) — Section 3.6's interruption row.
    stream.getAudioTracks()[0].addEventListener("ended", () => stop());

    recorder.start(250); // 250ms timeslice: small enough for a live feel, Section 3.2
    setState("recording");
  }, [onAmbiguousMath, tickLevelMeter]);

  const stop = useCallback(() => {
    stopLevelMeter();
    recorderRef.current?.stop();
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    setState("processing");

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setState("error-no-network");
      return;
    }
    socket.send(JSON.stringify({ type: "end" }));
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "final") {
        if (msg.meanConfidence !== null && msg.meanConfidence < 0.55) {
          setState("error-low-confidence");
        } else if (msg.blocks.length === 0) {
          setState("error-no-speech");
        } else {
          setState("idle");
        }
        onResult({
          blocks: msg.blocks,
          rawTranscript: msg.rawTranscript,
          meanConfidence: msg.meanConfidence,
        });
        socket.close();
      }
    };
  }, [onResult]);

  useEffect(() => stop, []); // safety: clean up media/socket on unmount

  return { state, partialTranscript, levelMeter, start, stop };
}
```

```tsx
// DictationMicButton.tsx
// Hold-to-talk mic button (Section 3.1) for the bottom editor toolbar,
// positioned after "Todo" per corpus/remnote-ui-screenshots.md §4's
// existing toolbar order.

import { Mic, MicOff, Loader2 } from "lucide-react";
import { useDictation, type DictationResult } from "./useDictation";

interface DictationMicButtonProps {
  onInsert: (result: DictationResult) => void;
}

export function DictationMicButton({ onInsert }: DictationMicButtonProps) {
  const { state, partialTranscript, levelMeter, start, stop } = useDictation({
    onResult: onInsert,
  });

  const isRecording = state === "recording";
  const isDisabled = state === "permission-denied" || state === "error-no-network";

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        aria-label={isRecording ? "Release to stop dictation" : "Hold to dictate"}
        aria-pressed={isRecording}
        disabled={isDisabled}
        onPointerDown={(e) => {
          e.preventDefault();
          start();
        }}
        onPointerUp={stop}
        onPointerLeave={() => isRecording && stop()}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors
          ${isRecording ? "bg-red-500 text-white" : "bg-transparent text-neutral-500 hover:bg-neutral-100"}
          disabled:opacity-40 disabled:cursor-not-allowed`}
        style={
          isRecording
            ? { boxShadow: `0 0 0 ${4 + levelMeter * 8}px rgba(239,68,68,0.15)` }
            : undefined
        }
      >
        {state === "processing" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isDisabled ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </button>

      {isRecording && partialTranscript && (
        <span className="absolute left-full ml-2 max-w-[220px] truncate text-sm text-neutral-400">
          {partialTranscript}
        </span>
      )}

      {state === "permission-denied" && (
        <span className="absolute left-full ml-2 text-xs text-red-500">
          Mic access is off — enable it in settings.
        </span>
      )}
    </div>
  );
}
```

These two files are a concrete starting point for a coding agent, not a finished production implementation — the backend relay endpoint (`/api/dictation/stream`), the provider adapter behind it (Sarvam primary / OpenAI fallback per Section 1.6), and the maths-grammar service (Section 2.2) are separate pieces of work this lane specifies but does not implement.

---

## 4. Browser and device reality

- **Android Chrome:** full `getUserMedia` + `MediaRecorder` support, `audio/webm;codecs=opus` widely supported, good streaming chunk behavior. This is the primary target device class for this build (low-end Android, per the mission's hard constraints) and the least risky platform here.
- **iOS Safari:** **[observed, WebKit blog + community sources, checked 2026-08-30]** From Safari 14.1 through 18.3, `MediaRecorder` is restricted to `audio/mp4` with AAC audio only — requesting `audio/webm` returns unsupported. **Safari 18.4+ adds WebM/Opus support**, but a meaningful share of the installed base will be on older iOS versions for years, especially on budget/older iPhones still in circulation in India. **The `pickMimeType()` fallback in the hook above (Section 3.7) is not optional — it is the difference between the feature working and silently failing on a large slice of iOS users.** Additionally, WebKit's Opus implementation (where available) hard-codes 2.5ms frames with no app-level control — a minor detail, but confirms iOS Safari is the platform to test first and most, not last.
- **Codec/bitrate choice for cheap Indian mobile data:** **Opus at 16 kHz mono, ~24–32 kbps** is the right target where available (Chrome/Android, and iOS 18.4+) — it's purpose-built for speech, and a 1.5-minute dictation burst (Section 1.5's usage assumption) costs roughly 300–360 KB, trivial even on a throttled 2G/3G fallback. Where only AAC/MP4 is available (older iOS), accept the larger container overhead; it is still small relative to typical bundled data plans, and dictation bursts are short by design (Section 3.1's push-to-talk model actively works against long, expensive recordings).
- **Screen lock / app backgrounding:** on mobile, backgrounding the browser tab or locking the screen **stops microphone capture** on both Android Chrome and iOS Safari — there is no reliable background-audio-capture permission model for a web page (unlike a native app with a background-audio capability). The `ended` track-event handler in the hook (Section 3.7) is the correct defensive response: stop cleanly and process whatever was captured, per the interruption row in Section 3.6's error-state table. **Do not promise "dictate while multitasking" — it is not deliverable on the web platform as specified.**
- **PWA:** installing as a PWA does **not** change microphone permission behavior in any way found in this research — it's still governed by the same `getUserMedia` permission prompt and the same backgrounding limitation as a regular tab. A PWA does not unlock background audio capture on iOS. **[inferred from general PWA capability documentation — not independently re-verified in this pass; flagged below as unverified if this matters for a later decision.]**
- **Battery cost:** continuous microphone capture plus a live `AnalyserNode` loop plus an open WebSocket is a real but bounded battery cost — bounded specifically *because* push-to-talk (Section 3.1) keeps sessions short (seconds, not minutes) by design. This is another reason push-to-talk beats toggle-to-record as the default: an accidentally-left-open toggle mic is both a privacy problem (Section 7) and a battery problem on a budget Android phone.

---

## 5. Where voice appears in the product — surface mapping

| Surface | Feature type | Verdict | Why |
|---|---|---|---|
| **Operator/author's note editor** (converting source teaching material into structured notes) | (a) Dictation | **v1 — highest priority in this lane** | This is the strongest case in the whole lane. The operator has a large body of existing teaching material to convert into the platform's notes format; typing it all out is slow, and dictation-while-reading-from-a-textbook or dictation-while-explaining-a-concept-out-loud is a faster authoring path than typing for most people. This is a **content-production tool**, not a student-facing gimmick — see the note below. |
| **Student's personal-notes layer** (annotating/adding to notes while studying) | (a) Dictation | **v1, but scoped down and opt-in, not the primary input path** | Real accessibility and speed win for some students (Section 6), but Section 6 also means it cannot be the *only* path to add a note — noisy shared homes are the norm, not the exception, for a large share of the target user base. |
| **AI tutor chat input** | (c) Conversational voice | **v2, deferred** | Typing already works for a text-first chat product; voice adds ASR cost, latency, and error surface (Section 3.6) for a use case where the text box is already the lowest-friction path. Worth adding once the core product is stable and if usage data shows students actually asking for it. |
| **Spoken answers to practice questions** | (c) Conversational voice | **Reject for v1** | Would require grading spoken formula answers from raw audio — compounding Lane D's answer-equivalence problem with this lane's maths-dictation problem, for a feature the brief never actually asked for. If a student wants to answer by voice, dictate-then-review (Section 3.5's correction flow) already covers it without inventing a separate spoken-answer-grading pipeline. |
| **Teacher's post-call notes** (after a 30-minute Zoom booking) | (a) Dictation | **v2** | Plausible and low-risk (teacher is an adult, professional context, not a minor — simplifies Section 7's consent story for this specific surface) but not core to the launch's Maths-first scope; revisit once live teacher booking (Pillar 5) is itself built. |
| **Lecture/session recording** (RemNote's "Record Lecture" pattern) | (b) Long-form recording | **Reject for v1, for both operator and student surfaces** | For students: this is the exact feature RemNote already owns (`corpus/remnote-ui-screenshots.md` §3, §6) — copying it is not differentiating and carries real transcription-pipeline cost (diarization, summarization, long-audio storage) this build doesn't need at launch. For the operator: if the operator has existing recorded lecture *video* (not live dictation) to convert, that is better framed as a batch **ingest** job for Lane F's content pipeline (upload once, transcribe offline, no live-recording UI needed) rather than a "Record" button — cross-reference Lane F's deliverable for how bulk source material is ingested; this lane does not own that pipeline. |

**The operator-vs-student argument, made explicit:** the brief's five product pillars all assume a body of structured content already exists to test against, tutor from, and study. Getting that content *into* the platform in the first place is the actual bottleneck for a single-operator or small-team bootstrapped build — and that bottleneck is best solved by giving the operator a fast dictate-while-explaining authoring flow (Section 3's whole interaction pattern, aimed first at the author console), not by adding a flashy student-facing voice feature that competes with an already-solved problem (typing) for a marginal UX gain. **Recommendation: build and ship the author-console dictation experience first, in isolation, before touching the student editor at all** — it de-risks the whole feature (fewer users, higher tolerance for rough edges, faster feedback loop with the one person who'll actually use it daily) and delivers the content-production value immediately.

---

## 6. Accessibility and equity

**The genuine win:** voice input is a real accessibility feature for students with dyslexia, dysgraphia, or motor difficulties, and for students who read English comfortably but type slowly (a real population in a market with a large non-native-English-typing student base, per the mission's India-first, Hinglish-heavy framing). For these students, dictation is not a nice-to-have convenience — it can be the difference between participating fully and not.

**The honest downside, stated plainly:** many Indian students study in shared, noisy home environments — a joint family living room, a single room shared with siblings, background TV or street noise. This is the norm for a meaningful share of the target market, not an edge case. Consequences for this design:

- **Voice must never be the only path to any action.** Every dictation-enabled surface (Section 5) must have an equally functional typing path; dictation is additive, never a required step. This is already implied by "opt-in, not primary" in Section 5's table, stated here as a hard requirement, not a preference.
- **The low-confidence and no-network states (Section 3.6) must degrade gracefully to "just type it instead," not dead-end the student.**
- **Push-to-talk (Section 3.1) itself is a partial mitigation** for the noisy-home problem — a short, deliberate burst of speech is more socially and acoustically survivable in a shared room than an open, continuously-listening mic — but it does not solve the underlying problem, and the platform should not overclaim that it does.

---

## 7. Privacy, consent, and DPDP

**The core fact that shapes everything else here: most of this platform's students are minors.** Under the DPDP Act 2023, a "child" is anyone under 18, and Section 9(3) **[observed, multiple legal-analysis sources cross-checked, checked 2026-08-30]** explicitly bans tracking, behavioural profiling, and targeted advertising directed at children, alongside a general requirement for **verifiable parental consent** before processing a child's personal data. Voice recordings of a minor are personal data (arguably sensitive, given voice can function as a biometric identifier) under any reasonable reading of the Act, even though the sources checked in this pass did not find DPDP guidance that names "voice" as a distinct sensitive-data category the way some other jurisdictions' laws do — flagged below as a point needing a lawyer, not resolved by this research.

**Recommendations:**

1. **Verifiable parental consent, obtained once at account setup** (not re-obtained per dictation use), covering voice data processing specifically and by name — not folded silently into a generic terms-of-service checkbox. This is a platform-wide DPDP requirement that this lane inherits rather than owns; flagging it here because voice is one of the more sensitive data types this platform touches.
2. **Discard raw audio after transcription; retain only the resulting text.** Recommended default, for three reasons: (a) it minimizes the sensitive-data footprint under the Act's data-minimization principle, (b) it removes an entire category of breach risk (a leaked audio corpus of children's voices is categorically worse than a leaked text corpus of their notes), and (c) it matches what the feature is actually for — the student wants the resulting note, not an audio archive. **Exception to flag, not resolve: if voice-authentication or fraud-detection ever becomes a requirement (not currently in scope per the brief), that would need audio retention and a separate consent basis — do not build toward that speculatively.**
3. **Retention policy for the transcript itself:** follows the same retention rules as any other student note (this lane does not need a separate policy for dictated vs typed text once transcription is complete — a dictated note is, after that point, just a note).
4. **Vendor/jurisdiction disclosure, concretely, for whichever provider is chosen (Section 1.6):** if Sarvam is used as primary, audio is processed by an **India-domiciled** company — the cleanest DPDP posture found in this research. If OpenAI is used as fallback, audio crosses to a **US-domiciled** processor, which triggers the Act's cross-border data transfer provisions (the Act permits transfer except to government-blacklisted countries, but "permitted" is not the same as "ideal" for a product whose users are minors) — **this specific point needs a lawyer's sign-off before OpenAI is used as anything more than a documented fallback for reliability, not a routine default.**
5. **On-device/India-hosted requirement:** not strictly mandated by anything found in the DPDP Act text or its 2025 Rules for this use case, but **strongly recommended as a product design choice** given the minors-as-primary-user-base fact — prefer Sarvam (India-hosted) or, if volume ever justifies it, AI4Bharat self-hosted (fully on-device, zero third-party transfer) over any US-domiciled processor for the default/primary path.
6. **Flag for a lawyer, explicitly:** (a) whether voice specifically counts as biometric/sensitive personal data requiring a higher consent bar than the Act's general child-consent requirement, (b) the exact mechanics of "verifiable" parental consent (the Act's Rules discuss age/identity verification methods, but this research did not resolve which specific verification method — e.g. DigiLocker, a parent's own account — is expected in practice for an EdTech product at this scale), and (c) whether the education-institution exemption to parental consent noted in one source **[vendor/commentary source, not the Act's primary text — low confidence]** applies to a commercial platform like this one or only to formal schools acting as data fiduciaries. None of this blocks building the feature, but all of it should be resolved before the consent-flow copy is finalized.

---

## 8. Decision table

| Decision | Choice | Runner-up | Why | Confidence |
|---|---|---|---|---|
| Which feature ships in v1 | (a) Dictation only, author console first, then scoped student editor | — | Matches the actual Wispr Flow ask; (b) and (c) are different features with weaker cases (Section 0) | High |
| Primary ASR provider | Sarvam Saarika/Saaras | OpenAI gpt-4o-transcribe | Cheapest, India-hosted (DPDP fit), true streaming, codemix mode — but the one independent benchmark found doesn't clearly favor it (Section 1.2/1.6) | **Medium** |
| Maths dictation approach | Deterministic grammar + LLM fallback (hybrid) | Pure LLM pass | Faster, cheaper, auditable; LLM-only would be more flexible but non-deterministic for a feature students rely on for correctness | High |
| Maths dictation v1 scope | Algebra/trig/calculus grammar (Section 2.2) in v1; matrices/multi-line systems in v2 | — | Matches Maths-first launch order; full generality isn't needed yet | High |
| Activation pattern | Push-to-talk / hold-to-talk | Toggle | Matches the noisy-home reality (Section 6) and avoids forgotten-open-mic battery/privacy risk | High |
| Cleanup pass architecture | Rules pass then LLM pass (hybrid) | LLM-only | Rules pass is free and instant for the common filler/punctuation cases; LLM handles structure (bullets) and is cheap enough not to matter (Section 1.5) | High |
| Audio retention | Discard after transcription, keep only text | Retain audio for QA sampling | Minimizes sensitive-data footprint for a minor-heavy user base (Section 7) | High |
| Where voice pays off most | Operator/author content-production, not student-facing headline feature | Student personal notes | The actual bottleneck this build faces is getting existing teaching material into the platform (Section 5) | Medium-High |

---

## 9. Open questions (for the coordinator / next lane, not resolved here)

- Does Sarvam's Saarika/Saaras API support any form of custom vocabulary or keyword boosting? Not found in public docs during this pass — needs a direct question to Sarvam's team or a support-doc deep-dive before committing to it as primary, since custom vocabulary (Section 3.4) is load-bearing for subject terminology.
- What does "verifiable parental consent" concretely require in practice for a commercial EdTech product at this scale under the DPDP Rules 2025 (Section 7, point 6)? Needs a lawyer, not more web research.
- Does the education-institution exemption to child-consent requirements (mentioned in one non-primary source) apply to this platform, or only to formal schools? Needs a lawyer.
- Lane E's curriculum taxonomy format/location wasn't read directly in this pass (out of this lane's scope per the one-file-per-lane rule) — the custom-vocabulary feed described in Section 3.4 assumes it exists as a flat, exportable term list; if Lane E's actual output is structured differently, the feed mechanism needs a small adapter, not a redesign.
- Whether a PWA install genuinely changes nothing about iOS background-audio limits (Section 4) was inferred from general PWA capability knowledge, not independently re-verified against current iOS PWA documentation in this pass.

## 10. Could not verify

- Exact current per-minute pricing for Reverie's Speech-to-Text API (only a 10-free-hour trial and an unrelated TTS rate were found publicly; Section 1.3).
- Gnani.ai's actual per-minute or per-hour pricing (enterprise-only, quote-gated; Section 1.3) — ruled out for cost-model purposes regardless, but its Indic accuracy claims (1M hours of training data under the IndiaAI Mission) were not independently verified either.
- Whether Sarvam's streaming API meets the ≤300ms partial-transcript latency budget specified in Section 3.2 in practice — the docs confirm a streaming API exists, but no independently measured latency figure was found; this needs to be measured directly against a pilot integration, not assumed from the existence of the feature.
- The full VAANI Benchmark's numeric WER table for every system tested (Section 1.2) — the PDF's results table did not render as extractable text in this pass; the specific 16.2% (Google) and Sarvam insertion-rate figures came through in search-result summarization rather than a directly read table, so treat those exact percentages as **medium-confidence** even though the paper's existence and general findings are confirmed.
- Whether a PWA wrapper changes iOS microphone-permission persistence or background behavior at all (Section 4) — flagged as inferred, not independently tested.
