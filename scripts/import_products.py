#!/usr/bin/env python3
"""
Import the existing products.json into Supabase.

Install:
  pip install requests openpyxl

Set:
  SUPABASE_URL=https://YOUR_PROJECT.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=...

Run:
  python scripts/import_products.py

Optional marketplace export:
  python scripts/import_products.py --sales-xlsx mass_update_sales_info_829432638_20260826124033.xlsx

The script uses partNumber as SKU and can overwrite price/stock from the XLSX.
"""
import argparse, json, os, sys, requests, openpyxl

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS=os.path.join(ROOT,"products.json")

def supa_headers():
    key=os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not key: raise SystemExit("Set SUPABASE_SERVICE_ROLE_KEY first.")
    return {"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates"}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--sales-xlsx")
    args=ap.parse_args()
    base=os.environ.get("SUPABASE_URL")
    if not base: raise SystemExit("Set SUPABASE_URL first.")

    data=json.load(open(PRODUCTS,encoding="utf8"))["products"]
    stock_price={}
    if args.sales_xlsx:
        wb=openpyxl.load_workbook(args.sales_xlsx,read_only=True,data_only=True)
        ws=wb.active
        for row in ws.iter_rows(min_row=4,values_only=True):
            if len(row)<6: continue
            sku,price,stock=row[2],row[4],row[5]
            if sku:
                try: stock_price[str(sku).strip()]={"price":int(float(price or 0)),"stock":max(0,int(float(stock or 0)))}
                except: pass

    rows=[]
    for p in data:
        sku=str(p.get("partNumber") or p.get("id")).strip()
        x=stock_price.get(sku,{})
        rows.append({
          "legacy_id":p.get("id"),"sku":sku,"name":p.get("name",""),
          "description":p.get("description"),"compatibility":p.get("compatibility"),
          "category":p.get("category"),"brand":p.get("brand"),
          "price":x.get("price",int(p.get("price") or 0)),
          "original_price":p.get("originalPrice"),
          "stock":x.get("stock", 0 if str(p.get("stock","")).lower() not in ("tersedia","ready stock") else 1),
          "image":p.get("image"),"shopee_url":p.get("shopeeUrl"),
          "rating":p.get("rating"),"sold_count":p.get("soldCount"),"badge":p.get("badge"),
          "active":True,"source":"initial-import"
        })
    url=base.rstrip("/")+"/rest/v1/products"
    h=supa_headers()
    for i in range(0,len(rows),500):
        r=requests.post(url,headers=h,json=rows[i:i+500],timeout=60)
        if not r.ok: print(r.text); r.raise_for_status()
        print("Imported",min(i+500,len(rows)),"/",len(rows))
if __name__=="__main__": main()
