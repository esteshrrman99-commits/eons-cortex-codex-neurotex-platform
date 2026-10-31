# EONS M21 — Synthetic provenance and tax-rule version gates

**Development-only proposal. No production deployment or data ingestion.**

The M21 module adds a browser-compatible, dependency-free metadata fingerprint function, an evidence-reference gate for M18 provisional reconciliation candidates, and a versioned tax-rule **metadata** gate. It includes an accessible mobile-first demonstration page and Node's built-in test suite.

## Safety boundaries

- No uploads, network requests, browser storage, taxpayer data, bank credentials, tax computations, filing, payment processing, or external source verification.
- All public examples are invented. SHA-256 values in the demo are placeholders, not hashes of real documents.
- A metadata SHA-256 fingerprint is **not** evidence authenticity, a trusted timestamp, a digital signature, or chain-of-custody proof. Even when evidence references exist, posting and reviewer approval remain `false`.
- Tax-rule entries contain only version metadata (jurisdiction, tax year, effective dates, source URL, retrieval timestamp, and review status). A `reviewed` metadata status never authorizes calculation or filing. No rates or statutory interpretations are encoded.
- Unknown fields are rejected to discourage accidental entry of personal information. This is not a substitute for server-side access control, privacy review, or qualified tax/legal review.

## Test and review

Run from the repository root:

```sh
node --test tests/m21-evidence.test.cjs
```

Review the M18 reconciliation candidate behavior and M21 evidence reference gate together. No automatic ledger posting is implemented. Validate the new page at narrow mobile widths, with keyboard navigation and a screen reader, before merging. Do not run `npm run build` on the production checkout: it overwrites the existing M17 `docs/` design.

## Future prerequisites

Qualified reviewers must verify actual authority and tax-year applicability, approve a documented version-release workflow, establish provenance custody and retention policies, and design authenticated private storage before real customer records can ever be accepted. This PR does none of those operations.
