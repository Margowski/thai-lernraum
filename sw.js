// Thai Lernraum – macht die App ohne Internet nutzbar.
// Die Seite selbst wird bei bestehender Verbindung immer frisch geholt (so kommen neue Versionen an),
// ohne Verbindung kommt die zuletzt gespeicherte Fassung.
const CACHE = "thai-lernraum-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // KI, Abgleich usw. gehen direkt ins Netz
  if (url.pathname.includes("/ton/")) return;                         // Tonpakete: immer frisch, die App legt sie selbst ab
  const isPage = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html");
  if (isPage){
    e.respondWith(fetch(req).then(r => { if (r && r.ok){ const cp = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); } return r; })
      .catch(() => caches.match("./index.html").then(r => r || caches.match("./"))));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { if (n && n.ok){ const cp = n.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return n; })));
  }
});
