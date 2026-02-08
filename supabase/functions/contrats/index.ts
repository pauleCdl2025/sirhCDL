// Edge Function Supabase - Contrats
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-client-info, apikey",
  "Access-Control-Max-Age": "86400",
};

function getPathSegments(url: string): string[] {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/functions\/v1\/contrats(?:\/(.*))?$/);
    const subPath = match?.[1] || "";
    return subPath ? subPath.split("/").filter(Boolean) : [];
  } catch {
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
    const segments = getPathSegments(req.url);

    // GET /contrats/:id - Récupérer un contrat par ID
    if (req.method === "GET" && segments[0] && /^\d+$/.test(segments[0])) {
      const { data: contrats, error } = await supabase
        .from("contrats")
        .select("*")
        .eq("id", parseInt(segments[0], 10))
        .single();

      if (error || !contrats) {
        return new Response(JSON.stringify({ error: "Contract not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const empId = contrats.employee_id;
      let empMap: Record<string, unknown> = {};
      if (empId) {
        const { data: emps } = await supabase.from("employees").select("id, nom_prenom, poste_actuel, functional_area, entity, departement, salaire_net, salaire_base").eq("id", empId);
        if (emps && emps[0]) empMap = emps[0];
      }
      const emp = empMap as Record<string, unknown>;
      const result = {
        ...contrats,
        nom_prenom: emp?.nom_prenom ?? null,
        poste: contrats.poste || emp?.poste_actuel,
        service: contrats.service || emp?.functional_area || emp?.entity || emp?.departement,
        date_fin: contrats.date_fin,
        salaire: contrats.salaire ?? emp?.salaire_net ?? emp?.salaire_base,
      };
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET /contrats - Liste
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
