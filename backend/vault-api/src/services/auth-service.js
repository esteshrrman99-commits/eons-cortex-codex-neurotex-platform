const AUTH_ENABLED = process.env.EONS_AUTH_ENABLED === 'true';

const roles = ['owner','admin','reviewer','viewer'];

function gate(){
  return {
    enabled: AUTH_ENABLED,
    status: AUTH_ENABLED ? 'READY_FOR_REVIEW' : 'BLOCKED',
    reason: AUTH_ENABLED ? 'Auth scaffold enabled for review only.' : 'EONS_AUTH_ENABLED is not true. Login and route protection are disabled in staging.',
    roles,
    production_rule: 'No sensitive evidence route may be production-enabled without authentication and access control review.'
  };
}

function mockSession(role){
  const safeRole = roles.includes(role) ? role : 'viewer';
  return {
    session_mode: 'mock_only',
    auth_enabled: AUTH_ENABLED,
    role: safeRole,
    permissions: {
      owner: ['read','write','classify','export','review_queue'],
      admin: ['read','write','classify','export'],
      reviewer: ['read','comment','review_status'],
      viewer: ['read_limited']
    }[safeRole],
    warning: 'Mock session only. Not a real login.'
  };
}

module.exports={gate,mockSession,roles};
