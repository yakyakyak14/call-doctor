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
  return data;
}
