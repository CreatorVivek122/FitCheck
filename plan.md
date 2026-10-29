# FitCheck: Production Architecture and Implementation Plan

> **Purpose:** Give an IDE coding agent an implementation-ready blueprint to turn the supplied `FitCheck.html` prototype and `FitCheck_Concept_Brief.docx` into a scalable, production-oriented fashion feedback web application.
>
> **Product tagline:** Your Fit. Your Style. Your Score.
>
> **Status:** Planning document. Do not treat any feature as implemented until it is connected, tested, and observable in the running application.

---

## 1. Executive recommendation

Build FitCheck as a **React + TypeScript frontend** and a **Python FastAPI backend**, with a modular AI pipeline. Keep the first release focused on private AI outfit analysis, saved reports, comparisons, export/share, and safe image handling. Add public community ratings, Fit Battles, challenges, affiliate features, and creator/store tools only after the core experience is validated.

### Recommended initial stack

| Layer | Recommendation | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Maintainable UI, typed API contracts, straightforward development and build |
| UI | Preserve the visual direction of the supplied HTML: warm neutral background, burgundy accent, editorial serif headings, rounded cards, responsive layout | Retains FitCheck's existing identity |
| API | Python + FastAPI + Pydantic | Async HTTP API, request validation, generated OpenAPI docs, clean separation of routes and services |
| Database | PostgreSQL | Durable users, reports, settings, quotas, audit events, and future social features |
| Database migrations | Alembic | Versioned schema changes |
| ORM | SQLAlchemy 2.x | Typed persistence layer |
| Image storage | S3-compatible object storage (e.g. AWS S3, Cloudflare R2, or MinIO in local development) | Store images outside the application container; private objects and lifecycle rules |
| Background work | Celery or Dramatiq with Redis; begin with a single worker process in development | Move slow AI inference off request workers and support retries, concurrency limits, and queue visibility |
| Cache / rate limiting | Redis | Rate limits, short-lived job state, caching where safe |
| AI inference | Provider-neutral `VisionAnalysisProvider` interface; local model first, optional hosted provider behind explicit configuration | Avoid coupling product logic to one model vendor |
| Image preprocessing | Pillow, with strict decompression limits; optionally OpenCV where justified | Decode, normalize, resize, inspect dimensions, strip metadata |
| Observability | Structured logs, metrics, traces, error reporting, health checks | Diagnose failures instead of guessing |
| Tests | pytest, HTTPX test client, React Testing Library, Playwright | Unit, API, component, and end-to-end validation |
| Deployment | Docker; separate web, API, worker, database, Redis, and object storage services | Reproducible deployment and independent scaling |

**Do not start with microservices.** Use a modular monolith with clear service boundaries. Separate API and worker processes operationally, but keep them in one repository and share versioned schemas. This is simpler to ship and can scale horizontally when measured demand requires it.

## 2. Source review: what the supplied files establish

### 2.1 Concept brief

The concept brief describes FitCheck as a fashion-focused website where users upload outfit photos, select an occasion, receive AI feedback, and optionally save or share a report. Its proposed categories are:

- Color coordination
- Styling
- Fit and proportion, only where visible
- Occasion match

The report should include a style title, an overall FitScore, category scores, what works, what could improve, and styling ideas. The brief explicitly treats scores as subjective guidance, not objective facts or attractiveness ratings.

The brief proposes a private “My Fits” gallery, compare-fits flow, shareable result cards, and a future community layer with public outfit posts, voting, Fit Battles, and daily challenges. It recommends launching with AI analysis first, keeping AI ratings distinct from community votes, and adding social features after validating the core experience.

Important product requirements from the brief:

- Feedback must be about clothing and styling, not body shaming or personal worth.
- Photos and saved reports need secure storage and clear deletion controls.
- Publishing must always be an explicit user choice.
- The product must not pretend that analysis, voting, or saving worked if the service is not connected.
- The scores and feedback need real-user evaluation.

### 2.2 Existing `FitCheck.html` prototype

The prototype already communicates a useful visual direction and user flow:

- Responsive landing page and navigation
- Upload, preview, replace, and remove
- Occasion, style, and feedback-tone preferences
- Result page with a FitScore and four category scores
- “What’s working,” improvement suggestions, and styling upgrades
- Save-to-My-Fits, report download, share, comparison, history, profile, export, and local delete affordances
- Preview-only community page
- Accessibility touches such as visible focus styles, `aria-live`, reduced-motion support, and mobile safe-area handling

However, the HTML explicitly declares itself a demo. The current `analyze()` function samples coarse image colors and generates the remaining scores using file-size arithmetic. Its text is largely fixed template text. This is not AI outfit analysis and must not be presented as such.

Other prototype limitations to address:

- State and routing are managed by a large hand-written script and hash navigation.
- `localStorage` is used for profiles and saved image thumbnails. It is not a durable, multi-device data store and can hit browser quotas.
- The save, profile, history, and compare experiences are local-only, not authenticated cloud features.
- The simulated loading stages use timers and do not represent real processing.
- There is no connected API, durable job state, user identity, authorization, persistent report database, model telemetry, or production operational monitoring.
- Image processing in the browser uses a canvas and samples pixels; this is useful for a prototype but cannot reliably judge garment coordination, silhouette, occasion suitability, or actual fit.
- Object URLs should be revoked when replaced, removed, or the component unmounts.
- All dynamic output must remain safely escaped. Avoid rendering untrusted model text through raw HTML.

