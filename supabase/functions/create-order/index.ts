import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const body = await req.json();
    if (!body.customer_name || !body.customer_phone || !body.shipping_address || !Array.isArray(body.items)) {
      return Response.json({ error: "Data checkout belum lengkap." }, { status: 400, headers: cors });
    }

    const secret = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default
      || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const url = Deno.env.get("SUPABASE_URL");
    if (!url || !secret) throw new Error("Supabase server secret belum dikonfigurasi.");

    const db = createClient(url, secret);
    const { data, error } = await db.rpc("create_order", {
      p_customer_name: body.customer_name,
      p_customer_email: body.customer_email || null,
      p_customer_phone: body.customer_phone,
      p_shipping_address: body.shipping_address,
      p_shipping_city: body.shipping_city || null,
      p_shipping_postal_code: body.shipping_postal_code || null,
      p_shipping_method: body.shipping_method || null,
      p_shipping_cost: Number(body.shipping_cost || 0),
      p_notes: body.notes || null,
      p_items: body.items
    });
    if (error) throw error;

    // Midtrans is intentionally optional until credentials are configured.
    let payment = null;
    const midtransKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    if (midtransKey) {
      const auth = btoa(midtransKey + ":");
      const endpoint = Deno.env.get("MIDTRANS_ENV") === "production"
        ? "https://app.midtrans.com/snap/v1/transactions"
        : "https://app.sandbox.midtrans.com/snap/v1/transactions";
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Basic " + auth },
        body: JSON.stringify({
          transaction_details: { order_id: data.order_number, gross_amount: data.total },
          customer_details: {
            first_name: body.customer_name,
            email: body.customer_email || undefined,
            phone: body.customer_phone
          }
        })
      });
      const j = await resp.json();
      if (!resp.ok) throw new Error(j.error_messages?.join(", ") || "Midtrans gagal membuat transaksi.");
      payment = { token: j.token, redirect_url: j.redirect_url };
      await db.from("orders").update({ payment_provider:"midtrans", payment_token:j.token }).eq("id",data.order_id);
    }

    return Response.json({ ...data, payment }, { headers: cors });
  } catch (e) {
    return Response.json({ error: e.message || "Server error" }, { status: 400, headers: cors });
  }
});
