'use strict';
/**
 * Fail-closed tax-rule registry. Rules are reference metadata, not executable tax
 * advice. Approval requires independent, recorded professional review.
 */
function selectApprovedRule(manifest, { jurisdiction, taxYear, ruleId }) {
  if (!manifest || manifest.schema_version !== 1 || !Array.isArray(manifest.rules))
    throw new TypeError('Unsupported tax rule manifest');
  if (!/^[A-Z]{2}(?:-[A-Z]{2})?$/.test(jurisdiction || '') ||
      !Number.isInteger(taxYear) || taxYear < 1900 || taxYear > 2200 ||
      typeof ruleId !== 'string' || !ruleId)
    throw new TypeError('Invalid rule selection');
  const candidates = manifest.rules.filter(rule =>
    rule && rule.id === ruleId && rule.jurisdiction === jurisdiction && rule.tax_year === taxYear);
  if (candidates.length !== 1) return null; // duplicates fail closed
  const rule = candidates[0];
  if (rule.status !== 'approved' || !/^[0-9]+\.[0-9]+\.[0-9]+$/.test(rule.version || '') ||
      typeof rule.source_url !== 'string' || !/^https:\/\//.test(rule.source_url) ||
      typeof rule.reviewer_id !== 'string' || !rule.reviewer_id.trim() ||
      typeof rule.reviewed_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(rule.reviewed_at))
    return null;
  return Object.freeze({ id: rule.id, jurisdiction: rule.jurisdiction,
    tax_year: rule.tax_year, version: rule.version, source_url: rule.source_url,
    reviewed_at: rule.reviewed_at, status: 'approved_metadata_only' });
}
module.exports = { selectApprovedRule };