**Implementation rule:** Preserve the product intent and visual identity, not the prototype's fake analysis logic or its local-only persistence as the production data layer.

---

## 3. Scope and delivery phases

### Phase 0: Engineering foundation

Deliver:

- Repository setup, code quality checks, environment configuration, Docker Compose for local development
- Typed API contract and error format
- Database migrations and health endpoints
- Authentication design and authorization tests
- Upload validation and private object storage
- CI pipeline: lint, typecheck, unit tests, API tests, dependency checks, build

Exit criteria:

- A clean checkout can be started using documented commands.
- Secrets are not committed.
- Migrations can create a fresh database.
- Liveness and readiness checks distinguish a running process from a service ready to handle traffic.

### Phase 1: MVP AI FitCheck

Deliver:

- Landing page and responsive app shell
- Image upload with preview, replacement, removal, and clear validation
- Occasion, target style, and feedback-tone preferences
- Real image analysis through a configured provider
- Structured report with scores, rationales, positive observations, improvements, styling suggestions, and uncertainty
- Private report history
- Delete report and delete image controls
- Download/share result card, with explicit confirmation before sharing any photo
- Clear privacy explanation and honest processing state
- Usage limits, abuse controls, logging, and error recovery

Out of scope for this phase:

- Public profiles
- Public image gallery
- Fit Battles and community votes
- Affiliate product recommendations
- Training custom models on user photos

### Phase 2: Product quality and personalization

- Compare two saved outfits
- Search/filter/sort My Fits
- Style preferences and user feedback on report quality
- Evaluation dataset and model-regression tests
- Better outfit segmentation and color analysis where useful
- Cost/latency dashboards and provider fallback policy
- Subscription/usage entitlement design if validated

### Phase 3: Social features

Only after explicit product approval and moderation planning:

- Opt-in public outfit posts
- Community votes separate from AI FitScore
- Fit Battles and daily challenges
- Reporting, blocking, moderation queue, abuse detection, and appeal path
- Consent/revocation, takedown, retention, and public image access controls
- Anti-spam, anti-vote-manipulation, and rate limits

### Phase 4: Commercial features

- Freemium entitlements
- Affiliate links with disclosure
- Sponsored challenges with clear labeling
- Creator/store tools
- Billing and fraud monitoring

---

## 4. AI model strategy: separate perception, reasoning, retrieval, and scoring

Do not try to make one model perform every job. FitCheck needs **visual evidence extraction**, **fashion reasoning**, and **consistent score generation**. These are related but distinct.

### 4.1 Recommended first architecture

1. **Image validation and normalization**
   - Decode safely; reject malformed or unsupported files.
   - Apply EXIF orientation, convert to RGB, cap pixel count and dimensions, and strip metadata from normalized copies.
   - Enforce upload byte limits and decompression-bomb protection.
   - Keep original files private and store normalized derivatives separately if retention is enabled.

2. **Vision-language model (primary interpretation)**
   - Receives the normalized outfit image plus the user's occasion/style preferences.
   - Produces only a strict structured candidate report: visible clothing items, observable colors, layering, accessories, visible silhouette/proportions when the image permits, and uncertainty.
   - Must be instructed not to infer identity, ethnicity, religion, health, personality, body worth, or other sensitive traits.
   - Must not invent hidden details or claim garment fit if the relevant parts are occluded or cropped.

3. **Optional deterministic computer-vision tools**
   - Use an object detector or segmentation model only if tests show it improves garment localization, color sampling, or item-specific reasoning.
   - YOLO is not a fashion stylist and generic COCO weights do not reliably identify every garment subtype. Do not add YOLO solely because it is popular.
   - A fashion-specific detector/segmenter must be evaluated on the target wardrobe, pose, lighting, skin-tone, garment, and background distribution before production use.
   - Color extraction can be a supporting signal, not a substitute for semantic outfit understanding.

4. **Rule-based score calculator**
   - Convert model evidence into the four product categories using versioned rules and explicit confidence/visibility gates.
   - Do not let the generative model freely invent arbitrary scores without a rationale.
   - Score categories only where evidence is sufficient; otherwise return `null`/“not enough visible evidence” rather than fake precision.
   - The overall FitScore should be computed deterministically from available category scores and documented weights, not from a random or hidden heuristic.
   - Include score/rubric version in every report so results can be reproduced and compared after changes.

5. **Report validation and safety checks**
   - Validate model output against Pydantic schema.
   - Reject malformed output; retry once with a constrained repair prompt if appropriate.
   - Apply content rules for body shaming, sensitive inference, unsupported claims, and unsafe recommendations.
   - Do not expose chain-of-thought or internal deliberation. Return concise, user-facing reasons grounded in visible evidence.

6. **Optional retrieval (RAG)**
   - Add retrieval only when there is a maintained style guide, internal rubric, curated styling knowledge base, or product catalog that needs to inform responses.
   - Retrieve relevant style guidance by occasion, style preference, climate/season if explicitly provided, and garment context.
   - Cite or label suggestions as general style guidance when appropriate.
   - Do not add a vector database before there is a concrete corpus and retrieval evaluation.

