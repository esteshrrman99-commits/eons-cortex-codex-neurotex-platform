import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  return new Response(JSON.stringify({
    ok: false,
    action: "sensitive_upload_blocked",
    status: "BLOCKED_BY_DEFAULT",
    reason: "Sensitive production upload is disabled until auth, encryption, RLS, private storage, audit logging, backup, CORS, reviewer approval, and owner approval are complete.",
    secret_values_returned: false
  }, null, 2), {
    status: 403,
    headers: { "content-type": "application/json" }
  });
});
