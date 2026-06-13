import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  return new Response(JSON.stringify({
    ok: true,
    service: "EONS health",
    mode: "placeholder_safe",
    sensitive_upload_enabled: false
  }, null, 2), {
    headers: { "content-type": "application/json" }
  });
});
