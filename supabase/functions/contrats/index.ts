// Edge Function Supabase - Contrats
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-client-info, apikey",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
    const { data: contrats, error } = await supabase.from("contrats").select("*").order("id", { ascending: false });
    if (error) throw error;
    const ids = [...new Set((contrats || []).map((c: Record<string, unknown>) => c.employee_id).filter(Boolean))];
    const empMap: Record<number, Record<string, unknown>> = {};
    if (ids.length > 0) {
      const { data: emps } = await supabase.from("employees").select("id, nom_prenom, poste_actuel, functional_area, entity, departement, salaire_net, salaire_base").in("id", ids);
      (emps || []).forEach((e: Record<string, unknown>) => { empMap[Number(e.id)] = e; });
    }
    const result = (contrats || []).map((c: Record<string, unknown>) => {
      const emp = empMap[Number(c.employee_id)];
      return { ...c, nom_prenom: emp?.nom_prenom ?? null, poste: c.poste || emp?.poste_actuel, service: c.service || emp?.functional_area || emp?.entity || emp?.departement, date_fin: c.date_fin, salaire: c.salaire ?? emp?.salaire_net ?? emp?.salaire_base };
    });
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
