export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) {
    console.error('Failed to load products:', error);
    throw error;
  }

  return data.map(normalizeProduct);
}

function normalizeProduct(product) {
  return {
    ...product,
    originalPrice: product.original_price,
    partNumber: product.sku,
    soldCount: product.sold_count,
    shopeeUrl: product.shopee_url
  };
}
