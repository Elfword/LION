// shop/catalog-db.js
// Optional Phase-1 loader. Include after shop-config.js and before your catalog rendering code.
async function loadProductsFromSupabase() {
  if (!window.lionSupabase) throw new Error('Supabase client is not ready.');
  const { data, error } = await window.lionSupabase
    .from('products')
    .select('id,sku,name,description,compatibility,category,brand,price,original_price,stock,image,shopee_url,rating,sold_count,badge')
    .eq('active', true)
    .order('id');
  if (error) throw error;
  return data || [];
}
