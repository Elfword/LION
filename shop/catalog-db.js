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

  return data;
}
