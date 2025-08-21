import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ---- Root runtime probe (temporary) ----
if (import.meta.env.PROD) {
  const url  = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log('[ROOT_ENV]', { url, anonDefined: !!anon });
  if (url && anon) {
    fetch(`${url}/functions/v1/fetch-products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${anon}` },
      body: '{}'
    })
    .then(async (r) => {
      const text = await r.text();
      console.log('[ROOT_PROBE]', { status: r.status, preview: text.slice(0,160) });
    })
    .catch(e => console.error('[ROOT_PROBE_ERROR]', e?.message || String(e)));
  }
}
// ---- end probe ----

createRoot(document.getElementById("root")!).render(<App />);
