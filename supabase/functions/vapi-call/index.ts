// Supabase Edge Function: vapi-call
// Securely starts a Vapi outbound phone call using API key stored in Supabase Secrets
// Expected body: {
//   customerNumber: string (E.164, e.g., "+234800..."),
//   assistantOverrides?: object,
//   assistantId?: string,       // optional; will default from env when not provided
//   phoneNumberId?: string,     // optional; will default from env when not provided
//   metadata?: object
// }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("VAPI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing VAPI_API_KEY in Supabase Secrets" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json().catch(() => ({}));
    const customerNumber: string | undefined = body.customerNumber;
    const assistantOverrides: Record<string, unknown> | undefined = body.assistantOverrides;
    const phoneNumber: string | undefined = body.phoneNumber || Deno.env.get("VAPI_PHONE_NUMBER") || undefined;

    const assistantId = body.assistantId || Deno.env.get("VAPI_ASSISTANT_ID") || undefined;
    const phoneNumberId = body.phoneNumberId || Deno.env.get("VAPI_PHONE_NUMBER_ID") || undefined;

    // Request context
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
    const userAgent = req.headers.get("user-agent") || "";
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";

    // Supabase clients (service-role for rate limiting/logging when available)
    // Supabase URL and ANON KEY are automatically injected in Edge Functions; no need to set as secrets
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    // Use a non-reserved secret name for service role key (e.g., SERVICE_ROLE_KEY)
    const SERVICE_ROLE = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE");
    const supaSr = createClient(SUPABASE_URL, SERVICE_ROLE || ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });
    const supaAuth = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supaAuth.auth.getUser();
    const userId = userData?.user?.id ?? null;

    if (!customerNumber || typeof customerNumber !== "string") {
      return new Response(JSON.stringify({ error: "customerNumber is required (E.164, e.g., +234... )" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Basic E.164 sanity check
    if (!customerNumber.startsWith("+") || customerNumber.length < 8) {
      return new Response(
        JSON.stringify({ error: "customerNumber must be E.164 format with country code, e.g., +234..." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    if (!assistantId) {
      return new Response(JSON.stringify({ error: "assistantId not provided and VAPI_ASSISTANT_ID not set" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!phoneNumberId && !phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Provide phoneNumberId or phoneNumber (or set VAPI_PHONE_NUMBER_ID/VAPI_PHONE_NUMBER in secrets)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Basic IP-based rate limiting (max 3 calls / 5 minutes)
    if (SERVICE_ROLE) {
      try {
        const sinceISO = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { count } = await supaSr
          .from("emergency_calls")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sinceISO)
          .or(ip ? `ip.eq.${ip}` : `to_number.eq.${customerNumber}`);
        if ((count ?? 0) >= 3) {
          return new Response(JSON.stringify({ error: "Too many requests. Please wait a few minutes and try again." }), {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      } catch (_) {
        // If rate limit lookup fails, continue without blocking
      }
    }

    const payload: Record<string, unknown> = {
      type: "outboundPhoneCall",
      assistantId,
      customer: { number: customerNumber },
    };
    if (phoneNumber) {
      payload["phoneNumber"] = { number: phoneNumber };
    } else if (phoneNumberId) {
      payload["phoneNumberId"] = phoneNumberId;
    }
    if (assistantOverrides) payload["assistantOverrides"] = assistantOverrides;
    if (body.metadata) payload["metadata"] = body.metadata;

    const resp = await fetch("https://api.vapi.ai/calls", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: result?.message || "Vapi API error", details: result }), {
        status: resp.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Log emergency call server-side (best-effort)
    try {
      await supaSr.from("emergency_calls").insert({
        to_number: customerNumber,
        call_id: result?.id ?? null,
        source: body?.metadata?.source ?? null,
        coords: body?.metadata?.coords ?? null,
        ip: ip || null,
        user_id: userId,
        user_agent: userAgent,
      });
    } catch (_) {
      // ignore logging errors
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
