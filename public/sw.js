
//Increment these any time there is a change to a cached file (not the service worker - service worker will reinstall for each change)
let CACHE_STATIC_NAME = 'static-v19'
let CACHE_DYNAMIC_NAME = 'dynamic-v2'
let STATIC_FILES = [
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
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

// clean up cache ~ limit cache items
// function trimCache(cacheName, maxItems) {
//     caches.open(cacheName)
//     .then(function(cache) {
//         return cache.keys()
//         .then(function(keys) {
//             if(keys.length > maxItems) {
//                 cache.delete(keys[0])
//                 .then(trimCache(cacheName, maxItems))
//             }
//         })
//     })
// }
 
function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN) a
      //console.log('matched ', string);
      cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
      cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
  }

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
        cache.addAll(STATIC_FILES)
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
    var url = 'https://pwa-gram-42a45.firebaseio.com/posts.json';
    var staticAssets = [];
    //Cache then network strategy
    //Use when you have connection and want to get data on screen quickly
    if(event.request.url.indexOf(url) > -1) {
        //fetch store and dont look if data is in cache already
        event.respondWith(
            caches.open(CACHE_DYNAMIC_NAME)
            .then(function(cache) {
                return fetch(event.request) //intercept all js requests
                .then(function(res) {
                    //trimCache(CACHE_DYNAMIC_NAME, 15);
                    cache.put(event.request, res.clone());
                    return res;
                })
            })
        );
        //cache only strategy for statically cached files
        //this only works beecause we load static files into cache as worker is installed
        //allows us to get static data without goiong to server
    } else if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
     }
    else {
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
                            //trimCache(CACHE_DYNAMIC_NAME, 15);
                            // Enable dynamic caching
                            cache.put(event.request.url, res.clone())
                                return res
                        })
                    }) 
                    .catch(function(err) {
                        return caches.open(CACHE_STATIC_NAME)
                        .then(function(cache) {
                            // here we apply a specific rule to this page. If help does not have css in cache it would be worthless
                            if(event.request.headers.get('accept').includes('text/html')) {
                                return cache.match('/offline.html'); 
                            }
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