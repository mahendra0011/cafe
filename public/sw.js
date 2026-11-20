const CACHE = "cafe-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.keys().then((k) => k.includes(CACHE) || caches.create(CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((k) => k.filter((n) => n !== CACHE))
      .forEach((n) => caches.delete(n)),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(req, res));
        return res;
      });
    }),
  );
});
