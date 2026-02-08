// Edge Function Supabase - Départements (depuis employees)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-client-info, apikey",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
    const { data, error } = await supabase.from("employees").select("functional_area").not("functional_area", "is", null).not("functional_area", "eq", "");
    if (error) throw error;
    const depts = [...new Set((data || []).map((r: Record<string, unknown>) => r.functional_area).filter(Boolean))].map((name) => ({ name, count: 1 }));
    return new Response(JSON.stringify(depts), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
