
//Increment these any time there is a change to a cached file (not the service worker - service worker will reinstall for each change)
let CACHE_STATIC_NAME = 'static-v13'
let CACHE_DYNAMIC_NAME = 'dynamic-v2'

self.addEventListener('install', function(event) {
    console.log('[Service worker] Installing service worker...' , event)
    event.waitUntil(
        //when versioning caches you want to use a new name so the new cache does not interfere with the currently used content
    caches.open(CACHE_STATIC_NAME) //can name static or whatever you want
    .then(function(cache){
        console.log('[Service worker] Precaching app shell')
        //this is what caches content. 
        //think of these as requests not paths
        //needed to cache / so when user navigates to the main page we request the appropriate resource = index.html
        cache.addAll([
            '/',
            '/index.html',
            '/offline.html',
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
                if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME){
                    console.log('[Service worker] Removing old cache', key);
                    return caches.delete(key)
                }

            }));
        })

    )
    //return self.client.claim();
})

//Cache then network with offline support 
//Full control over resources
self.addEventListener('fetch', function(event) {
    var url = 'https://httpbin.org/get';
    //Cache then network strategy
    //Use when you have connection and want to get data on screen quickly
    if(event.request.url.indexOf(url) > -1) {
        //fetch store and dont look if data is in cache already
        event.respondWith(
            caches.open(CACHE_DYNAMIC_NAME)
            .then(function(cache) {
                return fetch(event.request) //intercept all js requests
                .then(function(res) {
                    cache.put(event.request, res.clone());
                    return res;
                })
            })
        );
    } else {
        // Cache with network fallback (cache first then network)
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
                        return caches.open(CACHE_DYNAMIC_NAME)
                        .then(function(cache){
                            // Enable dynamic caching
                            cache.put(event.request.url, res.clone())
                                return res
                        })
                    }) 
                    .catch(function(err) {
                        return caches.open(CACHE_STATIC_NAME)
                        .then(function(cache) {
                            return cache.match('/offline.html');
                        })
                    })
                }
            })
        )
    }
})


// // Cache then network strategy
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         caches.match(event.request)
//         //dont use catch here because the response comes back null if error
//             .then(function(response){
//                 if(response){
//                     return response;
//                 } else {
//                     return fetch(event.request)
//                     .then(function(res){
//                         //can call whatever we want - separate from the other cache
//                         return caches.open(CACHE_DYNAMIC_NAME)
//                         .then(function(cache){
//                             // Enable dynamic caching
//                             cache.put(event.request.url, res.clone())
//                                 return res
//                         })
//                     }) 
//                     .catch(function(err) {
//                         return caches.open(CACHE_STATIC_NAME)
//                         .then(function(cache) {
//                             return cache.match('/offline.html');
//                         })
//                     })
//                 }
//             })
//     );
// })

// //Network First then Cache strategy = dont use because you would have to wait for request to come back and time out 
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         fetch(event.request)
//         .then(function(res) {
//             return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache){
//                     // Enable dynamic caching
//                     cache.put(event.request.url, res.clone())
//                     return res;
//             })
//         })
//         .catch(function(err) {
//             return caches.match(event.request)
//         })
//     );
// })


// Cache only strategy 
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         caches.match(event.request)

//     );
// })

// Network only -- really no reason to use this - just use normal request
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         fetch(event.request)
//     );
// })