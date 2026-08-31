# Packet H — Voice input, dictation, speech-to-notes  (added on operator request)
Output: `research/H_voice_and_dictation.md`
Also read `corpus/remnote-ui-screenshots.md` for where RemNote puts its `Record` affordance.

Operator ask: "another feature like Wispr Flow where you can speak and dictate notes as well."
Wispr Flow = hold a hotkey, speak, get CLEAN PUNCTUATED FORMATTED text at the cursor (filler words
removed, grammar fixed), not a raw transcript.

Separate THREE features and give each its own v1/v2/reject verdict — conflating them is the failure mode:
 (a) dictation into the editor at the cursor (the actual ask)
 (b) lecture/session recording -> transcript -> summarised notes (what RemNote's "Record Lecture" does)
 (c) voice as conversational input (asking the AI tutor, speaking an answer)

1. ASR selection with INDIAN SPEECH as the binding constraint (Indian-accented English + Hinglish
   code-switching, e.g. "toh basically x squared ka value nikalna hai"). Evaluate: Whisper API,
   self-hosted whisper.cpp / faster-whisper / WhisperX; INDIAN providers Sarvam AI (Saarika/Saaras),
   AI4Bharat IndicWhisper/IndicConformer, Reverie, Gnani.ai; Deepgram Nova, AssemblyAI Universal,
   ElevenLabs Scribe, Google Chirp, Azure Speech; and the browser Web Speech API (free but note Chrome
   ships audio to Google, inconsistent, poor Indic, no custom vocabulary). For each: Indic accuracy
   evidence (IndicVoices / Vistaar / FLEURS — clearly separate INDEPENDENT benchmarks from vendor claims),
   streaming, latency, PRICE per audio hour, data residency (DPDP). Recommend primary + fallback. Monthly
   cost at 100/1,000/10,000 students with assumptions shown AS A SCRIPT.
2. MATHS DICTATION (the differentiating hard part): "x squared plus three x minus four equals zero" ->
   LaTeX. Verify (don't assume) whether any ASR does maths natively. Design the post-processor: grammar/
   rule-based spoken-maths parser vs LLM formatting pass vs hybrid. Prior art: MathSpeak, ASCIIMathML,
   LaTeX-speech literature, Wolfram natural-language input. Give the prompt or grammar sketch AND a test
   set of 15+ spoken phrases with expected LaTeX. Handle genuine ambiguity ("x plus one over two") with a
   disambiguation UX — do not pretend software solves it. State v1 or deferred.
3. The Wispr Flow interaction pattern for the web: activation (push-to-talk vs toggle; desktop hotkey;
   mobile hold-to-talk button placement in the editor toolbar); live feedback (waveform/level meter,
   streaming partial transcript, the ms latency target at which it stops feeling live); THE CLEANUP PASS
   (this is the actual product — filler removal, punctuation, capitalisation, sentence splitting, spoken
   structure like "bullet point ... next bullet" becoming real blocks; rules vs LLM vs both, with prompt,
   latency and cost budget); custom vocabulary fed automatically from the curriculum taxonomy (lane E);
   insertion semantics relative to cursor, undo, correcting without redoing; error/permission states
   (mic denied, offline, too noisy, nothing detected, low confidence) each with its UI.
   Give REAL React + TS code for a `useDictation` hook (getUserMedia/MediaRecorder, chunked streaming,
   state machine) plus the mic button component.
4. Browser/device reality: getUserMedia + MediaRecorder on Android Chrome and iOS Safari (iOS audio
   constraints and codec differences are where web capture breaks), codec/bitrate for cheap Indian mobile
   data, screen-lock/background behaviour, PWA implications, battery cost.
5. Where voice appears: author's editor, student personal layer, AI tutor input, spoken answers, teacher
   post-call notes — v1/v2/reject each. Address explicitly whether voice is MORE valuable as a CONTENT-
   PRODUCTION tool for the operator (who must convert a lot of teaching material) than as a student
   feature. Give a clear recommendation.
6. Accessibility/equity: real win for dyslexia and slow typists; honest downside that noisy shared homes
   are the norm for many Indian students, so voice must never be the ONLY path to any action.
7. Privacy/DPDP: a minor's voice is sensitive personal data. Consent flow, whether to retain or discard
   audio after transcription (recommend and justify), retention, what goes to which vendor in which
   jurisdiction, whether India-hosted or on-device is required. Flag what needs a lawyer.

Constraints: bootstrapped India, mobile-first, low-end Android, React 18 + TS. Price every paid service
with the date checked.
