self.addEventListener('install', function(event) {
    console.log('[Service worker] Installing service worker...' , event)
    event.waitUntil(
    caches.open('static') //can name static or whatever you want
    .then(function(cache){
        console.log('[Service worker] Precaching app shell')
        //this is what caches content. 
        //think of these as requests not paths
        //needed to cache / so when user navigates to the main page we request the appropriate resource = index.html
        cache.add('/')
        cache.add('/index.html')
        cache.add('/src/js/app.js')
    }))
})

self.addEventListener('activate', function(event) {
    console.log('[Service worker] Activating service worker...' , event)
    // return self.client.claim();
})

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        //dont use catch here because the response comes back null if error
            .then(function(response){
                if(response){
                    return response;
                } else {
                    return fetch(event.request);
                }
            })
    );
})

