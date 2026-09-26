import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type, authorization"};

async function jubelioToken() {
  const email = Deno.env.get("JUBELIO_EMAIL");
  const password = Deno.env.get("JUBELIO_PASSWORD");
  const r = await fetch("https://api2.jubelio.com/login", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
  });
  const j = await r.json();
  if(!r.ok) throw new Error("Jubelio login gagal");
  return j.access_token || j.token;
}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  try{
    const secret = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default
      || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const db=createClient(Deno.env.get("SUPABASE_URL"),secret);
    const token=await jubelioToken();
    const headers={Authorization:"Bearer "+token};

    // Jubelio documents the master-product endpoint with max page size 200.
    // We fetch pages and match item_code to our products.sku.
    let page=1, updated=0, skipped=0;
    while(true){
      const url=`https://api2.jubelio.com/inventory/items/masters?page=${page}&pageSize=200`;
      const r=await fetch(url,{headers});
      if(!r.ok) throw new Error("Jubelio inventory request failed: "+r.status);
      const j=await r.json();
      const rows=Array.isArray(j)?j:(j.data||j.items||[]);
      if(!rows.length) break;
      for(const x of rows){
        const sku=String(x.item_code ?? x.sku ?? "").trim();
        if(!sku) {skipped++; continue;}
        // Field names can differ by account/version. Adjust stock/price mapping
        // after inspecting one real API response.
        const stock=Number(x.available_qty ?? x.available ?? x.stock ?? NaN);
        const price=Number(x.sell_price ?? x.price ?? NaN);
        const patch={source:"jubelio",source_updated_at:new Date().toISOString()};
        if(Number.isFinite(stock)) patch.stock=Math.max(0,Math.floor(stock));
        if(Number.isFinite(price)) patch.price=Math.max(0,Math.floor(price));
        const {data}=await db.from("products").update(patch).eq("sku",sku).select("id");
        if(data?.length) updated++; else skipped++;
      }
      if(rows.length<200) break;
      page++;
    }
    await db.from("inventory_sync_logs").insert({source:"jubelio",status:"success",updated_count:updated,skipped_count:skipped,message:"API sync complete"});
    return Response.json({ok:true,updated,skipped},{headers:cors});
  }catch(e){
    return Response.json({error:e.message},{status:400,headers:cors});
  }
});
