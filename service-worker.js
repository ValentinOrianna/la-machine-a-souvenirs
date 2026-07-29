const CACHE_NAME = "la-machine-a-souvenirs-v24";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./data/defis.json",

    "./css/style.css",
    "./css/steampunk.css",
    "./css/animations.css",

    "./js/app.js",
    "./js/pwa.js",
    "./js/defis.js",
    "./js/gallery.js",
    "./js/leaderboard.js",
    "./js/guestbook.js",
    "./js/supabaseClient.js",

    "./assets/logo/logo.png",
    "./assets/background/background.png",
    "./assets/ui/frame.png",

    "./assets/icons/camera.png",
    "./assets/icons/send.png",
    "./assets/icons/defis.png",
    "./assets/icons/galerie.png",
    "./assets/icons/trophe.png",
    "./assets/icons/book.png",
"./assets/icons/setting.png",
"./assets/icons/close.png",

"./assets/smoke/smoke1.png",
"./assets/smoke/smoke2.png",
"./assets/smoke/smoke3.png",

"./assets/gears/gear-small1.png",
"./assets/gears/gear-small2.png",
"./assets/gears/gear-medium.png",
"./assets/gears/gear-large.png",

"./assets/img/couple.jpg",

"./assets/pwa/icon144.png",
"./assets/pwa/icon192.png",
"./js/vendor/supabase-js.min.js",

];
self.addEventListener("install", (event) => {

    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
    );

});


self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys()
        .then((keys) =>
            Promise.all(
                keys
                .filter((key) => key !== CACHE_NAME)
                .map((key) => caches.delete(key))
            )
        )
        .then(() => self.clients.claim())

    );

});


self.addEventListener("fetch", (event) => {

    event.respondWith(

        caches.match(event.request)
        .then((cachedFile) => {

            return cachedFile || fetch(event.request);

        })
        .catch(() => {

          

        })

    );

});