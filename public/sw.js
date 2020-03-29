self.addEventListener('install', function(event) {
    console.log('[Service worker] Installing service worker...' , event)
    event.waitUntil(caches.open('static') //can name static or whatever you want
    .then(function(cache){
        console.log('[Service worker] Precaching app shell')
        cache.add('/src/js/app.js')
    }))
})

self.addEventListener('activate', function(event) {
    console.log('[Service worker] Activating service worker...' , event)
    // return self.client.claim();
})

self.addEventListener('fetch', function(event) {
    event.respondWith(fetch(event.request));
})

