import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create regular client to verify the requesting user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Verify the requesting user is authenticated and has full admin permissions
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized: Invalid token");
    }

    // Check if the requesting user is a full admin
    const { data: requestingAdmin, error: adminCheckError } = await supabaseAdmin
      .from("admins")
      .select("permissions")
      .eq("email", user.email)
      .single();

    if (adminCheckError || !requestingAdmin || requestingAdmin.permissions !== "full") {
      throw new Error("Unauthorized: Insufficient permissions");
    }

    // Parse the request body
    const { email, name, permissions } = await req.json();

    if (!email || !name || !permissions) {
      throw new Error("Missing required fields: email, name, permissions");
    }

    if (!["full", "limited"].includes(permissions)) {
      throw new Error("Invalid permissions value. Must be \"full\" or \"limited\"");
    }

    // Check if admin with this email already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from("admins")
      .select("email")
      .eq("email", email)
      .single();

    if (existingAdmin) {
      throw new Error("An admin with this email already exists");
    }

    // Check if auth user with this email already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser.users.some(u => u.email === email);

    if (userExists) {
      throw new Error("A user with this email already exists");
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Create the auth user first
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: name
      }
    });

    if (authError || !authData.user) {
      console.error("Error creating auth user:", authError);
      throw new Error(`Failed to create auth user: ${authError?.message || "Unknown error"}`);
    }

    console.log("Successfully created auth user:", authData.user.id);

    // Create the admin record with the auth user's ID
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admins")
      .insert({
        admin_id: authData.user.id,
        email: email,
        name: name,
        permissions: permissions,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (adminError) {
      console.error("Error creating admin record:", adminError);
      
      // Clean up the auth user if admin record creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log("Cleaned up auth user after admin record creation failure");
      } catch (cleanupError) {
        console.error("Error cleaning up auth user:", cleanupError);
      }
      
      throw new Error(`Failed to create admin record: ${adminError.message}`);
    }

    console.log("Successfully created admin record:", adminData);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        insertedAdminData: adminData,
        tempPassword: tempPassword,
        message: `Admin added successfully. Temporary password: ${tempPassword}`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );

  } catch (error) {
    console.error("Error in add-admin function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
}); 