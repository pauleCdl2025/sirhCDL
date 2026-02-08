// Edge Function Supabase - Performance (placeholder)
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
    const { data: emp } = await supabase.from("employees").select("id, nom_prenom, functional_area").limit(500);
    const byDept: Record<string, number> = {};
    (emp || []).forEach((e: Record<string, unknown>) => {
      const d = (e.functional_area as string) || "Non défini";
      byDept[d] = (byDept[d] || 0) + 1;
    });
    return new Response(JSON.stringify(byDept), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
