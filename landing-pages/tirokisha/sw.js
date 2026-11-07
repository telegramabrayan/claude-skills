/* Tirokisha como app: siempre trae lo último de internet.
   Solo si no hay señal usa la copia guardada, así la tienda abre igual.
   Los datos de Supabase no se guardan acá (siempre van en vivo). */
const CACHE = 'tirokisha-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok && (req.mode === 'navigate' || /\.(jpg|jpeg|png|webp|json|webmanifest)$/i.test(url.pathname))) {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./') : undefined)))
  );
});
