const OCR_ENABLED = process.env.EONS_OCR_ENABLED === 'true';

const supportedTypes = [
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'csv',
  'json',
  'txt'
];

function parserGate(){
  return {
    enabled: OCR_ENABLED,
    status: OCR_ENABLED ? 'READY_FOR_REVIEW' : 'BLOCKED',
    supported_types: supportedTypes,
    reason: OCR_ENABLED ? 'Parser scaffold enabled for review only.' : 'EONS_OCR_ENABLED is not true. OCR/parser is disabled in staging.',
    production_rule: 'No parsed text should be relied on without owner verification and professional review.'
  };
}

function mockParse(payload){
  const filename = payload.filename || 'unknown';
  const ext = String(filename).split('.').pop().toLowerCase();
  return {
    parser_mode: 'mock_only',
    parser_enabled: OCR_ENABLED,
    filename,
    detected_type: supportedTypes.includes(ext) ? ext : 'unknown',
    confidence: 0,
    extracted_text: '',
    status: 'PARSER_DISABLED_REVIEW_REQUIRED',
    review_queue_required: true,
    notes: 'Mock parser record only. No OCR, PDF, DOC, spreadsheet, or image extraction performed.'
  };
}

module.exports={parserGate,mockParse,supportedTypes};