### 4.2 Gemma 2, EmbeddingGemma 2, and “JEC”

The phrase **“JEC” is ambiguous** in the request and is not sufficiently specified to identify a particular model or standard decision-making framework. The implementation agent must not invent a dependency called JEC. Treat it as an unresolved design term and ask the project owner what they mean before implementing it.

Important distinction:

- **Gemma 2 (core)** is a text-in/text-out model family. It is not the correct direct model for interpreting image pixels.
- **PaliGemma 2** is a Gemma-family vision-language option that accepts image and text inputs; evaluate it for visual descriptions if its task support, deployment requirements, and license/terms fit the project.
- **EmbeddingGemma 2** is an embedding model, not a generative stylist or autonomous decision-maker. It maps supported text/image/audio/video inputs into vectors for retrieval, similarity, clustering, and classification. It does not itself generate the final FitCheck report.
- As of this plan's research, Google's official EmbeddingGemma 2 model card describes a 740M-parameter multimodal model, a 768-dimensional embedding space, and Apache 2.0 licensing. Verify the exact checkpoint and model card again when implementing.
- A possible future design is a vision-language model to interpret the outfit, a rule engine to compute scores, and EmbeddingGemma 2 to retrieve similar examples or relevant passages from a curated style guide. That is not needed for the first MVP.

Official sources:
- Gemma model overview: https://ai.google.dev/gemma/docs
- Gemma 2 model card: https://gemma.ai/models/gemma-2/
- PaliGemma 2 / model family overview: https://ai.google.dev/gemma/docs/get_started
- EmbeddingGemma 2 model card: https://ai.google.dev/gemma/docs/embeddinggemma/model_card_2
- EmbeddingGemma overview: https://ai.google.dev/gemma/docs/embeddinggemma
- Ultralytics license: https://www.ultralytics.com/license

**Model-selection gate:** Do not choose the final VLM based on model name alone. Benchmark at least two candidates on a small, consented, representative outfit-image set and compare groundedness, score consistency, inference time, peak RAM/VRAM, deployment complexity, and license obligations. Prefer a provider interface so a model can be swapped without changing product code.

### 4.3 Score rubric and response contract

Keep the initial four categories from the concept brief:

- `color_coordination`
- `styling`
- `fit_proportion`
- `occasion_match`

Each category contains:
- `score`: integer 0–100 or null if not assessable
- `confidence`: low/medium/high
- `rationale`: one or two evidence-grounded sentences
- `visibility`: sufficient/partial/insufficient

Suggested rubric guidance, to be calibrated with user testing:

- Color coordination: relationship among visible garment colors, contrast, and palette cohesion. Do not assume every outfit should be neutral or match.
- Styling: visible coordination of garments, footwear, accessories, layering, and the user's selected style goal.
- Fit/proportion: only comment on visible garment drape, relative lengths, and silhouette. Do not judge the user's body. If the image crop/pose/garment makes this unreliable, return not assessable.
- Occasion match: compare visible formality and styling with the selected occasion. Treat this as contextual guidance, not a universal rule.

Overall FitScore:
- Calculate using versioned category weights.
- Initial default can be equal weights among assessable categories, clearly documented as a product choice rather than scientific truth.
- Do not silently treat a missing category as zero.
- Return a confidence summary and state that fashion is subjective.
- Avoid fake precision: a score like 78/100 is a heuristic opinion, not a measured property of the person.

Example response schema:

```json
{
  "schema_version": "1.0",
  "analysis_id": "uuid",
  "status": "completed",
  "style_title": "Clean minimalist casual",
  "overall_score": 78,
  "overall_confidence": "medium",
  "scores": {
    "color_coordination": {
      "score": 82,
      "confidence": "medium",
      "visibility": "sufficient",
      "rationale": "The visible neutral tones create a cohesive palette."
    },
    "styling": {
      "score": 76,
      "confidence": "medium",
      "visibility": "sufficient",
      "rationale": "The visible pieces create a relaxed, coordinated look."
    },
    "fit_proportion": {
      "score": null,
      "confidence": "low",
      "visibility": "insufficient",
      "rationale": "The photo does not show enough of the outfit to assess proportions."
    },
    "occasion_match": {
      "score": 80,
      "confidence": "medium",
      "visibility": "sufficient",
      "rationale": "The outfit appears compatible with the selected casual occasion."
    }
  },
  "what_works": ["..."],
  "improvements": ["..."],
  "styling_ideas": ["..."],
  "limitations": ["Fashion is subjective; fit/proportion could not be fully assessed."],
  "rubric_version": "1.0",
  "model_id": "provider/model-version"
}
```

Values above are examples only. In production the backend computes the overall score from validated category scores. Model output must not be trusted as authoritative for `analysis_id`, `status`, `rubric_version`, or `model_id`.

---

## 5. Production architecture

### 5.1 Logical topology

