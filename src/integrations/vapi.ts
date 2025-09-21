import { supabase } from "@/integrations/supabase/client";

export interface StartVapiCallParams {
  customerNumber: string; // E.164, e.g. +234...
  assistantOverrides?: Record<string, unknown>;
  assistantId?: string;
  phoneNumberId?: string;
  metadata?: Record<string, unknown>;
}

export async function startVapiCall(params: StartVapiCallParams) {
  const { data, error } = await supabase.functions.invoke("vapi-call", {
    body: params,
  });
  if (error) {
    throw new Error(error.message || "Failed to start Vapi call");
  }
  try {
    const entry = {
      id: (data as any)?.id ?? null,
      to: params.customerNumber,
      metadata: params.metadata ?? null,
      at: new Date().toISOString(),
    };
    const key = "vapi_call_history";
    const raw = localStorage.getItem(key);
    const arr = raw ? (JSON.parse(raw) as any[]) : [];
    arr.unshift(entry);
    localStorage.setItem(key, JSON.stringify(arr.slice(0, 10)));
  } catch {
    // ignore localStorage errors (e.g., SSR/permissions)
  }
  // Return original data so callers can access `res.data.id`
  return data;
}
