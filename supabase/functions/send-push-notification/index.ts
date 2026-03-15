import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getOrCreateVapidKeys(supabaseAdmin: any) {
  // Check if keys exist
  const { data: existing } = await supabaseAdmin
    .from("app_settings")
    .select("key, value")
    .in("key", ["vapid_public_key", "vapid_private_key", "vapid_email"]);

  const settings: Record<string, string> = {};
  existing?.forEach((s: any) => { settings[s.key] = s.value; });

  if (settings.vapid_public_key && settings.vapid_private_key) {
    return {
      publicKey: settings.vapid_public_key,
      privateKey: settings.vapid_private_key,
      email: settings.vapid_email || "mailto:admin@kurdistanai.com",
    };
  }

  // Generate new VAPID keys
  const vapidKeys = webpush.generateVAPIDKeys();
  const email = "mailto:admin@kurdistanai.com";

  await supabaseAdmin.from("app_settings").upsert([
    { key: "vapid_public_key", value: vapidKeys.publicKey },
    { key: "vapid_private_key", value: vapidKeys.privateKey },
    { key: "vapid_email", value: email },
  ], { onConflict: "key" });

  return { publicKey: vapidKeys.publicKey, privateKey: vapidKeys.privateKey, email };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // GET request = return VAPID public key
    if (req.method === "GET") {
      const vapid = await getOrCreateVapidKeys(supabaseAdmin);
      return new Response(JSON.stringify({ publicKey: vapid.publicKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST = send push notification
    const { user_id, title, body, link, type } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vapid = await getOrCreateVapidKeys(supabaseAdmin);
    webpush.setVapidDetails(vapid.email, vapid.publicKey, vapid.privateKey);

    // Get push subscriptions for this user
    const { data: subscriptions } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typeLabels: Record<string, string> = {
      new_question: "پرسیارێکی نوێ",
      new_project: "پڕۆژەیەکی نوێ",
      new_blog: "بابەتێکی نوێ",
      new_comment: "کۆمێنتێکی نوێ",
    };

    const payload = JSON.stringify({
      title: typeLabels[type] || "ئاگادارییەکی نوێ",
      body: title + (body ? ` - ${body}` : ""),
      icon: "/kurdistan-ai-logo.jpg",
      badge: "/kurdistan-ai-logo.jpg",
      data: { url: link || "/" },
      tag: type,
    });

    let sent = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent++;
      } catch (err: any) {
        console.error(`Push failed for ${sub.endpoint}:`, err.statusCode);
        // Remove expired/invalid subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          failedEndpoints.push(sub.endpoint);
        }
      }
    }

    // Clean up invalid subscriptions
    if (failedEndpoints.length > 0) {
      await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user_id)
        .in("endpoint", failedEndpoints);
    }

    return new Response(JSON.stringify({ sent, total: subscriptions.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Push notification error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