```text
Browser (React)
  |
  | HTTPS, short-lived access token/session
  v
Reverse proxy / ingress
  |
  v
FastAPI application replicas
  |---- Authentication / authorization
  |---- Upload presign + metadata validation
  |---- Analysis job creation and status
  |---- Reports / My Fits / compare / export
  |---- Usage limits and idempotency
  |
  +---- PostgreSQL (durable relational state)
  |
  +---- Redis (queue broker, rate limit, short-lived state)
  |
  +---- Private object storage (original and normalized images)
  |
  +---- Queue --> AI worker replicas
                   |---- image normalization
                   |---- VLM provider adapter
                   |---- optional CV tools
                   |---- schema/rubric/safety validation
                   |---- save report and job status
  |
  +---- Metrics, structured logs, traces, alerting
```

### 5.2 Synchronous vs asynchronous analysis

Use a **job-based asynchronous API** for the production path. Inference time varies by model and hardware, and web request timeouts should not control the lifecycle of an analysis.

Recommended flow:

1. Client requests an upload session or requests a presigned upload URL.
2. Backend checks authentication, quotas, file policy, and creates an upload record.
3. Browser uploads directly to private object storage using a short-lived, narrowly scoped URL, or uploads through the API in the initial local deployment.
4. Client calls `POST /api/v1/analyses` with the image ID and preferences plus an idempotency key.
5. API creates a durable `queued` analysis record and enqueues the job.
6. Worker claims the job, changes status to `processing`, performs validation and model inference, validates the result, and saves the report.
7. Client polls `GET /api/v1/analyses/{id}` or uses Server-Sent Events for progress.
8. The UI shows a completed result only after the server confirms persistence.
9. On failure, show a truthful error and a retry option; never synthesize a successful report.

For a local MVP, direct upload through FastAPI is acceptable. Keep the object-storage interface so direct-to-storage upload can be enabled without changing the domain logic.

### 5.3 Analysis job state machine

Valid states:

- `created`
- `queued`
- `processing`
- `succeeded`
- `failed`
- `cancelled`
- `expired`

Transitions must be validated server-side. Store attempt count, error code, timestamps, provider/model version, and a safe user-facing message. Use bounded retries for transient failures only. Do not retry permanent validation or policy failures. Use a dead-letter queue or failed-job table after retry exhaustion.

### 5.4 Reliability principles

- API replicas must be stateless; do not keep user sessions, job truth, or reports only in process memory.
- Use database transactions for report persistence and state transitions.
- Queue messages should be treated as at-least-once delivery. Make workers idempotent by analysis ID and attempt/version.
- Add unique constraints and idempotency keys to prevent duplicate reports and duplicate usage charges.
- Set connect/read/inference timeouts and a maximum job duration.
- Use bounded concurrency for each model/GPU; avoid unbounded queues that consume all RAM.
- Separate CPU preprocessing from GPU-heavy inference if measurement shows contention.
- Apply backpressure when the queue is saturated; return a retryable response instead of accepting unlimited work.
- Provide readiness and liveness endpoints. Readiness should include dependencies needed to serve traffic, but avoid restarting the whole service because an optional AI provider is down.
- Gracefully shut down workers: stop accepting new work, finish or safely release in-flight jobs, and allow queue redelivery.
- Use exponential backoff with jitter for transient provider/database/network failures.
- Circuit-break unhealthy external providers and optionally fail over only to a configured, tested provider.
- Never log image bytes, signed URLs, access tokens, full prompts containing private user data, or sensitive report content by default.
- Maintain a runbook for model OOM, queue backlog, storage outage, database saturation, and provider outage.

---

## 6. API contract

Prefix all APIs with `/api/v1`. Use consistent JSON errors and request IDs.

### MVP endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health/live` | Process liveness |
| `GET` | `/health/ready` | Dependency readiness |
| `POST` | `/uploads` | Create upload session or accept image |
| `GET` | `/uploads/{image_id}` | Read current user's upload metadata |
| `DELETE` | `/uploads/{image_id}` | Delete owned image and derivatives |
| `POST` | `/analyses` | Create an idempotent analysis job |
| `GET` | `/analyses/{analysis_id}` | Read job status and report when completed |
| `POST` | `/analyses/{analysis_id}/retry` | Retry an eligible failed analysis |
| `GET` | `/reports` | List current user's reports with pagination |
| `GET` | `/reports/{report_id}` | Read one owned report |
| `DELETE` | `/reports/{report_id}` | Delete a report and trigger associated image deletion policy |
| `POST` | `/reports/compare` | Compare two reports owned by the current user |
| `GET` | `/reports/{report_id}/export` | Download a report/card |
| `GET` | `/me` | Read current profile |
| `PATCH` | `/me` | Update profile/preferences |
| `POST` | `/me/export` | Request a user-data export |
| `DELETE` | `/me` | Request account deletion and related data cleanup |

For image upload, support only approved MIME types and verify actual file signatures after decoding. Do not trust filename extensions or client-supplied MIME types.

### API error format

```json
{
  "error": {
    "code": "IMAGE_TOO_LARGE",
    "message": "This image is larger than the allowed size.",
    "request_id": "uuid",
    "retryable": false
  }
}
```

Do not return Python stack traces, model internals, secrets, storage paths, or provider error payloads to users.

### Pagination and idempotency

