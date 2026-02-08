// Edge Function Supabase - Historique recrutements
// Utilise historique_recrutement (nom, prenom, poste...) pour l'affichage des candidatures
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
    const match = u.pathname.match(/\/functions\/v1\/recrutements(?:\/(.*))?$/);
    const subPath = match?.[1] || "";
    return subPath ? subPath.split("/").filter(Boolean) : [];
  } catch {
    return [];
  }
}

function mapRecruitment(r: Record<string, unknown>) {
  return {
    id: r.id,
    fullName: `${(r.nom || "").trim()} ${(r.prenom || "").trim()}`.trim(),
    position: r.poste,
    department: r.departement,
    source: r.motif_recrutement,
    applicationDate: r.date_recrutement,
    status: r.type_contrat,
    ...r,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
    const segments = getPathSegments(req.url);

    // GET /recrutements/:id - Récupérer un recrutement par ID
    if (req.method === "GET" && segments[0] && /^\d+$/.test(segments[0])) {
      const { data, error } = await supabase
        .from("historique_recrutement")
        .select("*")
        .eq("id", parseInt(segments[0], 10))
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Recruitment not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(mapRecruitment(data)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET /recrutements - Liste
    const { data, error } = await supabase.from("historique_recrutement").select("*").order("id", { ascending: false });
    if (error) throw error;
    const mapped = (data || []).map(mapRecruitment);
    return new Response(JSON.stringify(mapped), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
