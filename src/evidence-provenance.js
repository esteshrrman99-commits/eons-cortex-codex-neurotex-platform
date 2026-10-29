'use strict';
const crypto = require('node:crypto');
const MAX_BYTES = 20 * 1024 * 1024;
function digestEvidence(bytes) {
  if (!(Buffer.isBuffer(bytes) || bytes instanceof Uint8Array))
    throw new TypeError('Evidence must be raw bytes, not decoded text');
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES)
    throw new RangeError('Evidence must be 1 byte to 20 MiB');
  return Object.freeze({
    algorithm: 'sha256',
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    byteLength: bytes.byteLength,
    verifiedByExternalSource: false
  });
}
function compareEvidence(bytes, expectedSha256) {
  if (typeof expectedSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(expectedSha256))
    throw new TypeError('Expected SHA-256 must be 64 lowercase hexadecimal characters');
  const actual = digestEvidence(bytes).sha256;
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expectedSha256, 'hex'));
}
module.exports = { digestEvidence, compareEvidence };