- Use cursor pagination for reports and future community feeds.
- Require an `Idempotency-Key` for analysis creation.
- Enforce a unique constraint on `(user_id, idempotency_key)`.
- Store request hash so reusing the same key with a different payload returns a conflict.
- Apply per-user and per-IP rate limits, with stronger limits for unauthenticated uploads.

---

## 7. Data model

Use PostgreSQL with migrations. Suggested tables:

### `users`
- `id` UUID primary key
- `email_normalized` unique
- `auth_provider_subject` or identity-provider reference
- `created_at`, `updated_at`, `deleted_at`
- `status`

Do not store passwords if using a managed identity provider. If implementing passwords, use a well-reviewed password hashing scheme and established auth libraries.

### `user_preferences`
- `user_id`
- `default_occasion`
- `preferred_style`
- `feedback_tone`
- `privacy_defaults`
- timestamps

### `images`
- `id` UUID
- `owner_user_id`
- private object key, never public URL
- MIME type detected by server
- byte size, width, height, checksum
- processing status
- created/deleted timestamps
- retention policy / deletion status

### `analyses`
- `id` UUID
- `owner_user_id`
- `image_id`
- occasion, target style, feedback tone
- `status`, `attempt_count`, `error_code`
- `idempotency_key`
- model provider/model version
- rubric version
- queue/start/completion timestamps
- created/updated timestamps

### `reports`
- `id` UUID
- `analysis_id` unique
- `owner_user_id`
- schema version
- style title
- overall score nullable
- category scores and rationales in normalized columns or validated JSONB
- positive observations, improvements, styling ideas
- confidence and limitations
- created timestamp

Prefer normalized columns for fields that are queried frequently and JSONB for versioned report detail. Validate JSONB content at the application boundary.

### `audit_events`
- actor, action, target type/ID, timestamp, request ID
- minimal metadata required for security investigations
- never store raw image bytes, auth tokens, or unnecessary private content

### Future social tables
Do not build these into the MVP unless required, but plan for:
- `public_outfit_posts`
- `community_votes`
- `fit_battles`
- `challenges`
- `reports_and_moderation_cases`
- `blocks`
- `consent_events`

Community votes must be stored separately from AI scores. Use uniqueness constraints to prevent duplicate votes per user and battle.

---

## 8. Image upload, privacy, and security

### Upload pipeline

- Initial policy: JPEG, PNG, and WebP; configurable maximum byte size and pixel count.
- Verify magic bytes and decode with a maintained image library.
- Reject malformed files, animated files unless explicitly supported, unsupported formats, and decompression bombs.
- Normalize orientation and color mode; generate a resized analysis copy.
- Strip EXIF metadata, including GPS coordinates, from derivatives and shared/downloadable images unless a user explicitly chooses otherwise.
- Generate opaque random storage keys; never use the uploaded filename as a storage path.
- Store original and derivatives in private buckets/containers.
- Serve images only through authorization-checked endpoints or short-lived signed URLs.
- Set object lifecycle rules for abandoned uploads and expired temporary files.
- Protect against SSRF: do not accept arbitrary remote image URLs in the MVP.
- Keep upload size, dimensions, and decode time bounded.
- Scan dependencies and keep Pillow/system image libraries patched.

### Authorization

Every report, image, upload, profile, export, and delete request must enforce ownership on the server. Never rely on a frontend route guard alone. Add tests proving User A cannot read, modify, export, or delete User B's records by guessing IDs.

### Privacy controls

- Private by default.
- No automatic public posting.
- Clear notice of whether analysis runs locally, on the user's server, or through an external provider.
- Define retention duration before launch; delete originals and derivatives according to that policy.
- Deletion should be a tracked workflow: database tombstone, object deletion, derived artifact cleanup, cache invalidation, and retry for failed cleanup.
- Do not retain uploads for model training unless a separate, explicit opt-in is implemented.
- Provide export and account-deletion flows.
- Do not use facial identity, attractiveness, inferred sensitive traits, or body measurements as scoring targets.
- For social features, require explicit post-level consent and support revocation/takedown.

### Web security

- HTTPS in production.
- Secure, HttpOnly, SameSite cookies if cookie-based sessions are used; protect state-changing requests against CSRF.
- Tight CORS allowlist.
- Content Security Policy and secure headers.
- Validate and limit all request bodies.
- Parameterized database queries via ORM.
- Secrets from environment/secret manager, never committed to Git or baked into images.
- Dependency scanning, container image scanning, least-privilege service accounts, and periodic key rotation.
- Rate limits on login, upload, analysis, retries, exports, and future voting.
- Avoid putting private image URLs or tokens in logs/analytics.

---

## 9. AI output safety and quality

### Required guardrails

- Talk about clothing and styling, not personal worth or body shame.
- Do not infer sensitive personal attributes from appearance.
- Do not identify a person or compare identities.
- Avoid health, age, ethnicity, religion, personality, income, or other unsupported personal inferences.
- Avoid claims about garment fit when the body/outfit is cropped, obscured, or poorly lit.
- Distinguish visible facts from subjective recommendations.
- Use uncertainty and “not enough visible evidence” when appropriate.
- Do not state that an item is a specific brand or fabric unless there is adequate evidence.
- Keep styling suggestions practical, optional, and aligned with selected occasion/style preferences.
- Treat uploaded image content as untrusted input. Any text visible inside an image must not be allowed to override system instructions or backend policy.

