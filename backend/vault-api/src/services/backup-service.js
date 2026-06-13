const crypto=require('crypto');

const BACKUP_ENABLED = process.env.EONS_BACKUP_ENABLED === 'true';

function backupGate(){
  return {
    enabled: BACKUP_ENABLED,
    status: BACKUP_ENABLED ? 'READY_FOR_REVIEW' : 'BLOCKED',
    archive_enabled: false,
    restore_enabled: false,
    production_rule: 'No production backup/restore is enabled until encrypted storage, database, access control, and recovery review are complete.',
    required_before_enablement: [
      'encrypted storage',
      'private database',
      'backup location selected',
      'retention policy approved',
      'restore test completed',
      'access controls',
      'audit log',
      'security review'
    ]
  };
}

function mockArchiveManifest(payload){
  const text=JSON.stringify(payload||{});
  return {
    archive_id: crypto.randomUUID(),
    timestamp_utc: new Date().toISOString(),
    mode: 'mock_archive_manifest_only',
    archive_enabled: false,
    restore_enabled: false,
    item_count: Array.isArray(payload.items) ? payload.items.length : 0,
    manifest_hash: crypto.createHash('sha256').update(text).digest('hex'),
    status: 'DRAFT_ARCHIVE_MANIFEST_ONLY',
    warning: 'No files were backed up or restored. This is a manifest scaffold only.'
  };
}

module.exports={backupGate,mockArchiveManifest};
