import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getVapidConfig() {
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const email = Deno.env.get("VAPID_EMAIL") || "mailto:admin@kurdistanai.com";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys not configured in environment secrets");
  }

  return { publicKey, privateKey, email };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const vapid = getVapidConfig();

    // GET request = return VAPID public key
    if (req.method === "GET") {
      return new Response(JSON.stringify({ publicKey: vapid.publicKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // POST = send push notification
    const { user_id, title, body, link, type } = await req.json();

    if (!user_id || typeof user_id !== "string") {
      return new Response(JSON.stringify({ error: "valid user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const safeTitle = typeof title === "string" ? title.slice(0, 200) : "";
    const safeBody = typeof body === "string" ? body.slice(0, 500) : "";

    const payload = JSON.stringify({
      title: typeLabels[type] || "ئاگادارییەکی نوێ",
      body: safeTitle + (safeBody ? ` - ${safeBody}` : ""),
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
        console.error(`Push failed for endpoint:`, err.statusCode);
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
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
