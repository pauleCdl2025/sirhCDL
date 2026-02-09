// Edge Function Supabase - Employés
// Déployer: supabase functions deploy employees

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
    const match = path.match(/\/functions\/v1\/employees(?:\/(.*))?$/);
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
    const url = new URL(req.url);
    const daysThreshold = parseInt(url.searchParams.get("daysThreshold") || "60", 10);

    if (req.method === "GET" && segments[0] === "alerts" && segments[1] === "expiring-contracts") {
      const today = new Date().toISOString().split("T")[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysThreshold);
      const futureStr = futureDate.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .not("date_fin_contrat", "is", null)
        .gte("date_fin_contrat", today)
        .lte("date_fin_contrat", futureStr)
        .in("type_contrat", ["CDD", "Prestataire", "stage PNPE", "Stage"])
        .order("date_fin_contrat", { ascending: true });

      if (error) throw error;
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && segments[0] && /^\d+$/.test(segments[0])) {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", parseInt(segments[0], 10))
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Employee not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && segments.length === 0) {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /employees/:id - Mettre à jour un employé
    if (req.method === "PUT" && segments[0] && /^\d+$/.test(segments[0])) {
      const employeeId = parseInt(segments[0], 10);
      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updateFields: Record<string, unknown> = {};
      const allowedFields = [
        "statut_dossier", "matricule", "nom_prenom", "genre", "date_naissance",
        "date_entree", "lieu", "adresse", "telephone", "email", "cnss_number",
        "cnamgs_number", "poste_actuel", "type_contrat", "date_fin_contrat",
        "employee_type", "nationalite", "functional_area", "entity", "responsable",
        "statut_employe", "statut_marital", "enfants", "niveau_etude", "specialisation",
        "type_remuneration", "payment_mode", "categorie", "salaire_base", "salaire_net",
        "prime_responsabilite", "prime_penibilite", "prime_logement", "prime_transport",
        "prime_anciennete", "prime_enfant", "prime_representation", "prime_performance",
        "prime_astreinte", "honoraires", "indemnite_stage", "timemoto_id",
        "emergency_contact", "emergency_phone", "departement", "domaine_fonctionnel"
      ];

      for (const field of allowedFields) {
        if (body[field] !== undefined) updateFields[field] = body[field];
      }

      // Calculer age, date_retraite, anciennete si fournis
      if (body.date_naissance) {
        const birthDate = new Date(body.date_naissance as string);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        updateFields.age = age;
        const retraiteDate = new Date(birthDate);
        retraiteDate.setFullYear(birthDate.getFullYear() + 60);
        updateFields.date_retraite = retraiteDate.toISOString().split("T")[0];
        updateFields.age_restant = Math.max(0, 60 - age);
      }
      if (body.date_entree) {
        const entryDate = new Date(body.date_entree as string);
        const today = new Date();
        const diffDays = Math.ceil((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        updateFields.anciennete = `${years} ans ${months} mois`;
      }

      if (Object.keys(updateFields).length === 0) {
        return new Response(JSON.stringify({ error: "No valid fields to update" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("employees")
        .update(updateFields)
        .eq("id", employeeId)
        .select()
        .single();

      if (error) {
        console.error("Update error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!data) {
        return new Response(JSON.stringify({ error: "Employee not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
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
      JSON.stringify({ error: "Failed to fetch employees", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
