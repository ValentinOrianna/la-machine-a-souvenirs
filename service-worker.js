const CACHE_NAME = "la-machine-a-souvenirs-v29";


const FILES_TO_CACHE = [

    "./",
    "./index.html",
    "./manifest.json",
    "./data/defis.json",


    // CSS
    "./css/style.css",
    "./css/steampunk.css",
    "./css/animations.css",


    // JavaScript
    "./js/app.js",
    "./js/pwa.js",
    "./js/defis.js",
    "./js/gallery.js",
    "./js/leaderboard.js",
    "./js/guestbook.js",
    "./js/supabaseClient.js",
    "./js/vendor/supabase-js.min.js",
    "./js/offlineDB.js",
    "./js/syncManager.js",


    // Images principales
    "./assets/logo/logo.png",
    "./assets/background/background.png",
    "./assets/ui/frame.png",


    // Icônes
    "./assets/icons/camera.png",
    "./assets/icons/send.png",
    "./assets/icons/defis.png",
    "./assets/icons/galerie.png",
    "./assets/icons/trophe.png",
    "./assets/icons/book.png",
    "./assets/icons/setting.png",
    "./assets/icons/close.png",


    // Vapeur
    "./assets/smoke/smoke1.png",
    "./assets/smoke/smoke2.png",
    "./assets/smoke/smoke3.png",


    // Engrenages
    "./assets/gears/gear-small1.png",
    "./assets/gears/gear-small2.png",
    "./assets/gears/gear-medium.png",
    "./assets/gears/gear-large.png",


    // Couple
    "./assets/img/couple.jpg",


    // Icônes PWA
    "./assets/pwa/icon72.png",
    "./assets/pwa/icon96.png",
    "./assets/pwa/icon128.png",
    "./assets/pwa/icon144.png",
    "./assets/pwa/icon152.png",
    "./assets/pwa/icon192.png",
    "./assets/pwa/icon384.png",
    "./assets/pwa/icon512.png"

];



// INSTALLATION

self.addEventListener("install", (event) => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)
        .then((cache) => {

            return cache.addAll(FILES_TO_CACHE);

        })

    );

});




// ACTIVATION

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys()
        .then((keys) => {

            return Promise.all(

                keys
                .filter((key) => key !== CACHE_NAME)
                .map((key) => caches.delete(key))

            );

        })
        .then(() => self.clients.claim())

    );

});




// REQUETES

self.addEventListener("fetch", (event) => {


    const url = new URL(event.request.url);



    // ============================
    // SUPABASE
    // ============================

    // On ne met jamais Supabase dans le cache
    // Les données doivent rester en ligne

    if (url.hostname.includes("supabase.co")) {


        event.respondWith(

            fetch(event.request)
            .catch(() => {


                return new Response(

                    JSON.stringify({
                        offline: true,
                        message: "Connexion impossible"
                    }),

                    {
                        status: 503,

                        headers: {
                            "Content-Type": "application/json"
                        }

                    }

                );


            })

        );


        return;

    }




    // ============================
    // APPLICATION
    // ============================


    event.respondWith(

        caches.match(event.request)

        .then((cachedResponse) => {


            if (cachedResponse) {

                return cachedResponse;

            }


            return fetch(event.request);


        })

        .catch(() => {


            return caches.match("./index.html");


        })


    );


});