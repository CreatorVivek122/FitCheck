# FitCheck: Architectural Decisions & Design Tradeoffs (ADR)

## ADR 1: Modular Monolith vs. Microservices
- **Decision:** Build FitCheck as a modular monolith pairing a React + TypeScript frontend with a Python FastAPI backend, sharing typed contracts.
- **Why:** Avoids operational overhead of distributed microservices while maintaining clean domain boundaries (core, db, models, schemas, services, ai providers, routes). Allows independent scaling of API workers and future queue workers.

## ADR 2: Dual Vision Pipeline (Gemini VLM + Local CV & Fashion Heuristics)
- **Decision:** Implement a provider-agnostic `VisionAnalysisProvider` interface with two robust implementations:
  1. `GeminiVisionProvider`: High-precision multimodal analysis via `google-genai` and `gemini-2.5-flash` when `GEMINI_API_KEY` is present.
  2. `LocalHeuristicVisionProvider`: Self-contained Computer Vision analyzer (using Pillow quantization, luminance balance, color harmony calculations, and aspect ratio inspection) as an intelligent fallback.
- **Why:** Guarantees that local development, automated testing, and CI suites execute deterministically without external API costs or internet dependency, while allowing zero-friction upgrade to Gemini multimodal intelligence simply by providing an API key in `.env`.

## ADR 3: Deterministic Scoring Rubric (v1.0)
- **Decision:** Category scores (Color Coordination, Styling, Fit/Proportion, Occasion Match) are normalized and clamped (0-100). The overall FitScore is calculated via a documented, deterministic weighted formula.
- **Crucial Rule:** If garment proportions cannot be evaluated due to camera crop, the score is set to `null` rather than penalizing the user with a 0. Weights are dynamically re-allocated across assessable pillars.

## ADR 4: Safety & Ethical AI Guardrails
- **Decision:** Implement strict safety filters rejecting body-shaming, weight critiques, physical shape judgments, or personal identity inferences.
- **Why:** Fashion feedback must focus exclusively on visible clothing, color harmony, drape, layering, and occasion suitability.

## ADR 5: Privacy-First Storage Abstraction
- **Decision:** Direct upload and storage are isolated behind opaque UUID keys. EXIF metadata (GPS, device tags) is automatically stripped upon upload. Original filenames are never stored or exposed.
- **Why:** User outfit photos remain strictly private by default, with complete one-click deletion and JSON data export controls.

