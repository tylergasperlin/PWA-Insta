self.addEventListener('install', function(event) {
    console.log('[Service worker] Installing service worker...' , event)
    event.waitUntil(
    caches.open('static') //can name static or whatever you want
    .then(function(cache){
        console.log('[Service worker] Precaching app shell')
        //this is what caches content. 
        //think of these as requests not paths
        //needed to cache / so when user navigates to the main page we request the appropriate resource = index.html
        cache.addAll([
            '/',
            '/index.html',
            '/src/js/app.js',
            '/src/js/feed.js',
            '/src/js/promise.js',
            '/src/js/fetch.js',
            '/src/js/material.min.js',
            '/src/css/app.css',
            '/src/css/feed.css',
            '/src/css/help.css',
            '/src/images/main-image.jpg',
            'https://fonts.googleapis.com/css?family=Roboto:400,700',
            'https://fonts.googleapis.com/icon?family=Material+Icons',
            'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
        ])
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
                    return fetch(event.request)
                    .then(function(res){
                        //can call whatever we want - separate from the other cache
                        return caches.open('dynamic')
                        .then(function(cache){
                            cache.put(event.request.url, res.clone())
                                return res
                        })
                    })
                }
            })
    );
})

