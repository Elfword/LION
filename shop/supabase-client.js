// shop/supabase-client.js
(function () {
  const cfg = window.LION_SHOP_CONFIG || {};
  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('YOUR_PROJECT')) {
    console.warn('Lion shop: Supabase config is not set.');
    return;
  }
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  s.onload = function () {
    window.lionSupabase = window.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_PUBLISHABLE_KEY
    );
    document.dispatchEvent(new Event('lion:supabase-ready'));
  };
  document.head.appendChild(s);
})();