### Output validation

- Require strict JSON / structured output from the model adapter.
- Validate score ranges and category names.
- Limit array length and text length.
- Reject NaN, infinities, unexpected keys where strict mode is enabled, HTML/script payloads, and malformed encodings.
- Escape all user-visible strings in React by default; do not use `dangerouslySetInnerHTML` for model output.
- Store model/prompt/rubric version identifiers for debugging and regression analysis.
- Add deterministic fallback behavior for a failed model, but do not present fallback text as a real analysis.

### Evaluation plan

Build a consented evaluation set with varied:
- Clothing styles, colors, and combinations
- Indoor/outdoor lighting
- Full-body and partial-body images
- Skin tones and body types, used only to test consistent garment-focused behavior, not to infer sensitive traits
- Occlusion, mirrors, cluttered backgrounds, and low-resolution inputs
- Occasion/style preferences

Use human reviewers to rate:
- Groundedness to visible garments
- Usefulness and specificity
- Tone and respectfulness
- Score/rubric consistency
- Hallucination rate
- Whether the model correctly abstains when evidence is insufficient

Track metrics by relevant image conditions and garment visibility. Do not claim the score is objectively correct; measure whether users find it consistent and useful.

---

## 10. Scalability and capacity planning

Do not choose replica counts or GPU requirements by guesswork. Benchmark the selected model on the target hardware.

### Capacity measurements to collect

- API requests per second and p50/p95/p99 latency
- Upload throughput and image sizes
- Queue depth and queue wait time
- Inference latency and throughput per worker
- Peak CPU RAM and GPU VRAM per worker
- Model cold-start time
- Failure rate by error class
- Provider latency/error rate (if external)
- Storage growth and deletion backlog
- Cost per successful analysis

### Scaling approach

- Scale API replicas horizontally; keep them stateless.
- Scale inference workers independently from API replicas.
- Use per-model concurrency limits and separate queues if multiple models have different hardware needs.
- Autoscale workers using queue depth, oldest-job age, and utilization, with maximum bounds.
- Set per-user quotas to prevent one user from exhausting capacity.
- Use a bounded queue and reject or defer work when capacity is exhausted.
- Cache only safe, non-sensitive artifacts. Do not globally cache private report responses across users.
- Add CDN caching only for public static assets; never make private user images public for performance.
- Use connection pooling for PostgreSQL and monitor pool saturation.
- Add database indexes based on actual query plans: owner + created time, analysis status + queued time, and relevant foreign keys.
- Use retention and lifecycle rules to keep image storage from growing indefinitely.
- Introduce read replicas, sharding, or separate services only when monitoring proves they are needed.

### Degraded-mode behavior

| Failure | Expected behavior |
|---|---|
| AI provider/model unavailable | Mark job retryable or failed; show honest status; preserve upload until retention policy applies |
| Queue unavailable | Reject new analysis with retryable error or use a carefully bounded fallback; never report success |
| Object storage unavailable | Do not accept analysis that cannot reliably access the image |
| Database unavailable | Fail readiness and return controlled errors; do not claim reports were saved |
| Worker OOM | Worker restarts; job is safely retried with bounded attempts; alert on repeated OOM |
| Invalid model output | Validate, optionally repair once, then fail safely or return a clearly labeled partial result |
| Rate limit exceeded | Return HTTP 429 with retry guidance |
| Delete operation partially fails | Keep deletion status and retry cleanup; do not falsely claim complete deletion |

---

## 11. Observability and operations

### Structured logging

Every request/job should carry:
- `request_id`
- `analysis_id` when applicable
- anonymized or internal `user_id`
- route/job name
- status, duration, error code
- provider/model version

Never log image bytes, authentication secrets, full signed URLs, or unnecessary prompt/report content.

### Metrics and alerts

Minimum metrics:
- request count, latency, and HTTP errors
- job counts by state
- queue wait time and oldest queued job
- inference duration and error rate by model version
- worker CPU/RAM/VRAM and restarts
- database connections, slow queries, pool exhaustion
- object storage failures and deletion backlog
- rate-limit triggers and suspicious upload patterns

Alerts:
- API error rate above threshold
- p95 analysis latency above SLO
- queue age/backlog above threshold
- repeated model OOM
- database connection exhaustion
- object storage failures
- deletion backlog growing
- unusual cost or per-user usage spikes

Add a runbook for each alert. Health endpoints alone are not observability.

### SLO targets

Choose initial targets after measuring the first deployment. Candidate targets for the MVP:
- API availability target: 99.5% monthly, excluding planned maintenance if policy allows.
- Upload/API metadata requests: p95 under 500 ms under agreed test load.
- Analysis completion: define a target after measuring model/hardware, and report queue wait separately from inference time.
- Deletion: define and monitor a maximum cleanup completion window.
- No successful UI state until the server confirms durable completion.

These are proposed targets, not claims about current performance.

---

## 12. Frontend migration plan

Refactor the single HTML file into typed, testable React components. Keep the visual language while removing fake data and global mutable state.

