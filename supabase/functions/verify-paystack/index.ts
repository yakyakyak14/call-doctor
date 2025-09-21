// Supabase Edge Function: verify-paystack
// Verifies a Paystack transaction reference and updates the consultations table
// Body: { consultationId: string, reference: string }

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
    const body = await req.json().catch(() => ({}));
    const consultationId: string | undefined = body.consultationId;
    const reference: string | undefined = body.reference;

    if (!consultationId || !reference) {
      return new Response(JSON.stringify({ error: "Missing consultationId or reference" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Missing PAYSTACK_SECRET_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const verifyJson = await verifyRes.json().catch(() => ({}));
    if (!verifyRes.ok) {
      return new Response(JSON.stringify({ error: verifyJson?.message || "Verification failed", details: verifyJson }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const status = verifyJson?.data?.status as string;
    const amount = verifyJson?.data?.amount as number; // in kobo
    const currency = verifyJson?.data?.currency as string;

    if (status !== "success") {
      return new Response(JSON.stringify({ error: "Payment not successful", status }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Update consultations row
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!; // auto-injected in Edge Functions
    const SERVICE_ROLE = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE");
    if (!SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: "Missing SERVICE_ROLE_KEY secret (set in Function Secrets)" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const supa = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const { error } = await supa
      .from("consultations")
      .update({
        payment_status: "paid",
        payment_reference: reference,
        payment_provider: "paystack",
        payment_amount_kobo: amount,
        payment_currency: currency,
        payment_verified_at: new Date().toISOString(),
        status: "confirmed",
      })
      .eq("id", consultationId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
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
