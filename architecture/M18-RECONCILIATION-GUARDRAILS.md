# EONS M18 — Conservative Reconciliation and Evidence Foundations

## Scope
This milestone adds an **isolated synthetic-data demonstration**, a reusable USD transaction candidate-matching library, SHA-256 evidence-byte hashing helpers, an empty tax-rule metadata registry, and automated Node.js tests. It does **not** enable tax filing, payments, bank connections, public uploads, or taxpayer account storage.

## Critical live/source divergence
The verified M17 website was modified **in place** at `/opt/eons-tax-platform/source/docs` by M15–M17 installers. The GitHub `public/` and `docs/` files are a separate baseline; `scripts/build.js` deletes and recreates `docs/` from `public/`. A naive production `npm run build` followed by copying `docs/` would remove the live cinematic additions and possibly deployed-only dashboard pages. **Do not run a full production rebuild or overwrite the deployed `docs/` until a production/source reconciliation audit has been performed.**

## Safe deployment approach
1. Audit live file inventory and checksums, including files absent from the repository; preserve the current M17 backup and capture a fresh timestamped backup.
2. Compare live and source page routes and all referenced assets; confirm dashboard and authentication endpoints.
3. For M18 preview, deploy only new additive files `assets/m18-reconciliation.js` and `pages/reconciliation-lab.html` after checks, not the entire `docs/` directory.
4. Add a navigation link only after confirming the live homepage structure; avoid replacing existing header, hero, or scripture.
5. Validate HTTP 200, JavaScript console, mobile keyboard navigation, reduced-motion mode, and no private data leakage. Roll back if any checks fail.

## Reconciliation contract
- USD amounts must be **strings** with at most two decimal places. Binary floating-point inputs, unsupported currencies, duplicate IDs, malformed dates, and unsafe cent magnitudes are rejected.
- Matching uses identical signed cents, a configurable date window (0–30 days), and compatible references. Unique exact reference matches outrank candidates with missing references.
- Candidate pairs require reciprocal uniqueness. Duplicate-amount ambiguity is surfaced, never silently forced into a match.
- All results remain `candidate` and `externallyVerified: false`. Even with evidence IDs present, human review and verification of source records are required.
- The demonstration is client-side with synthetic records only; no network requests, file uploads, or persistent browser storage.

## Evidence and tax rules
- `src/evidence-provenance.js` computes SHA-256 on raw bytes in memory; it stores nothing and makes **no authenticity claim**. A hash cannot prove a record is genuine, nor does it anonymize a sensitive document.
- `rules/registry.json` intentionally starts empty. `src/tax-rule-registry.js` returns no enabled rule without a unique, explicitly approved, sourced, reviewed version. Its output is metadata only; there is no tax calculation engine.
- Production tax logic requires independently validated federal/state rules, effective dates, professional review, regression fixtures, access control, audit logging, and an explicit release gate.

## Testing
`node --test tests/m18-*.test.js` runs deterministic unit tests without third-party packages. CI additionally runs the static build and verifies the new demo assets. CI has read-only repository permission and no production deployment step.

## Release gate
Do not enable financial data ingestion, filing, payment collection, or automated tax positions on this milestone. Authentication, authorization, encrypted storage, privacy policy, data retention, threat modeling, and professional validation are separate prerequisites.
