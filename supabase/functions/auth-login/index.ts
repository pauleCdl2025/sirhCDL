// Edge Function Supabase - Authentification RH et Employés
// Déployer avec: supabase functions deploy auth-login

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-client-info, apikey",
  "Access-Control-Max-Age": "86400",
};

// Identifiants de test (fallback)
const TEST_CREDENTIALS: Record<string, string> = {
  "rh@centre-diagnostic.com": "Rh@2025CDL",
  "admin@centrediagnostic.ga": "Admin@2025CDL",
  "test@test.com": "test123",
};

async function generateToken(payload: Record<string, unknown>): Promise<string> {
  const secret = new TextEncoder().encode(
    Deno.env.get("JWT_SECRET") || "fallback-secret-key-change-in-production"
  );
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secret);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const { compare } = await import("https://deno.land/x/bcrypt@v0.4.1/mod.ts");
    return await compare(password, hash);
  } catch {
    return false;
  }
}

serve(async (req) => {
  // Réponse CORS pour préflight (OPTIONS) - doit être en premier
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: "Body JSON invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { email, password, matricule } = body || {};

    // Authentification RH (email)
    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      
      if (!password) {
        return new Response(
          JSON.stringify({ success: false, message: "Email et mot de passe requis" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Test credentials
      if (TEST_CREDENTIALS[normalizedEmail] === password) {
        const token = await generateToken({ id: normalizedEmail, email: normalizedEmail, role: "admin" } as Record<string, unknown>);
        return new Response(
          JSON.stringify({
            success: true,
            token,
            user: {
              id: normalizedEmail,
              email: normalizedEmail,
              name: "Admin RH",
              role: "admin",
              nom: "Admin",
              prenom: "RH",
              poste: "Administration",
              fonction: "Administrateur RH",
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Vérifier table users
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", normalizedEmail)
        .limit(1);

      if (!userError && users?.length > 0) {
        const user = users[0];
        if (user.status === "suspended" || user.status === "inactive") {
          return new Response(
            JSON.stringify({ success: false, message: "Ce compte est bloqué." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const valid = await verifyPassword(password, user.password);
        if (valid) {
          const token = await generateToken({ id: user.id, email: user.email, role: user.role } as Record<string, unknown>);
          return new Response(
            JSON.stringify({
              success: true,
              token,
              user: {
                id: user.id,
                email: user.email,
                name: user.first_name ? `${user.first_name} ${user.last_name}` : user.email,
                role: user.role || "admin",
                nom: user.last_name || "",
                prenom: user.first_name || "",
                poste: user.role,
                fonction: user.role,
              },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: false, message: "Identifiants incorrects" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authentification Employé (matricule)
    if (matricule && password) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { data: employees, error } = await supabase
        .from("employees")
        .select("id, matricule, nom_prenom, password, email")
        .eq("matricule", matricule.trim().toUpperCase())
        .limit(1);

      if (!error && employees?.length > 0) {
        const emp = employees[0];
        const valid = emp.password ? await verifyPassword(password, emp.password) : false;
        if (valid) {
          const token = await generateToken({ id: emp.id, matricule: emp.matricule, type: "employee" } as Record<string, unknown>);
          return new Response(
            JSON.stringify({
              success: true,
              token,
              employee: {
                id: emp.id,
                matricule: emp.matricule,
                nom_prenom: emp.nom_prenom,
                email: emp.email,
              },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: false, message: "Matricule ou mot de passe incorrect" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Email et mot de passe ou matricule requis" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, message: "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
