# Lion Automotive Part — E-commerce Starter

This package preserves the existing static site and adds a path to a real store without a custom MySQL server.

## Chosen stack

- Existing HTML/CSS/Vanilla JS frontend
- Supabase Postgres for the database
- Supabase Edge Functions for server-side logic
- Midtrans Snap for checkout payments
- Jubelio API for stock/price synchronization
- Excel import as fallback when API access is not available

Supabase publishable keys can be used in the browser only with proper RLS; never expose service/secret keys. Midtrans Server Key and Jubelio credentials belong in Edge Function secrets.

## First setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Copy `shop/shop-config.example.js` to `shop/shop-config.js`.
4. Put your Supabase URL and publishable/anon key into `shop/shop-config.js`.
5. Import products:
   `pip install requests openpyxl`
   `set SUPABASE_URL=...`
   `set SUPABASE_SERVICE_ROLE_KEY=...`
   `python scripts/import_products.py --sales-xlsx mass_update_sales_info_829432638_20260826124033.xlsx`
6. Add `shop/cart.js` to pages that show the cart counter.
7. Link `cart.html` from the navbar.
8. Deploy the Edge Functions.

## Edge Function secrets

Set these in Supabase Edge Function Secrets:

- MIDTRANS_SERVER_KEY=...
- MIDTRANS_ENV=sandbox
- JUBELIO_EMAIL=...
- JUBELIO_PASSWORD=...

Do NOT put these into HTML, JS, Git, or the browser.

## Deploy

Install the Supabase CLI, then:

  supabase login
  supabase link --project-ref YOUR_PROJECT_REF
  supabase functions deploy create-order
  supabase functions deploy midtrans-webhook
  supabase functions deploy jubelio-sync

Configure the Midtrans Notification URL to:

  https://YOUR_PROJECT.supabase.co/functions/v1/midtrans-webhook

Start with Midtrans sandbox. Switch MIDTRANS_ENV to production only after end-to-end testing.

## Important: Jubelio field mapping

The Jubelio API documents master products, SKU lookup, price endpoints, and inventory/stock endpoints. The starter sync intentionally uses a conservative SKU match. Before enabling automatic updates, call the Jubelio master-product endpoint once and inspect the actual JSON fields returned by YOUR account. Then finalize the `available_qty` / `sell_price` mapping in `supabase/functions/jubelio-sync/index.ts`.

Jubelio access tokens expire after 12 hours, so the function logs in to obtain a fresh token instead of storing a token permanently.

## Recommended rollout

Phase 1: Database + import + catalog reads
Phase 2: Cart
Phase 3: Checkout + order creation
Phase 4: Midtrans sandbox
Phase 5: Admin/order management
Phase 6: Jubelio API sync
Phase 7: automatic scheduled sync + shipping integration

Do not make the website's local JSON the source of truth after Phase 1. The database should become the source for website prices and stock.
