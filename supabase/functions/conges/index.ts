// Edge Function Supabase - Congés
// Déployer: supabase functions deploy conges

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
    const path = u.pathname;
    const match = path.match(/\/functions\/v1\/conges(?:\/(.*))?$/);
    const subPath = match?.[1] || "";
    return subPath ? subPath.split("/").filter(Boolean) : [];
  } catch {
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const segments = getPathSegments(req.url);

    // GET /conges/:id - Récupérer un congé par ID
    if (req.method === "GET" && segments[0] && /^\d+$/.test(segments[0])) {
      const { data, error } = await supabase
        .from("conges")
        .select("*")
        .eq("id", parseInt(segments[0], 10))
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Conge not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /conges - Récupérer tous les congés
    if (req.method === "GET" && segments.length === 0) {
      const { data, error } = await supabase
        .from("conges")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /conges - Créer un nouveau congé
    if (req.method === "POST" && segments.length === 0) {
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

      const nom_employe = String(body.nom_employe || "").trim();
      const date_debut = body.date_debut as string;
      const date_fin = body.date_fin as string;

      if (!nom_employe || !date_debut || !date_fin) {
        return new Response(JSON.stringify({ error: "nom_employe, date_debut et date_fin sont requis" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let dateRetour: string | null = (body.date_retour as string) || null;
      if (!dateRetour && date_fin) {
        const fin = new Date(date_fin);
        fin.setDate(fin.getDate() + 1);
        dateRetour = fin.toISOString().split("T")[0];
      }

      const insertData: Record<string, unknown> = {
        nom_employe,
        service: body.service || null,
        poste: body.poste || null,
        date_embauche: body.date_embauche || null,
        jours_conges_annuels: body.jours_conges_annuels ? parseInt(String(body.jours_conges_annuels), 10) : null,
        date_demande: body.date_demande || new Date().toISOString().split("T")[0],
        date_debut,
        date_fin,
        motif: body.motif || null,
        date_retour: dateRetour,
        jours_pris: body.jours_pris != null ? parseInt(String(body.jours_pris), 10) : null,
        jours_restants: body.jours_restants != null ? parseInt(String(body.jours_restants), 10) : null,
        type_conge: body.type_conge || "Congé payé",
        statut: body.statut || "En attente",
      };

      const { data, error } = await supabase
        .from("conges")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Insert conge error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch conges", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
