# Packet E — India market, compliance, monetisation, teacher-booking operation
Output: `research/E_india_ops_and_market.md`

1. CURRICULUM MAPPING (the most important structural decision). CBSE/NCERT, ICSE/ISC, major state boards,
   JEE Main/Advanced, NEET, CUET, olympiads. Recommend ONE launch track. Specify how the content model
   represents "same topic across multiple boards" so board #2 is not a rewrite. Give the taxonomy
   Board -> Grade -> Subject -> Chapter -> Topic -> Skill with REAL Class 10 CBSE Maths example values.
   Where to get authoritative syllabus lists; whether NCERT content is licensing-reusable.
2. Pricing landscape with cited current INR prices: Physics Wallah, Unacademy, Vedantu, BYJU'S (note its
   post-collapse status), Cuemath, Doubtnut, Khan Academy India (free), Embibe, Allen Digital, Infinity
   Learn. Indian students expect a large free tier — define the free/paid boundary. Recommend price points
   in INR, and price the 30-min teacher call (credits vs bundled) so it does not destroy margin.
   Show margin arithmetic AS A SCRIPT, not mental math.
3. Payments: Razorpay vs Cashfree vs PhonePe/Paytm vs Stripe India. UPI, UPI Autopay + RBI e-mandate rules
   for recurring, card tokenisation, netbanking. GST on online education services (rate, exemptions,
   registration trigger). TDS/payouts to teachers as contractors. Recommend one gateway, name the package,
   state fees.
4. DPDP Act 2023 + children's data (platform serves minors): verifiable parental consent under 18, the
   ban on behavioural tracking / targeted ads at children, localisation, breach notification, consent
   managers, and the CURRENT STATUS OF THE DPDP RULES with the date checked. Translate EACH obligation
   into a concrete product requirement and where it appears in the UI. Address plainly the risk of sending
   student data to DeepSeek (China-hosted) and give options (open weights self-hosted, India region,
   anonymise before sending).
5. Teacher booking subsystem: video (Zoom Meeting SDK vs API join links vs Google Meet API vs Daily.co vs
   100ms (India) vs Jitsi) with pricing and a recommendation; availability model, IST-first timezone, buffers,
   DOUBLE-BOOKING PREVENTION (specify the locking/transaction approach — it is a concurrency problem),
   cancellation/no-show/reschedule policy; TS interfaces for Teacher, AvailabilitySlot, Booking + the
   booking lifecycle state machine (mermaid); teacher onboarding, verification, payout, rating; the
   teacher-side UI; PRE-CALL CONTEXT handed to the teacher (recent wrong answers, weak skills, AI tutor
   transcript) and its consent implications; post-call notes, recording consent for minors, follow-up work.
6. Device/network reality: low-to-mid Android, 4G, data cost sensitivity, offline needs. HARD NUMBERS for
   the frontend budget (initial JS ceiling, LCP target on 4G + mid-tier Android). English-first but state
   what the content model must do NOW so Hindi/regional translation is possible later.
7. Hosting for a bootstrapped Indian startup: app, Postgres, object storage, CDN. India residency and
   latency (AWS/GCP/Azure Mumbai vs Vercel/Railway/Render/Hetzner). Monthly INR at 100 and 5,000 students.

Every legal and pricing claim needs a source URL + date checked. Flag where an Indian lawyer or CA is
required rather than giving advice.