Suggested structure:

```text
frontend/
  src/
    app/
      App.tsx
      router.tsx
      queryClient.ts
    components/
      layout/
      ui/
      upload/
      analysis/
      reports/
    features/
      auth/
      fitcheck/
      my-fits/
      compare/
      profile/
    services/
      apiClient.ts
      uploads.ts
      analyses.ts
      reports.ts
    schemas/
      analysis.ts
      apiErrors.ts
    hooks/
    styles/
    test/
```

Suggested pages:
- Home
- AI FitCheck
- Analysis progress/result
- My Fits
- Compare Fits
- History
- Profile/privacy
- Sign-in/sign-up
- Community placeholder with clear “not live” status until implemented

Frontend rules:
- Use React Query/TanStack Query or an equivalent server-state library for API state, retries, cache invalidation, and pagination.
- Use React Hook Form or controlled components for forms; validate user input.
- Do not store the full image or report history in localStorage.
- A small preference such as a theme can use localStorage; private reports must come from the API.
- Use a state machine or explicit job status enum for upload/analysis UX.
- Provide cancel/retry actions only where the backend supports them.
- Revoke object URLs and abort in-flight requests when the user removes an image or leaves the flow.
- Use accessible labels, keyboard support, focus management, loading announcements, and reduced-motion behavior.
- Provide honest demo state if AI credentials/model are not configured; do not silently use sample results.

### Suggested UI states

`idle → file_selected → uploading → queued → processing → succeeded`

Failure paths:
- `invalid_file`
- `upload_failed`
- `analysis_failed_retryable`
- `analysis_failed_permanent`
- `cancelled`
- `expired`

Show meaningful recovery instructions for each failure. Avoid fake progress percentages unless progress is actually available from the backend.

---

## 13. Backend repository structure

```text
backend/
  app/
    main.py
    core/
      config.py
      logging.py
      security.py
      errors.py
    api/
      v1/
        routes/
          health.py
          uploads.py
          analyses.py
          reports.py
          users.py
    schemas/
      upload.py
      analysis.py
      report.py
      user.py
    models/
      user.py
      image.py
      analysis.py
      report.py
    repositories/
    services/
      upload_service.py
      analysis_service.py
      report_service.py
      deletion_service.py
      scoring_service.py
      safety_service.py
    ai/
      base.py
      providers/
        local_vlm.py
        hosted_vlm.py
      prompts/
      output_validation.py
    workers/
      tasks.py
    storage/
      base.py
      s3_storage.py
      local_storage.py
    db/
      session.py
      migrations/
    tests/
      unit/
      integration/
      security/
  Dockerfile
  requirements.txt
```

Interfaces should be defined for:
- `ObjectStorage`
- `VisionAnalysisProvider`
- `JobQueue`
- `ScoringService`
- `ReportRepository`

This keeps provider-specific code out of API routes.

---

## 14. Testing strategy

### Unit tests
- File validation and size/dimension limits
- EXIF normalization and metadata stripping
- Score calculations, missing categories, and rubric versioning
- Output schema validation and unsafe-content checks
- State transition rules
- Idempotency behavior
- Deletion orchestration and retry behavior

### API/integration tests
- Upload → analysis job → worker → report persistence
- User A cannot access User B's image/report/export
- Duplicate analysis requests do not duplicate charges/reports
- Retry and cancellation behavior
- Queue/database/storage failures return controlled errors
- Report deletion eventually deletes private image objects
- API schema and version compatibility

### Frontend tests
- Upload, preview, replace, remove
- Loading/queued/processing/success/error states
- Result rendering when a score is unavailable
- Delete and export flows
- Accessibility and responsive layout
- No fake success when the API is down

### End-to-end tests
- New user signs in, uploads outfit, selects occasion, receives report, saves it, views history, compares reports, deletes a report.
- Test with model mocked for deterministic CI; run a smaller real-model smoke suite separately.
- Verify that a failed AI request never creates a fake successful result.

### Load and resilience tests
- Sustained and burst uploads
- Queue saturation and backpressure
- Worker restart during a job
- Slow provider, timeout, and provider outage
- Database connection pool saturation
- Storage outage and recovery
- Large/malformed image attack cases
- Repeated retries and idempotency races

---

## 15. CI/CD and deployment

### Local development

Use Docker Compose for:
- `frontend`
- `api`
- `worker`
- `postgres`
- `redis`
- `minio` (local S3-compatible storage)

AI model weights may be mounted/cached separately and should not be copied into the frontend bundle unless a deliberate browser-inference architecture is chosen.

### CI pipeline
1. Format and lint.
2. Typecheck frontend.
3. Run frontend unit tests.
4. Run Python lint/type checks and unit tests.
5. Run API integration/security tests.
6. Run dependency and container scans.
7. Build frontend and container images.
8. Validate database migrations.
9. Deploy to staging.
10. Run smoke tests and model-health checks.
11. Promote to production with rollback capability.

