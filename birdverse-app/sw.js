// Birdverse offline support: keep a copy of the game on the device so it opens with no internet.
// Online: always fetch the newest version first (and save it). Offline: use the saved copy.
const CACHE='birdverse-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./','./index.html']).catch(()=>{}))); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const req=e.request; if (req.method!=='GET') return;
  const url=new URL(req.url); if (url.origin!==location.origin) return;
  const isPage=req.mode==='navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  if (isPage){
    e.respondWith(fetch(req,{cache:'no-store'}).then(r => { if (r && r.ok){ const cp=r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); } return r; })
      .catch(() => caches.match('./index.html').then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r && r.ok){ const cp=r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })));
});
