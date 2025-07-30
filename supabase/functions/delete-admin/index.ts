import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Edge Function: delete-admin invoked.");

  if (req.method === "OPTIONS") {
    console.log("Edge Function: delete-admin responding to OPTIONS request.");
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase: SupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let body;
  try {
    body = await req.json();
    console.log("Edge Function: delete-admin request body:", body);
  } catch (err) {
    console.error("Edge Function delete-admin: JSON parse error:", err);
    return new Response(JSON.stringify({ error: "Invalid JSON", details: String(err) }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const { admin_id_to_delete } = body;

  if (!admin_id_to_delete) {
    console.error("Edge Function delete-admin: Missing admin_id_to_delete in request.");
    return new Response(JSON.stringify({ error: "admin_id_to_delete is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Verify caller permissions
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    console.error("Edge Function delete-admin: No authorization header.");
    return new Response(JSON.stringify({ error: "No authorization header" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const jwt = authHeader.replace("Bearer ", "");
  const { data: { user: callingUser }, error: authError } = await supabase.auth.getUser(jwt);

  if (authError || !callingUser) {
    console.error("Edge Function delete-admin: Invalid auth token.", { authError });
    return new Response(JSON.stringify({ error: "Unauthorized", details: "Invalid authentication token." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Check if caller is a full admin in the admins table
  const { data: callerAdmin, error: callerAdminError } = await supabase
    .from("admins")
    .select("permissions")
    .eq("admin_id", callingUser.id)
    .single();

  if (callerAdminError || !callerAdmin || callerAdmin.permissions !== "full") {
    console.error("Edge Function delete-admin: Caller is not a full admin.", { 
      callerAdminError, 
      callerAdmin,
      callingUserId: callingUser.id 
    });
    return new Response(JSON.stringify({ error: "Unauthorized", details: "Caller is not a full admin." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  console.log("Edge Function: delete-admin - Caller authorized as full admin:", callingUser.id);

  // Prevent deletion of self
  if (callingUser.id === admin_id_to_delete) {
    console.error("Edge Function delete-admin: Attempt to delete self.");
    return new Response(JSON.stringify({ error: "Cannot delete yourself." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  
  // Check if this is the last full admin
  const { data: allAdmins, error: fetchAdminsError } = await supabase
    .from("admins")
    .select("admin_id, permissions");

  if (fetchAdminsError) {
    console.error("Edge Function delete-admin: Error fetching admins to check for last full admin:", fetchAdminsError);
    return new Response(JSON.stringify({ error: "Failed to verify admin status.", details: fetchAdminsError.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const fullAdmins = allAdmins.filter(admin => admin.permissions === 'full');
  const adminToDeleteIsFull = fullAdmins.some(admin => admin.admin_id === admin_id_to_delete);

  if (adminToDeleteIsFull && fullAdmins.length === 1) {
    console.warn("Edge Function delete-admin: Attempt to delete the last full admin.");
    return new Response(JSON.stringify({ error: "Cannot delete the last full admin." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // 1. Delete from public.admins table
  console.log("Edge Function delete-admin: Attempting to delete from public.admins table, admin_id:", admin_id_to_delete);
  const { error: deleteAdminRecordError } = await supabase
    .from("admins")
    .delete()
    .eq("admin_id", admin_id_to_delete);

  if (deleteAdminRecordError) {
    console.error("Edge Function delete-admin: Error deleting from public.admins table:", deleteAdminRecordError);
    // Not returning immediately, will still attempt to delete auth user if they exist.
    // Depending on desired behavior, you might want to return here.
  } else {
    console.log("Edge Function delete-admin: Successfully deleted from public.admins table (or record didn't exist).");
  }

  // 2. Delete from auth.users table
  console.log("Edge Function delete-admin: Attempting to delete user from auth.users, user_id:", admin_id_to_delete);
  const { data: deletedAuthUser, error: deleteAuthUserError } = await supabase.auth.admin.deleteUser(admin_id_to_delete);

  if (deleteAuthUserError) {
    console.error("Edge Function delete-admin: Error deleting user from auth.users:", deleteAuthUserError);
    // If deleteAdminRecordError also occurred, this is a partial failure.
    // If only this failed, it means the admin record was deleted but auth user wasn't.
    return new Response(JSON.stringify({ error: "Failed to delete user from authentication system.", details: deleteAuthUserError.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  console.log("Edge Function delete-admin: Successfully deleted user from auth.users (or user didn't exist). Auth response:", deletedAuthUser);
  return new Response(JSON.stringify({ success: true, message: "Admin and associated authentication user deleted successfully." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}); 