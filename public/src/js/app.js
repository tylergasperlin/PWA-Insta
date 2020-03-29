let deferredPrompt;

if('serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('/sw.js')
    .then(function() {
        console.log('service worker registered')
    })
    .catch(function(err) {
        console.log(err)
    });
}

window.addEventListener('beforeinstallprompt' , function(event) {
    console.log('beforeinstallpropmt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
})

var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
        reject({code: 500, message:'An error occured!!'})
        // console.log('Called when timer is done')
    }, 3000)
});


// promise.then(function(text) {
//     return text;
// }, function(err){
//     console.log(err.code, err.message)
// }).then(function(newText) {
//     console.log(newText)
// })



promise.then(function(text) {
    return text;
}).then(function(newText) {
    console.log(newText)
}).catch(function(err) {
    console.log(err.code, err.message)
})


console.log('This is executed right after setTimeOut()')