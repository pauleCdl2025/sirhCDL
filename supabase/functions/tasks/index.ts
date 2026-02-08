// Edge Function Supabase - Tâches
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-client-info, apikey",
  "Access-Control-Max-Age": "86400",
};

function getPathSegments(url: string): string[] {
  try {
    const m = new URL(url).pathname.match(/\/functions\/v1\/tasks(?:\/(.*))?$/);
    const sub = m?.[1] || "";
    return sub ? sub.split("/").filter(Boolean) : [];
  } catch { return []; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
    const segments = getPathSegments(req.url);
    if (segments[0] === "stats" && segments[1] === "overview") {
      const { data: tasks, error } = await supabase.from("tasks").select("*");
      if (error) throw error;
      const rows = tasks || [];
      const stats = { total: rows.length, completed: rows.filter((t: Record<string, unknown>) => t.status === "completed" || t.statut === "Terminé").length, pending: rows.filter((t: Record<string, unknown>) => t.status === "pending" || t.statut === "En cours").length };
      return new Response(JSON.stringify(stats), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (segments[0] && /^\d+$/.test(segments[0])) {
      const { data, error } = await supabase.from("tasks").select("*").eq("id", parseInt(segments[0], 10)).single();
      if (error || !data) {
        return new Response(JSON.stringify({ error: "Task not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data, error } = await supabase.from("tasks").select("*").order("id", { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
