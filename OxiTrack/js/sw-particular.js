// ==========================================================
// OXITRACK - SERVICE WORKER PARTICULAR
// ==========================================================

const CACHE_NAME =
    "oxitrack-particular-v1";

const DB_NAME =
    "oxitrack_particular_db";

const DB_VERSION = 1;

const STORE_NAME =
    "envios";

const WORKER_URL =
    "https://oxilife.cl/api/oxitrack/";


const APP_SHELL = [
    "./particular.html",
    "./css/oxitrack-base.css",
    "./css/particular.css",
    "./js/particular.js",
    "/assets/img/favicon.png"
];


// ==========================================================
// INSTALL
// ==========================================================

self.addEventListener(
    "install",
    event => {

        event.waitUntil(
            caches
                .open(CACHE_NAME)
                .then(
                    cache =>
                        cache.addAll(
                            APP_SHELL
                        )
                )
        );

        self.skipWaiting();

    }
);


// ==========================================================
// ACTIVATE
// ==========================================================

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(
            (async () => {

                const nombres =
                    await caches.keys();


                await Promise.all(
                    nombres
                        .filter(
                            nombre =>
                                nombre.startsWith(
                                    "oxitrack-particular-"
                                ) &&
                                nombre !== CACHE_NAME
                        )
                        .map(
                            nombre =>
                                caches.delete(
                                    nombre
                                )
                        )
                );


                await self.clients.claim();

            })()
        );

    }
);


// ==========================================================
// CACHE DE RECURSOS ESTÁTICOS
// NO INTERFERIR CON /api/
// ==========================================================

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        if (
            request.method !== "GET"
        ) {
            return;
        }


        const url =
            new URL(
                request.url
            );


        if (
            url.pathname.startsWith(
                "/api/"
            )
        ) {
            return;
        }


        event.respondWith(
            (async () => {

                try {

                    const respuesta =
                        await fetch(request);


                    if (
                        respuesta.ok ||
                        respuesta.type === "opaque"
                    ) {

                        const cache =
                            await caches.open(
                                CACHE_NAME
                            );


                        cache.put(
                            request,
                            respuesta.clone()
                        );

                    }


                    return respuesta;


                } catch {

                    const cache =
                        await caches.open(
                            CACHE_NAME
                        );


                    const guardado =
                        await cache.match(
                            request,
                            {
                                ignoreSearch: true
                            }
                        );


                    if (guardado) {
                        return guardado;
                    }


                    if (
                        request.mode ===
                        "navigate"
                    ) {

                        const pagina =
                            await cache.match(
                                "./particular.html",
                                {
                                    ignoreSearch: true
                                }
                            );


                        if (pagina) {
                            return pagina;
                        }

                    }


                    throw new Error(
                        "Recurso no disponible offline."
                    );

                }

            })()
        );

    }
);


// ==========================================================
// INDEXEDDB
// ==========================================================

function abrirDb() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                () => {

                    const db =
                        request.result;


                    if (
                        !db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        db.createObjectStore(
                            STORE_NAME,
                            {
                                keyPath:
                                    "envioId"
                            }
                        );

                    }

                };


            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );


            request.onerror =
                () =>
                    reject(
                        request.error
                    );

        }
    );

}


async function obtenerPendientes() {

    const db =
        await abrirDb();


    return new Promise(
        (resolve, reject) => {

            const tx =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const request =
                tx
                    .objectStore(
                        STORE_NAME
                    )
                    .getAll();


            request.onsuccess =
                () => {

                    const registros =
                        Array.isArray(
                            request.result
                        )
                            ? request.result
                            : [];

                    db.close();

                    resolve(
                        registros
                    );

                };


            request.onerror =
                () => {

                    const error =
                        request.error;

                    db.close();

                    reject(error);

                };

        }
    );

}


async function eliminarPendiente(
    envioId
) {

    const db =
        await abrirDb();


    return new Promise(
        (resolve, reject) => {

            const tx =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            tx
                .objectStore(
                    STORE_NAME
                )
                .delete(envioId);


            tx.oncomplete =
                () => {

                    db.close();

                    resolve();

                };


            tx.onerror =
                () => {

                    const error =
                        tx.error;

                    db.close();

                    reject(error);

                };

        }
    );

}


// ==========================================================
// CONSTRUIR PAYLOAD
// ==========================================================

function construirPayload(registro) {

    const payload = new FormData();
    payload.append("tipoCliente","PARTICULAR");
    payload.append("envioId",registro.envioId);
    payload.append("servicio",registro.servicio);
    payload.append("pacienteId",registro.pacienteId);
    payload.append("elementos",registro.elementos);
    payload.append("paciente",registro.paciente);
    payload.append("entrega07",registro.entrega07);
    payload.append("entrega10",registro.entrega10);
    payload.append("retiro07",registro.retiro07);
    payload.append("retiro10",registro.retiro10);
    payload.append("observaciones",registro.observaciones);
    payload.append("gps",registro.gps);
    payload.append("dispositivo",registro.dispositivo);
    payload.append("firma",registro.firma,"firma.png");


    if (registro.foto) {
        payload.append("foto",registro.foto,"foto-servicio-1.jpg");
    }

    if (registro.foto2) {
        payload.append("foto2",registro.foto2,"foto-servicio-2.jpg");
    }

    return payload;
}

// ==========================================================
// SINCRONIZAR
// ==========================================================

async function sincronizarParticular() {

    const registros = await obtenerPendientes();

    registros.sort(
        (a, b) =>
            String(
                a.fechaCreacion ||
                ""
            ).localeCompare(
                String(
                    b.fechaCreacion ||
                    ""
                )
            )
    );


    for (
        const registro of registros
    ) {

        try {

            const respuesta =
                await fetch(
                    WORKER_URL,
                    {
                        method:
                            "POST",

                        body:
                            construirPayload(
                                registro
                            ),

                        credentials:
                            "same-origin"
                    }
                );


            const tipoContenido =
                respuesta.headers.get(
                    "content-type"
                ) || "";


            if (
                !tipoContenido.includes(
                    "application/json"
                )
            ) {

                throw new Error(
                    "La sesión no está disponible o el servidor no devolvió JSON."
                );

            }


            const resultado =
                await respuesta.json();


            if (
                !respuesta.ok ||
                resultado.ok !== true
            ) {

                throw new Error(
                    resultado.error ||
                    "El servidor rechazó el registro."
                );

            }


            await eliminarPendiente(
                registro.envioId
            );


        } catch (error) {

            console.error(
                "Background Sync Particular:",
                error
            );


            throw error;

        }

    }

}


// ==========================================================
// BACKGROUND SYNC
// ==========================================================

self.addEventListener(
    "sync",
    event => {

        if (
            event.tag ===
            "oxitrack-particular-sync"
        ) {

            event.waitUntil(
                sincronizarParticular()
            );

        }

    }
);


// ==========================================================
// SINCRONIZACIÓN SOLICITADA POR LA PÁGINA
// ==========================================================

self.addEventListener(
    "message",
    event => {

        if (
            event.data &&
            event.data.type ===
            "SINCRONIZAR_PARTICULAR"
        ) {

            event.waitUntil(
                sincronizarParticular()
            );

        }

    }
);