const REVIEW_ENABLED = process.env.EONS_REVIEW_ENABLED === 'true';

const reviewerTypes = ['CPA','EA','tax_attorney','bookkeeper','owner_pre_review'];

function reviewGate(){
  return {
    enabled: REVIEW_ENABLED,
    status: REVIEW_ENABLED ? 'READY_FOR_REVIEW' : 'BLOCKED',
    reviewer_types: reviewerTypes,
    final_approval_enabled: false,
    production_rule: 'No final approval, reliance, filing position, credit, deduction, or submission is approved by this scaffold.',
    required_before_final: [
      'verified evidence records',
      'reviewer identity',
      'reviewer written notes',
      'missing proof resolved or disclosed',
      'owner approval',
      'professional signoff',
      'audit log entry',
      'exported review packet'
    ]
  };
}

function mockReview(payload){
  return {
    review_id: require('crypto').randomUUID(),
    timestamp_utc: new Date().toISOString(),
    mode: 'mock_review_only',
    reviewer_type: payload.reviewer_type || 'owner_pre_review',
    matter_id: payload.matter_id || 'not_entered',
    record_id: payload.record_id || 'not_entered',
    review_status: payload.review_status || 'review_required',
    note: payload.note || '',
    final_approval: false,
    status: 'DRAFT_REVIEW_NOTE_ONLY',
    warning: 'Mock review note only. Not professional signoff.'
  };
}

module.exports={reviewGate,mockReview,reviewerTypes};
