// Edge Function Supabase - Demandes employés (employee_requests)
// Déployer: supabase functions deploy requests

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-client-info, apikey",
  "Access-Control-Max-Age": "86400",
};

function getPathSegments(url: string): string[] {
  try {
    const u = new URL(url);
    const path = u.pathname;
    const match = path.match(/\/functions\/v1\/requests(?:\/(.*))?$/);
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

    if (req.method === "GET" && segments[0] === "count" && segments[1] === "pending") {
      const { data, error } = await supabase
        .from("employee_requests")
        .select("id")
        .eq("status", "pending");

      if (error) throw error;
      return new Response(
        JSON.stringify({
          pendingCount: data?.length ?? 0,
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET" && segments.length === 0) {
      const { data: requests, error } = await supabase
        .from("employee_requests")
        .select("*")
        .order("request_date", { ascending: false });

      if (error) throw error;
      const rows = requests || [];
      const ids = [...new Set(rows.map((r: Record<string, unknown>) => r.employee_id).filter(Boolean))];
      const empMap: Record<number, Record<string, unknown>> = {};
      if (ids.length > 0) {
        const { data: emps } = await supabase.from("employees").select("id, nom_prenom, poste_actuel, entity, email").in("id", ids);
        (emps || []).forEach((e: Record<string, unknown>) => { empMap[Number(e.id)] = e; });
      }
      const result = rows.map((r: Record<string, unknown>) => {
        const emp = empMap[Number(r.employee_id)];
        return { ...r, nom_prenom: emp?.nom_prenom ?? null, poste_actuel: emp?.poste_actuel ?? null, entity: emp?.entity ?? null, email: emp?.email ?? null };
      });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && segments[0] === "employee" && segments[1]) {
      const { data, error } = await supabase
        .from("employee_requests")
        .select("*")
        .eq("employee_id", parseInt(segments[1], 10))
        .order("request_date", { ascending: false });

      if (error) throw error;
      const rows = (data || []) as Record<string, unknown>[];
      const ids = [...new Set(rows.map((r) => r.employee_id).filter(Boolean))];
      const empMap: Record<number, Record<string, unknown>> = {};
      if (ids.length > 0) {
        const { data: emps } = await supabase.from("employees").select("id, nom_prenom, poste_actuel, entity, email").in("id", ids);
        (emps || []).forEach((e: Record<string, unknown>) => { empMap[Number(e.id)] = e; });
      }
      const result = rows.map((r) => {
        const emp = empMap[Number(r.employee_id)];
        return { ...r, nom_prenom: emp?.nom_prenom ?? null, poste_actuel: emp?.poste_actuel ?? null, entity: emp?.entity ?? null, email: emp?.email ?? null };
      });
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (req.method === "GET" && segments[0] && /^\d+$/.test(segments[0])) {
      const { data, error } = await supabase
        .from("employee_requests")
        .select("*")
        .eq("id", parseInt(segments[0], 10))
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Request not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const d = data as Record<string, unknown>;
      const { data: emp } = await supabase.from("employees").select("nom_prenom, poste_actuel, entity, email").eq("id", d.employee_id).single();
      const result = { ...d, nom_prenom: emp?.nom_prenom ?? null, poste_actuel: emp?.poste_actuel ?? null, entity: emp?.entity ?? null, email: emp?.email ?? null };
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch requests", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
