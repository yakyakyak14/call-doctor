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

    const assistantId = body.assistantId || Deno.env.get("VAPI_ASSISTANT_ID") || undefined;
    const phoneNumberId = body.phoneNumberId || Deno.env.get("VAPI_PHONE_NUMBER_ID") || undefined;

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

    if (!phoneNumberId) {
      return new Response(JSON.stringify({ error: "phoneNumberId not provided and VAPI_PHONE_NUMBER_ID not set" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload: Record<string, unknown> = {
      type: "outboundPhoneCall",
      assistantId,
      phoneNumberId,
      customer: { number: customerNumber },
    };
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
