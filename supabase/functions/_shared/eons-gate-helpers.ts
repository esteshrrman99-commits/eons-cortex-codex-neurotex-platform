// Placeholder only. Do not add secrets here.
export function safeConfigStatus(env){
  const required=["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","EONS_CORS_ORIGIN"];
  const missing=required.filter((k)=>!env || !String(env[k]||"").trim());
  return { configured: missing.length===0, missing, secret_values_returned:false };
}
export function blocked(action){
  return { ok:false, action, status:"BLOCKED_UNTIL_AUTH_RLS_STORAGE_AUDIT_BACKUP_REVIEW_AND_OWNER_APPROVAL", secret_values_returned:false };
}
