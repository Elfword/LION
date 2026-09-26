// shop/cart.js
(function () {
  const KEY = 'lion_cart_v1';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('lion:cart-changed', { detail: items }));
  }
  function add(product, quantity = 1) {
    const items = read();
    const existing = items.find(x => String(x.product_id) === String(product.id));
    if (existing) existing.quantity += quantity;
    else items.push({
      product_id: product.id,
      sku: product.partNumber || String(product.id),
      name: product.name,
      price: Number(product.price || 0),
      image: product.image || '',
      quantity
    });
    write(items);
    return items;
  }
  function setQty(productId, quantity) {
    const items = read().map(x => String(x.product_id) === String(productId)
      ? { ...x, quantity: Math.max(0, Number(quantity) || 0) } : x)
      .filter(x => x.quantity > 0);
    write(items);
  }
  function remove(productId) { setQty(productId, 0); }
  function clear() { write([]); }
  function count() { return read().reduce((n,x) => n + x.quantity, 0); }
  function subtotal() { return read().reduce((n,x) => n + x.price*x.quantity, 0); }
  function rupiah(n) { return 'Rp ' + Number(n||0).toLocaleString('id-ID'); }

  window.LionCart = { read, write, add, setQty, remove, clear, count, subtotal, rupiah };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      const render = () => el.textContent = count();
      render();
      document.addEventListener('lion:cart-changed', render);
    });
  });
})();
