const CACHE_NAME = "la-machine-a-souvenirs-v19";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",

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
    "./assets/icons/close.png"
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

    );

});