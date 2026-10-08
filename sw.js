const CACHE_NAME = "elhansali-brahim-card-v2";

const LOCAL_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./WhatsApp%20Image%202026-10-08%20at%2020.40.21.jpeg"
];

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(LOCAL_FILES);
        })
    );

    self.skipWaiting();
});


self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys => {

            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );

        })
    );

    self.clients.claim();
});


self.addEventListener("fetch", event => {

    const request = event.request;

    /*
     * صفحات البطاقة
     */
    if(request.mode === "navigate"){

        event.respondWith(

            fetch(request)
                .then(response => {

                    const copy = response.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, copy);
                    });

                    return response;

                })
                .catch(() => {

                    return caches.match("./index.html");

                })
        );

        return;
    }


    /*
     * الملفات والصور والخدمات الخارجية
     */
    event.respondWith(

        caches.match(request)
            .then(cachedResponse => {

                if(cachedResponse){
                    return cachedResponse;
                }

                return fetch(request)
                    .then(response => {

                        const copy = response.clone();

                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, copy);
                        });

                        return response;

                    })
                    .catch(() => {

                        return new Response(
                            "",
                            {
                                status: 503,
                                statusText: "Offline"
                            }
                        );

                    });

            })

    );

});
