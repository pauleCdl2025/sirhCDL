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

    // PUT /recrutements/:id - Mettre à jour un recrutement
    if (req.method === "PUT" && segments[0] && /^\d+$/.test(segments[0])) {
      const recruitmentId = parseInt(segments[0], 10);
      const contentType = req.headers.get("content-type") || "";
      let body: Record<string, unknown> = {};

      try {
        if (contentType.includes("application/json")) {
          body = await req.json() as Record<string, unknown>;
        } else if (contentType.includes("multipart/form-data")) {
          const formData = await req.formData();
          for (const [key, value] of formData.entries()) {
            if (value instanceof File) continue;
            body[key] = value;
          }
        } else {
          body = await req.json() as Record<string, unknown>;
        }
      } catch {
        return new Response(JSON.stringify({ error: "Invalid request body" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updateFields: Record<string, unknown> = {
        date_modification: new Date().toISOString(),
      };

      const fullName = String(body.fullName || "").trim();
      if (fullName) {
        const parts = fullName.split(/\s+/).filter(Boolean);
        updateFields.nom = parts[0] || "";
        updateFields.prenom = parts.slice(1).join(" ") || "";
      }
      if (body.position !== undefined) updateFields.poste = body.position;
      if (body.department !== undefined) updateFields.departement = body.department;
      if (body.source !== undefined) updateFields.motif_recrutement = body.source;
      if (body.applicationDate !== undefined) updateFields.date_recrutement = body.applicationDate;
      if (body.status !== undefined) updateFields.type_contrat = body.status;
      if (body.recruiter !== undefined) updateFields.superieur_hierarchique = body.recruiter;
      if (body.notes !== undefined) updateFields.notes = body.notes;

      const { data, error } = await supabase
        .from("historique_recrutement")
        .update(updateFields)
        .eq("id", recruitmentId)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!data) {
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
