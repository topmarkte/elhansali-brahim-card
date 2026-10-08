const CACHE_NAME = "elhansali-brahim-card-v4";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./WhatsApp%20Image%202026-10-08%20at%2020.40.21.jpeg",

    /* QR Code */
    "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js",

    /* Font Awesome */
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",

    /* Google Fonts */
    "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap"
];


self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(async cache => {

            for(const file of FILES_TO_CACHE){

                try{

                    const response = await fetch(file);

                    if(response.ok || response.type === "opaque"){
                        await cache.put(file, response);
                    }

                }catch(error){

                    console.log(
                        "Offline cache skipped:",
                        file
                    );

                }

            }

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

    event.respondWith(

        caches.match(request).then(cachedResponse => {

            if(cachedResponse){
                return cachedResponse;
            }

            return fetch(request).then(response => {

                if(response && response.status === 200){

                    const copy = response.clone();

                    caches.open(CACHE_NAME).then(cache => {

                        cache.put(request, copy);

                    });

                }

                return response;

            }).catch(() => {

                /* إذا كانت الصفحة مطلوبة بدون إنترنت */
                if(request.mode === "navigate"){
                    return caches.match("./index.html");
                }

                return new Response(
                    "",
                    {
                        status:503,
                        statusText:"Offline"
                    }
                );

            });

        })

    );
});
