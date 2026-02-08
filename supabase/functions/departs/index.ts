// Edge Function Supabase - Historique départs
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
    const match = u.pathname.match(/\/functions\/v1\/departs(?:\/(.*))?$/);
    const subPath = match?.[1] || "";
    return subPath ? subPath.split("/").filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function fetchDepartures(supabase: ReturnType<typeof createClient>) {
  const { data: d1, error: e1 } = await supabase.from("depart_history").select("*").order("date_depart", { ascending: false });
  if (!e1 && d1 && d1.length > 0) return d1;
  const { data, error } = await supabase.from("historique_departs").select("*").order("id", { ascending: false });
  if (error) throw error;
  return data || [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
    const segments = getPathSegments(req.url);

    // GET /departs/:id - Récupérer un départ par ID
    if (req.method === "GET" && segments[0] && /^\d+$/.test(segments[0])) {
      const id = parseInt(segments[0], 10);
      const { data: d1 } = await supabase.from("depart_history").select("*").eq("id", id).single();
      if (d1) return new Response(JSON.stringify(d1), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { data: d2, error } = await supabase.from("historique_departs").select("*").eq("id", id).single();
      if (error || !d2) {
        return new Response(JSON.stringify({ error: "Depart not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(d2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET /departs - Liste
    const data = await fetchDepartures(supabase);
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
