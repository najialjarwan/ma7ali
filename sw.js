self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("app-cache").then((cache) => {
            return cache.addAll([
                "/",                         // Make sure to cache the root page if needed
                "/index.html",               // Make sure to cache the HTML file
                "/css/index.css",            // Correct path to CSS
                "/js/index.js",              // Correct path to JavaScript file
                "/icons/inventory3.svg"       // Correct path to your logo
            ]);
        }).catch((err) => {
            console.error("Failed to cache files:", err);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = ['static-cache'];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
