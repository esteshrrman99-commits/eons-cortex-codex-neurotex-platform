# EONS M21 — Synthetic provenance and tax-rule version gates

**Development-only proposal. No production deployment or data ingestion.**

The M21 module adds a browser-compatible, dependency-free metadata fingerprint function, an evidence-reference gate for M18 provisional reconciliation candidates, and a versioned tax-rule **metadata** gate. It includes an accessible mobile-first demonstration page and Node's built-in test suite.

## Safety boundaries

- No uploads, outbound API requests, browser storage, taxpayer data, bank credentials, tax computations, filing, payment processing, or external source verification.
- All public examples are invented. SHA-256 values in the demo are placeholders, not hashes of real documents.
- A metadata SHA-256 fingerprint is **not** evidence authenticity, a trusted timestamp, a digital signature, or chain-of-custody proof. Even when evidence references exist, posting and reviewer approval remain `false`.
- Tax-rule entries contain only version metadata (jurisdiction, tax year, effective dates, source URL, retrieval timestamp, and review status). A `reviewed` metadata status never authorizes calculation or filing. No rates or statutory interpretations are encoded.
- Unknown fields are rejected to discourage accidental entry of personal information. This is not a substitute for server-side access control, privacy review, or qualified tax/legal review.

## Test and review

Run from the repository root:

```sh
npm run test:eons
```

Review the M18 reconciliation candidate behavior and M21 evidence reference gate together. No automatic ledger posting is implemented. Validate the new page at narrow mobile widths, with keyboard navigation and a screen reader, before merging. Do not run `npm run build` on the production checkout: it overwrites the existing M17 `docs/` design.

## Future prerequisites

Qualified reviewers must verify actual authority and tax-year applicability, approve a documented version-release workflow, establish provenance custody and retention policies, and design authenticated private storage before real customer records can ever be accepted. This PR does none of those operations.

## M21.1 security and accessibility hardening (2026-11-01)

- The reconciliation evidence bridge rejects duplicate normalized bank/ledger IDs, orphaned or repeated candidate matches, non-candidate statuses, malformed evidence IDs, and oversized arrays. It still **never** authorizes posting.
- The standalone demonstration page now uses external scripts and CSS with a document-level Content Security Policy: `connect-src 'none'`, `script-src 'self'`, `style-src 'self'`, `form-action 'none'`, and `object-src 'none'`. No inline script or stylesheet is required.
- The CSP meta tag is defense-in-depth, **not** a substitute for server-set HTTP CSP, `frame-ancestors`, `X-Content-Type-Options`, or a reviewed hosting configuration.
- Five additional synthetic Node regression/smoke tests were added (20 tests total by test declarations); `npm run test:eons` runs the committed suite. The new smoke checks cover external scripts, the mobile viewport, keyboard skip link, live regions, and absence of input fields.
- A V8 source-level smoke check passed 9/9 checks against fetched GitHub files. This is **not** a substitute for executing the full committed Node test runner or browser accessibility testing.

### Release gates still open

Run `npm run test:eons` against the actual GitHub checkout; review the static page with keyboard, 320px mobile viewport, and a screen reader; verify effective HTTP headers and CSP in the deployed hosting stack; keep M17 live `docs/` unchanged. The M20 signed deployment pipeline is a separate draft PR and is not production-certified.
