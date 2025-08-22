const CACHE = "maliyet-cache-v1";
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Only same-origin
  if (url.origin !== location.origin) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(r => {
      // Optionally cache new GET requests
      if (e.request.method === "GET") {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match("./index.html")))
  );
});
