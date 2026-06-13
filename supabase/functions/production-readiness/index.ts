import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function on(name: string): boolean {
  return String(Deno.env.get(name) || "").toLowerCase() === "true";
}

function present(name: string): boolean {
  return String(Deno.env.get(name) || "").trim().length > 0;
}

serve(async () => {
  const checks = [
    { key: "production_mode", pass: on("EONS_PRODUCTION_MODE"), required: "EONS_PRODUCTION_MODE=true" },
    { key: "auth_enabled", pass: on("EONS_AUTH_ENABLED"), required: "EONS_AUTH_ENABLED=true" },
    { key: "encryption_enabled", pass: on("EONS_ENCRYPTION_ENABLED"), required: "EONS_ENCRYPTION_ENABLED=true" },
    { key: "uploads_enabled", pass: on("EONS_UPLOADS_ENABLED"), required: "EONS_UPLOADS_ENABLED=true" },
    { key: "supabase_url_present", pass: present("SUPABASE_URL"), required: "SUPABASE_URL runtime secret" },
    { key: "service_role_present", pass: present("SUPABASE_SERVICE_ROLE_KEY"), required: "SUPABASE_SERVICE_ROLE_KEY runtime secret" },
    { key: "cors_origin_present", pass: present("EONS_CORS_ORIGIN"), required: "EONS_CORS_ORIGIN runtime setting" },
    { key: "review_enabled", pass: on("EONS_REVIEW_ENABLED"), required: "EONS_REVIEW_ENABLED=true" },
    { key: "owner_approval", pass: on("EONS_OWNER_APPROVAL"), required: "EONS_OWNER_APPROVAL=true" }
  ];
  const missing = checks.filter((c) => !c.pass).map((c) => c.required);
  return new Response(JSON.stringify({
    ok: missing.length === 0,
    service: "EONS production readiness",
    status: missing.length === 0 ? "READY_FOR_PRIVATE_PILOT_REVIEW" : "BLOCKED",
    sensitive_upload_allowed: false,
    checks,
    missing,
    note: "This placeholder never returns secret values. Sensitive upload remains blocked until final security and reviewer approval."
  }, null, 2), { headers: { "content-type": "application/json" } });
});
