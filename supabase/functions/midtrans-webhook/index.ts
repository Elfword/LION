import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type"};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok",{headers:cors});
  try {
    const body = await req.json();
    const orderId = body.order_id;
    const status = body.transaction_status;
    if (!orderId || !status) return Response.json({error:"Invalid notification"},{status:400,headers:cors});

    const secret = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default
      || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const db = createClient(Deno.env.get("SUPABASE_URL"), secret);

    const {data:order,error:findErr}=await db.from("orders").select("*").eq("order_number",orderId).single();
    if(findErr) throw findErr;

    let payment_status = "pending", order_status = order.status;
    if(["settlement","capture"].includes(status)){ payment_status="paid"; order_status="paid"; }
    else if(["expire"].includes(status)){ payment_status="expired"; order_status="expired"; }
    else if(["cancel","deny"].includes(status)){ payment_status="cancelled"; order_status="cancelled"; }

    await db.from("orders").update({payment_status, status:order_status, payment_reference:body.transaction_id || null}).eq("id",order.id);

    if(["expired","cancelled"].includes(order_status)){
      await db.rpc("release_order_stock",{p_order_id:order.id});
    }

    return Response.json({ok:true},{headers:cors});
  } catch(e) {
    return Response.json({error:e.message},{status:400,headers:cors});
  }
});
