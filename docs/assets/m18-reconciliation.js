(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EonsReconciliation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MAX_ROWS = 2000;
  function fail(message) { throw new TypeError(message); }
  function cents(value) {
    if (typeof value !== 'string' || !/^-?(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value))
      fail('Amount must be a decimal string with at most two fractional digits');
    const negative = value[0] === '-';
    const digits = negative ? value.slice(1) : value;
    const parts = digits.split('.');
    const abs = BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0'));
    const signed = negative ? -abs : abs;
    if (signed > BigInt(Number.MAX_SAFE_INTEGER) || signed < -BigInt(Number.MAX_SAFE_INTEGER))
      fail('Amount exceeds safe integer cents');
    return Number(signed);
  }
  function isoDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
      fail('Date must be YYYY-MM-DD');
    const [year, month, day] = value.split('-').map(Number);
    const epoch = Date.UTC(year, month - 1, day);
    const d = new Date(epoch);
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day)
      fail('Invalid calendar date');
    return epoch / 86400000;
  }
  function normalize(records, label) {
    if (!Array.isArray(records) || records.length > MAX_ROWS) fail(label + ' must be an array of at most ' + MAX_ROWS + ' records');
    const ids = new Set();
    return records.map((row, index) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) fail(label + '[' + index + '] must be an object');
      const id = String(row.id || '').trim();
      if (!id || id.length > 120) fail(label + '[' + index + '] invalid id');
      if (ids.has(id)) fail(label + ' contains duplicate id: ' + id);
      ids.add(id);
      const currency = row.currency || 'USD';
      if (currency !== 'USD') fail('Only USD is supported; no FX assumptions');
      const reference = row.reference == null ? '' : String(row.reference).trim().toUpperCase();
      const evidenceId = row.evidence_id == null ? '' : String(row.evidence_id).trim();
      if (reference.length > 120 || evidenceId.length > 120) fail('Reference length exceeds limit');
      return { id, day: isoDay(row.date), date: row.date, amountCents: cents(row.amount),
        currency, reference, evidenceId };
    }).sort((a, b) => a.id.localeCompare(b.id));
  }
  function reconcile(bankRows, ledgerRows, options) {
    const opts = options || {};
    const maxDays = opts.maxDays === undefined ? 3 : opts.maxDays;
    if (!Number.isInteger(maxDays) || maxDays < 0 || maxDays > 30)
      fail('maxDays must be an integer between 0 and 30');
    const bank = normalize(bankRows, 'bank');
    const ledger = normalize(ledgerRows, 'ledger');
    const remainingB = new Map(bank.map(x => [x.id, x]));
    const remainingL = new Map(ledger.map(x => [x.id, x]));
    const matches = [];
    function compatible(a, b) {
      return a.amountCents === b.amountCents && a.currency === b.currency &&
        Math.abs(a.day - b.day) <= maxDays &&
        (!a.reference || !b.reference || a.reference === b.reference);
    }
    function bestFor(row, candidates) {
      const eligible = candidates.filter(other => compatible(row, other));
      if (!eligible.length) return [];
      const score = other => row.reference && other.reference && row.reference === other.reference ? 1 : 0;
      const max = Math.max(...eligible.map(score));
      return eligible.filter(other => score(other) === max);
    }
    let progress = true;
    while (progress) {
      progress = false;
      const bRows = Array.from(remainingB.values());
      const lRows = Array.from(remainingL.values());
      for (const b of bRows) {
        if (!remainingB.has(b.id)) continue;
        const picks = bestFor(b, lRows.filter(l => remainingL.has(l.id)));
        if (picks.length !== 1) continue;
        const l = picks[0];
        const reciprocal = bestFor(l, bRows.filter(x => remainingB.has(x.id)));
        if (reciprocal.length !== 1 || reciprocal[0].id !== b.id) continue;
        remainingB.delete(b.id);
        remainingL.delete(l.id);
        matches.push({ bankId: b.id, ledgerId: l.id, amountCents: b.amountCents,
          dateDifferenceDays: Math.abs(b.day - l.day), status: 'candidate',
          evidenceStatus: b.evidenceId && l.evidenceId ? 'references_present' : 'missing_evidence_reference' });
        progress = true;
      }
    }
    const bLeft = Array.from(remainingB.values());
    const lLeft = Array.from(remainingL.values());
    const ambiguousBank = bLeft.filter(b => bestFor(b, lLeft).length > 0).map(x => x.id);
    const ambiguousLedger = lLeft.filter(l => bestFor(l, bLeft).length > 0).map(x => x.id);
    const bAmbiguous = new Set(ambiguousBank);
    const lAmbiguous = new Set(ambiguousLedger);
    return {
      mode: 'DEMONSTRATION_ONLY', externallyVerified: false,
      rules: { currency: 'USD', maxDays, matchStatus: 'candidate_not_verified' },
      counts: { bank: bank.length, ledger: ledger.length, candidates: matches.length,
        ambiguousBank: ambiguousBank.length, ambiguousLedger: ambiguousLedger.length },
      matches,
      ambiguousBank, ambiguousLedger,
      unmatchedBank: bLeft.filter(x => !bAmbiguous.has(x.id)).map(x => x.id),
      unmatchedLedger: lLeft.filter(x => !lAmbiguous.has(x.id)).map(x => x.id)
    };
  }
  return Object.freeze({ cents, isoDay, reconcile });
});