### Production deployment
- Pin dependency versions and base image versions.
- Use non-root containers and read-only filesystems where practical.
- Set CPU/memory limits and requests.
- Keep secrets in a secret manager.
- Back up PostgreSQL and test restoration.
- Enable object-storage versioning/retention only where consistent with privacy/deletion requirements.
- Deploy migrations in a backward-compatible expand/migrate/contract sequence.
- Use rolling or blue-green deployments; keep rollback instructions.
- Separate dev, staging, and production data and credentials.
- Document disaster recovery, backup RPO/RTO, and model-weight restoration.

---

## 16. Definition of done for MVP

The MVP is not done until all of these are true:

- [ ] Real image analysis is connected; no fake score logic remains in production.
- [ ] The four score categories and their rubric are documented and versioned.
- [ ] Insufficient visibility results in an honest abstention, not a fabricated score.
- [ ] Upload validation and private storage are enforced server-side.
- [ ] Authentication and object-level authorization tests pass.
- [ ] Reports are persisted in PostgreSQL and do not depend on browser localStorage.
- [ ] Save, delete, export, and share actions reflect actual server outcomes.
- [ ] Delete workflow cleans up object storage and retries failures.
- [ ] Analysis jobs are idempotent and have bounded retries/timeouts.
- [ ] Queue backpressure and rate limits are enabled.
- [ ] Model/provider failure is displayed honestly.
- [ ] Observability dashboards and actionable alerts exist.
- [ ] Load, security, privacy, and accessibility checks pass.
- [ ] User-facing copy explains that FitScore is subjective style guidance.
- [ ] No public sharing occurs without explicit user action.
- [ ] Model license and all dependency licenses have been reviewed.

---

## 17. Implementation sequence for the IDE agent

Implement in this order, keeping each step buildable:

1. Inspect the repository and existing HTML; record current files before modifying them.
2. Create the React/TypeScript frontend and FastAPI backend skeleton.
3. Add configuration validation, structured errors, logging, health endpoints, and Docker Compose.
4. Add PostgreSQL, SQLAlchemy, Alembic, and initial schema.
5. Add authentication integration and object-level authorization before private report endpoints.
6. Add local object storage abstraction and robust image validation.
7. Add upload API and frontend upload state machine.
8. Define the Pydantic report schema and versioned scoring rubric.
9. Implement the `VisionAnalysisProvider` interface and a local VLM adapter.
10. Benchmark candidate VLMs on consented outfit images; do not select a model without quality, latency, memory, and license results.
11. Implement structured output validation, safety checks, and deterministic score calculation.
12. Add queue/worker job lifecycle, idempotency, bounded retries, and timeout handling.
13. Connect the frontend to real analysis jobs and reports; remove simulated timers and fake `analyze()` behavior.
14. Implement My Fits, delete, compare, export, and profile preferences against the API.
15. Add observability, quotas, rate limits, deployment hardening, and runbooks.
16. Run functional, security, load, privacy, accessibility, and real-model evaluation suites.
17. Deploy to staging, conduct a small user pilot, review report quality, then launch the MVP.
18. Only after validation, plan community features and moderation separately.

### Agent execution rules

- Do not rewrite the whole project in one giant commit.
- Before editing, inspect package versions, runtime versions, and existing deployment constraints.
- Keep a short `DECISIONS.md` with architectural decisions and trade-offs.
- Update tests with each behavior change.
- Do not claim tests passed unless they were actually run.
- Do not introduce “JEC” as a package or framework until the project owner clarifies the intended meaning.
- Do not add a vector database or embeddings to the critical path without a retrieval use case and evaluation.
- Keep model, prompt, rubric, and API schema versions explicit.
- Never silently substitute demo data for a failed AI provider.

---

## 18. Research references

These links are the starting points for implementation research. Re-check current model cards, supported runtimes, hardware requirements, and license text at the time of implementation.

- FitCheck concept source: `FitCheck_Concept_Brief.docx` supplied by the project owner.
- FitCheck UI prototype: `FitCheck.html` supplied by the project owner.
- Google Gemma overview: https://ai.google.dev/gemma/docs
- Gemma 2 model card: https://gemma.ai/models/gemma-2/
- Gemma family / PaliGemma 2 overview: https://ai.google.dev/gemma/docs/get_started
- EmbeddingGemma 2 model card: https://ai.google.dev/gemma/docs/embeddinggemma/model_card_2
- EmbeddingGemma overview: https://ai.google.dev/gemma/docs/embeddinggemma
- Ultralytics license: https://www.ultralytics.com/license
- FastAPI documentation: https://fastapi.tiangolo.com/
- SQLAlchemy documentation: https://docs.sqlalchemy.org/
- Alembic documentation: https://alembic.sqlalchemy.org/
- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- OWASP API Security Top 10: https://owasp.org/www-project-api-security/
- React documentation: https://react.dev/
- PostgreSQL documentation: https://www.postgresql.org/docs/

---

## Final architecture decision

**Build a modular monolith with React + TypeScript, FastAPI, PostgreSQL, Redis-backed background jobs, and private S3-compatible image storage. Use a vision-language model for image-grounded outfit interpretation, a versioned deterministic scoring service for FitScore, and optional EmbeddingGemma 2 only when there is a real retrieval/search use case.**

This architecture is deliberately production-minded without prematurely splitting the product into many microservices. It supports honest failure handling, privacy controls, measurable model quality, and independent scaling of web/API and inference workloads.
