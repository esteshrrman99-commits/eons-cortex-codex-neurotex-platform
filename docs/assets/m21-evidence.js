/* EONS M21 — synthetic-only provenance metadata and version-review gates. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EonsEvidence = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MAX_ITEMS = 2000;
  const ID = /^[A-Z0-9][A-Z0-9-]{0,63}$/;
  const HEX = /^[a-f0-9]{64}$/;
  const DAY = /^\d{4}-\d{2}-\d{2}$/;
  const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
  const TYPES = new Set(['bank_statement', 'ledger_export', 'invoice', 'receipt']);
  const REVIEW = new Set(['draft', 'review_pending', 'reviewed']);
  function fail(message) { throw new TypeError(message); }
  function assertId(value, name) {
    if (typeof value !== 'string' || !ID.test(value)) fail(name + ' must be an uppercase synthetic reference');
    return value;
  }
  function exactDay(value) {
    if (typeof value !== 'string' || !DAY.test(value)) fail('Invalid ISO date');
    const d = new Date(value + 'T00:00:00Z');
    if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== value) fail('Invalid calendar date');
    return value;
  }
  function exactUtc(value) {
    if (typeof value !== 'string' || !UTC.test(value)) fail('Timestamp must be UTC to seconds');
    const d = new Date(value);
    if (!Number.isFinite(d.getTime()) || d.toISOString().replace('.000Z', 'Z') !== value) fail('Invalid UTC timestamp');
    return value;
  }
  function keysOnly(obj, allowed) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) fail('Expected metadata object');
    if (Object.keys(obj).some(k => !allowed.includes(k))) fail('Unexpected metadata field; do not submit personal data');
  }
  function evidenceMetadata(item) {
    const keys = ['id', 'sourceType', 'sourceSha256', 'sourceRef', 'capturedAt'];
    keysOnly(item, keys);
    const id = assertId(item.id, 'Evidence ID');
    const sourceRef = assertId(item.sourceRef, 'Source reference');
    if (!TYPES.has(item.sourceType)) fail('Unsupported evidence source type');
    if (typeof item.sourceSha256 !== 'string' || !HEX.test(item.sourceSha256)) fail('Invalid source SHA-256');
    const capturedAt = exactUtc(item.capturedAt);
    return { id, sourceType: item.sourceType, sourceSha256: item.sourceSha256, sourceRef, capturedAt };
  }
  function evidenceRegistry(items) {
    if (!Array.isArray(items) || items.length > MAX_ITEMS) fail('Evidence registry exceeds limit');
    const ids = new Set();
    return items.map(item => {
      const e = evidenceMetadata(item);
      if (ids.has(e.id)) fail('Duplicate evidence ID');
      ids.add(e.id);
      return e;
    }).sort((a, b) => a.id.localeCompare(b.id));
  }
  async function metadataFingerprint(item) {
    const canonical = JSON.stringify(evidenceMetadata(item));
    const bytes = new TextEncoder().encode('EONS-EVIDENCE-METADATA-V1\n' + canonical);
    let subtle = globalThis.crypto && globalThis.crypto.subtle;
    if (!subtle && typeof require === 'function') subtle = require('node:crypto').webcrypto.subtle;
    if (!subtle) fail('Secure cryptographic hashing is unavailable');
    const hash = new Uint8Array(await subtle.digest('SHA-256', bytes));
    return Object.freeze({ metadataSha256: Array.from(hash, x => x.toString(16).padStart(2, '0')).join(''),
      sourceAuthenticityVerified: false, chainOfCustodyVerified: false, reviewRequired: true });
  }
  function candidateEvidence(reconciliation, bankRows, ledgerRows, evidence) {
    if (!reconciliation || reconciliation.mode !== 'DEMONSTRATION_ONLY' || !Array.isArray(reconciliation.matches) ||
        reconciliation.matches.length > MAX_ITEMS) fail('Only bounded demonstration reconciliation results are supported');
    const registry = new Set(evidenceRegistry(evidence).map(e => e.id));
    function references(rows, label) {
      if (!Array.isArray(rows) || rows.length > MAX_ITEMS) fail(label + ' rows must be a bounded array');
      const byId = new Map();
      for (const row of rows) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) fail('Invalid ' + label + ' row');
        // Match the M18 engine's row-ID normalization; never silently overwrite a duplicate.
        const id = String(row.id || '').trim();
        if (!id || id.length > 120 || byId.has(id)) fail('Invalid or duplicate ' + label + ' row ID');
        const ref = row.evidence_id == null ? '' : row.evidence_id;
        if (typeof ref !== 'string' || (ref && !ID.test(ref))) fail('Invalid ' + label + ' evidence reference');
        byId.set(id, ref);
      }
      return byId;
    }
    const bank = references(bankRows, 'bank');
    const ledger = references(ledgerRows, 'ledger');
    const usedBank = new Set();
    const usedLedger = new Set();
    return reconciliation.matches.map(match => {
      if (!match || typeof match.bankId !== 'string' || typeof match.ledgerId !== 'string' ||
          match.status !== 'candidate' || !bank.has(match.bankId) || !ledger.has(match.ledgerId) ||
          usedBank.has(match.bankId) || usedLedger.has(match.ledgerId)) {
        fail('Invalid or duplicated reconciliation candidate');
      }
      usedBank.add(match.bankId);
      usedLedger.add(match.ledgerId);
      const bankEvidence = bank.get(match.bankId);
      const ledgerEvidence = ledger.get(match.ledgerId);
      const referencesPresent = !!bankEvidence && !!ledgerEvidence &&
        registry.has(bankEvidence) && registry.has(ledgerEvidence);
      return { bankId: match.bankId, ledgerId: match.ledgerId,
        evidenceStatus: referencesPresent ? 'metadata_references_present_not_verified' : 'missing_evidence_metadata',
        reviewerApproved: false, postingAuthorized: false };
    });
  }
  function ruleMetadata(item) {
    const keys = ['ruleId', 'jurisdiction', 'taxYear', 'version', 'sourceUrl', 'retrievedAt', 'effectiveFrom', 'effectiveThrough', 'reviewStatus'];
    keysOnly(item, keys);
    const ruleId = assertId(item.ruleId, 'Rule ID');
    const jurisdiction = assertId(item.jurisdiction, 'Jurisdiction');
    if (!Number.isInteger(item.taxYear) || item.taxYear < 1900 || item.taxYear > 2100) fail('Invalid tax year');
    if (typeof item.version !== 'string' || !/^[0-9]+\.[0-9]+\.[0-9]+$/.test(item.version)) fail('Version must be semver numeric');
    if (typeof item.sourceUrl !== 'string' || item.sourceUrl.length > 500) fail('Invalid source URL');
    let url;
    try { url = new URL(item.sourceUrl); } catch (_) { fail('Invalid source URL'); }
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname) fail('Source URL must be HTTPS without credentials');
    const retrievedAt = exactUtc(item.retrievedAt);
    const effectiveFrom = exactDay(item.effectiveFrom);
    const effectiveThrough = exactDay(item.effectiveThrough);
    if (effectiveThrough < effectiveFrom) fail('Inverted effective dates');
    if (!REVIEW.has(item.reviewStatus)) fail('Invalid review status');
    return { ruleId, jurisdiction, taxYear: item.taxYear, version: item.version,
      sourceUrl: url.href, retrievedAt, effectiveFrom, effectiveThrough, reviewStatus: item.reviewStatus };
  }
  function taxRuleGate(entries, request) {
    if (!Array.isArray(entries) || entries.length > MAX_ITEMS) fail('Tax rule registry exceeds limit');
    keysOnly(request, ['jurisdiction', 'taxYear', 'asOf']);
    const jurisdiction = assertId(request.jurisdiction, 'Jurisdiction');
    if (!Number.isInteger(request.taxYear) || request.taxYear < 1900 || request.taxYear > 2100) fail('Invalid tax year');
    const asOf = exactDay(request.asOf);
    const seen = new Set();
    const normalized = entries.map(item => {
      const entry = ruleMetadata(item);
      const key = entry.jurisdiction + '/' + entry.taxYear + '/' + entry.ruleId + '/' + entry.version;
      if (seen.has(key)) fail('Duplicate tax rule version');
      seen.add(key);
      return entry;
    });
    const candidates = normalized.filter(e => e.jurisdiction === jurisdiction && e.taxYear === request.taxYear &&
      e.effectiveFrom <= asOf && asOf <= e.effectiveThrough);
    return Object.freeze({ mode: 'METADATA_ONLY', matches: candidates.length,
      reviewStatus: candidates.length === 1 ? candidates[0].reviewStatus : 'unresolved',
      reason: candidates.length === 0 ? 'no_applicable_version' : candidates.length > 1 ? 'ambiguous_versions' : 'metadata_not_tax_authority',
      calculationAuthorized: false, filingAuthorized: false, legalConclusionProvided: false });
  }
  return Object.freeze({ evidenceMetadata, evidenceRegistry, metadataFingerprint, candidateEvidence, ruleMetadata, taxRuleGate });
});
