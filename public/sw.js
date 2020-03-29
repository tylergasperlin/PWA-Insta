self.addEventListener('install', function(event) {
    console.log('[Service worker] Installing service worker...' , event)
    event.waitUntil(
        //when versioning caches you want to use a new name so the new cache does not interfere with the currently used content
    caches.open('static-v3') //can name static or whatever you want
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
    event.waitUntil(
        //get all keys of caches
        //clean up cache. Delete caches not equal to the current cache
        caches.keys()
        .then(function(keyList){
            return Promise.all(keyList.map(function(key) {
                if(key !== 'static-v3' && key !== 'dynamic'){
                    console.log('[Service worker] Removing old cache', key);
                    return caches.delete(key)
                }

            }));
        })

    )
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
                    .catch(function(err) {

                    })
                }
            })
    );
})

