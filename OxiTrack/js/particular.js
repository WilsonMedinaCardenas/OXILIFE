// ==========================================================
// OXITRACK - PARTICULAR
// ==========================================================

const WORKER_URL = "https://oxilife.cl/api/oxitrack/";
const CLAVE_CACHE_SERVICIOS = "oxitrack_particular_servicios";
const CLAVE_CACHE_PACIENTES = "oxitrack_particulares_cache";
const CLAVE_CACHE_ELEMENTOS = "oxitrack_particular_elementos";
const DB_PARTICULAR = "oxitrack_particular_db";
const DB_PARTICULAR_VERSION = 1;
const STORE_ENVIOS_PARTICULAR = "envios";

let sincronizacionParticularEnCurso = false;

let coordenadasGPS = "Buscando señal GPS...";
let pacientesDisponibles = [];
let streamCamara = null;
let fotosCapturadas = [];
let signaturePad = null;
let elementosDisponibles = [];
let envioIdParticularActual = "";
let resultadoServicioParticular = "ATENDIDO";

// ==========================================================
// MODALES OXITRACK
// ==========================================================

function abrirModalConfirmacion(contenidoHtml) {

    return new Promise(resolve => {

        const modal =
            document.getElementById("modalConfirmacion");

        const resumen =
            document.getElementById("modalResumen");

        const btnVolver =
            document.getElementById("btnModalVolver");

        const btnConfirmar =
            document.getElementById("btnModalConfirmar");


        resumen.innerHTML = contenidoHtml;

        modal.hidden = false;


        const cerrar = resultado => {

            modal.hidden = true;

            btnVolver.onclick = null;
            btnConfirmar.onclick = null;

            resolve(resultado);

        };


        btnVolver.onclick =
            () => cerrar(false);


        btnConfirmar.onclick =
            () => cerrar(true);

    });

}


function mostrarModalResultado(titulo, mensaje) {

    return new Promise(resolve => {

        const modal =
            document.getElementById("modalResultado");

        const tituloElemento =
            document.getElementById("modalResultadoTitulo");

        const mensajeElemento =
            document.getElementById("modalResultadoMensaje");

        const boton =
            document.getElementById("btnModalResultado");


        tituloElemento.textContent = titulo;

        mensajeElemento.textContent = mensaje;

        modal.hidden = false;


        boton.onclick = () => {

            modal.hidden = true;

            boton.onclick = null;

            resolve();

        };

    });

}


function generarEnvioIdParticular() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2) +
        "-" +
        Math.random().toString(36).slice(2)
    );
}

// ==========================================================
// CACHE LOCAL
// ==========================================================

function guardarServiciosOffline(servicios) {
    localStorage.setItem(CLAVE_CACHE_SERVICIOS, JSON.stringify(servicios));
}

function obtenerServiciosOffline() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE_CACHE_SERVICIOS) || "[]");
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function guardarPacientesOffline(servicio, pacientes) {
    try {
        const cache = JSON.parse(localStorage.getItem(CLAVE_CACHE_PACIENTES) || "{}");
        cache[servicio] = { actualizado: Date.now(), pacientes };
        localStorage.setItem(CLAVE_CACHE_PACIENTES, JSON.stringify(cache));
    } catch (error) {
        console.warn("No fue posible guardar pacientes offline.", error);
    }
}

function obtenerPacientesOffline(servicio) {
    try {
        const cache = JSON.parse(localStorage.getItem(CLAVE_CACHE_PACIENTES) || "{}");
        return Array.isArray(cache[servicio]?.pacientes) ? cache[servicio].pacientes : [];
    } catch {
        return [];
    }
}

// ==========================================================
// CACHE LOCAL DE ELEMENTOS
// ==========================================================

function guardarElementosOffline(tipo, elementos) {

    try {

        const cache =
            JSON.parse(
                localStorage.getItem(CLAVE_CACHE_ELEMENTOS) ||
                "{}"
            );

        cache[String(tipo || "").trim()] = elementos;

        localStorage.setItem(
            CLAVE_CACHE_ELEMENTOS,
            JSON.stringify(cache)
        );

    } catch (error) {

        console.warn(
            "No fue posible guardar elementos offline.",
            error
        );

    }

}


function obtenerElementosOffline(tipo) {

    try {

        const cache =
            JSON.parse(
                localStorage.getItem(CLAVE_CACHE_ELEMENTOS) ||
                "{}"
            );

        const elementos =
            cache[String(tipo || "").trim()];

        return Array.isArray(elementos)
            ? elementos
            : [];

    } catch {

        return [];

    }

}

// ==========================================================
// INDEXEDDB - COLA PARTICULAR
// ==========================================================

function abrirDbParticular() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                DB_PARTICULAR,
                DB_PARTICULAR_VERSION
            );


        request.onupgradeneeded = () => {

            const db = request.result;

            if (
                !db.objectStoreNames.contains(
                    STORE_ENVIOS_PARTICULAR
                )
            ) {

                db.createObjectStore(
                    STORE_ENVIOS_PARTICULAR,
                    {
                        keyPath: "envioId"
                    }
                );

            }

        };


        request.onsuccess = () =>
            resolve(request.result);


        request.onerror = () =>
            reject(request.error);

    });

}


async function guardarEnvioOfflineParticular(registro) {

    const db =
        await abrirDbParticular();


    return new Promise((resolve, reject) => {

        const tx =
            db.transaction(
                STORE_ENVIOS_PARTICULAR,
                "readwrite"
            );


        tx.objectStore(
            STORE_ENVIOS_PARTICULAR
        ).put(registro);


        tx.oncomplete = () => {

            db.close();
            resolve();

        };


        tx.onerror = () => {

            const error = tx.error;

            db.close();

            reject(error);

        };

    });

}


async function obtenerEnviosOfflineParticular() {

    const db =
        await abrirDbParticular();


    return new Promise((resolve, reject) => {

        const tx =
            db.transaction(
                STORE_ENVIOS_PARTICULAR,
                "readonly"
            );


        const request =
            tx.objectStore(
                STORE_ENVIOS_PARTICULAR
            ).getAll();


        request.onsuccess = () => {

            const registros =
                Array.isArray(request.result)
                    ? request.result
                    : [];

            db.close();

            resolve(registros);

        };


        request.onerror = () => {

            const error = request.error;

            db.close();

            reject(error);

        };

    });

}


async function eliminarEnvioOfflineParticular(envioId) {

    const db =
        await abrirDbParticular();


    return new Promise((resolve, reject) => {

        const tx =
            db.transaction(
                STORE_ENVIOS_PARTICULAR,
                "readwrite"
            );


        tx.objectStore(
            STORE_ENVIOS_PARTICULAR
        ).delete(envioId);


        tx.oncomplete = () => {

            db.close();
            resolve();

        };


        tx.onerror = () => {

            const error = tx.error;

            db.close();

            reject(error);

        };

    });

}

// ==========================================================
// CONSTRUIR EL POST DESDE UN REGISTRO GUARDADO
// ==========================================================

function construirPayloadParticular(registro) {

    const payload = new FormData();

    payload.append("tipoCliente","PARTICULAR");
    payload.append("envioId",registro.envioId);
    payload.append("servicio",registro.servicio);
    payload.append("resultadoServicio",registro.resultadoServicio || "ATENDIDO");
    payload.append("pacienteId",registro.pacienteId);
    payload.append("elementos",registro.elementos);
    payload.append("recargaRealizada",registro.recargaRealizada || "[]");
    payload.append("paciente",registro.paciente);
    payload.append("entrega07", registro.entrega07);
    payload.append("entrega10", registro.entrega10);
    payload.append("retiro07",registro.retiro07);
    payload.append("retiro10",registro.retiro10);
    payload.append("observaciones",registro.observaciones);
    payload.append("gps",registro.gps);
    payload.append("dispositivo",registro.dispositivo);
    if (registro.firma) payload.append("firma",registro.firma,"firma.png");

    if (registro.foto) {payload.append("foto",registro.foto,"foto-servicio-1.jpg");}
    if (registro.foto2) {payload.append("foto2", registro.foto2,"foto-servicio-2.jpg");}
    return payload;

}

// ==========================================================
// ENVÍO ÚNICO AL WORKER
// ==========================================================

async function enviarRegistroParticular(
    registro,
    timeoutMs = 60000
) {

    const controller =
        new AbortController();

    const temporizador =
        setTimeout(
            () => controller.abort(),
            timeoutMs
        );

    let respuesta;

    try {

        respuesta =
            await fetch(
                WORKER_URL,
                {
                    method: "POST",
                    body:
                        construirPayloadParticular(
                            registro
                        ),
                    credentials:
                        "same-origin",
                    cache:
                        "no-store",
                    signal:
                        controller.signal
                }
            );

    } catch (error) {

        const errorFinal =
            new Error(
                error.name === "AbortError"
                    ? "No fue posible conectar con el servidor dentro del tiempo esperado."
                    : "No fue posible conectar con el servidor."
            );

        errorFinal.reintentable = true;
        throw errorFinal;

    } finally {

        clearTimeout(
            temporizador
        );

    }

    const tipoContenido =
        String(
            respuesta.headers.get(
                "content-type"
            ) || ""
        ).toLowerCase();

    if (
        !tipoContenido.includes(
            "application/json"
        )
    ) {

        const texto =
            await respuesta.text();

        const pareceHtml =
            /<!doctype\s+html|<html/i.test(
                texto
            );

        const error =
            new Error(
                pareceHtml
                    ? "La sesión de OxiTrack no pudo validarse. El registro quedó guardado y se reintentará cuando la sesión esté disponible."
                    : "El servidor devolvió una respuesta inesperada."
            );

        error.reintentable = true;
        error.respuestaHtml = pareceHtml;
        throw error;
    }

    let resultado;

    try {

        resultado =
            await respuesta.json();

    } catch {

        const error =
            new Error(
                "El servidor no devolvió un JSON válido."
            );

        error.reintentable = true;
        throw error;
    }

    if (
        !respuesta.ok ||
        resultado.ok !== true
    ) {

        const error =
            new Error(
                resultado.error ||
                "El servidor rechazó el registro."
            );

        error.reintentable = false;
        throw error;
    }

    return resultado;
}

// ==========================================================
// PROGRAMAR BACKGROUND SYNC
// ==========================================================

async function programarSyncParticular() {

    if (!("serviceWorker" in navigator)) {
        return;
    }


    try {

        const registroSW = await navigator.serviceWorker.ready;

        if (
            "sync" in registroSW
        ) {

            await registroSW.sync.register(
                "oxitrack-particular-sync"
            );

        }



    } catch (error) {

        console.warn(
            "No fue posible programar Background Sync.",
            error
        );

    }

}

// ==========================================================
// SINCRONIZACIÓN DE RESPALDO DESDE LA PÁGINA
// ==========================================================

async function sincronizarPendientesParticular() {

    if (
        sincronizacionParticularEnCurso ||
        !navigator.onLine
    ) {
        return;
    }


    sincronizacionParticularEnCurso = true;


    try {

        const registros =
            await obtenerEnviosOfflineParticular();


        registros.sort(
            (a, b) =>
                String(a.fechaCreacion || "")
                    .localeCompare(
                        String(b.fechaCreacion || "")
                    )
        );


        for (const registro of registros) {

            try {

                const resultado =
                    await enviarRegistroParticular(
                        registro
                    );


                await eliminarEnvioOfflineParticular(
                    registro.envioId
                );


                if (
                    resultado.duplicado === true
                ) {

                    console.log(
                        "Particular offline: el envío ya había sido procesado:",
                        registro.envioId
                    );

                } else {

                    console.log(
                        "Particular offline sincronizado:",
                        registro.envioId
                    );

                }

            } catch (error) {

                console.error(
                    "No fue posible sincronizar particular:",
                    registro.envioId,
                    error
                );


                if (
                    error.reintentable !== false
                ) {
                    break;
                }

            }

        }

    } finally {

        sincronizacionParticularEnCurso = false;

    }

}

// ==========================================================
// INICIO
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
    capturarUbicacionGps();
    inicializarFirma();
    inicializarCamara();
    inicializarFormulario();

    const selectServicio = document.getElementById("servicioParticular");
    const selectPaciente = document.getElementById("pacienteParticular");
    const btnNoRealizado = document.getElementById("btnNoRealizado");
    const avisoNoRealizado = document.getElementById("avisoNoRealizado");
    const btnCancelarNoRealizado = document.getElementById("btnCancelarNoRealizado");

    function cambiarResultadoServicio(resultado) {
        const esNoRealizado = resultado === "NO REALIZADO";
        resultadoServicioParticular = resultado;

        avisoNoRealizado.hidden = !esNoRealizado;

        const firma = document.getElementById("firma");
        const tituloFirma = document.getElementById("tituloFirmaParticular");
        const limpiarFirma = document.getElementById("btnLimpiar");
        const enviar = document.getElementById("btnEnviar");
        const textoFoto = document.querySelector("#seccionFotos .texto-foto");

        firma.hidden = esNoRealizado;
        tituloFirma.hidden = esNoRealizado;
        limpiarFirma.hidden = esNoRealizado;

        enviar.textContent = "Enviar Registro";

        if (textoFoto) {
            textoFoto.textContent = esNoRealizado
                ? "Tome al menos una fotografía como respaldo del servicio no realizado."
                : "Tome al menos una fotografía del servicio realizado.";
        }

        ["seccionElementos", "seccionRecargaDinamica", "seccionCilindros"].forEach(id => {
            const seccion = document.getElementById(id);
            if (!seccion) return;

            if (esNoRealizado) {
                seccion.dataset.ocultoAntesNoRealizado = String(seccion.hidden);
                seccion.hidden = true;
            } else if (seccion.dataset.ocultoAntesNoRealizado !== undefined) {
                seccion.hidden = seccion.dataset.ocultoAntesNoRealizado === "true";
                delete seccion.dataset.ocultoAntesNoRealizado;
            }
        });

        const fotos = document.getElementById("seccionFotos");
        fotos.hidden = esNoRealizado
            ? false
            : selectServicio.value.toLowerCase().includes("retiro");

        btnNoRealizado.hidden = esNoRealizado || !selectPaciente.value;
    }
    btnNoRealizado.addEventListener("click", async () => {
        if (!selectPaciente.value) return;

        cambiarResultadoServicio("NO REALIZADO");

        await mostrarModalResultado(
            "Servicio no realizado",
            "Registre el motivo en Observaciones y tome al menos una fotografía como respaldo. No se requiere firma."
        );

        document.getElementById("obs").focus();
    });
    btnCancelarNoRealizado.addEventListener("click", () => cambiarResultadoServicio("ATENDIDO"));
    const inputPacienteId = document.getElementById("pacienteId");

    await cargarServicios(selectServicio);
    precargarDatosOfflineParticular();
    sincronizarPendientesParticular();

    selectServicio.addEventListener("change", async () => {

        cambiarResultadoServicio("ATENDIDO");
        btnNoRealizado.disabled = true;
        btnNoRealizado.hidden = true; 
        const servicio = selectServicio.value.trim();

        // 1. Quitar la selección del paciente anterior.
        selectPaciente.value = "";
        inputPacienteId.value = "";
        pacientesDisponibles = [];
        selectPaciente.disabled = true;

        // 2. Limpiar los elementos del servicio anterior.
        limpiarElementos();

        // 3. Ocultar los contadores genéricos.
        const seccionCilindros = document.getElementById("seccionCilindros");
        if (seccionCilindros) {seccionCilindros.hidden = true;}

        // 4. Ocultar la recarga dinámica anterior.
        const seccionRecarga = document.getElementById("seccionRecargaDinamica");
        if (seccionRecarga) {seccionRecarga.hidden = true;}

        // 5. Limpiar las cantidades anteriores.
        cilindrosRecargaActual = [];
        ["e07", "e10", "r07", "r10"].forEach(id => {const contador = document.getElementById(id);if (contador) contador.value = "0";});

        // 6. Actualizar la pantalla del nuevo servicio.
        actualizarVistaSegunServicio(servicio);

        if (!servicio) {
            selectPaciente.innerHTML = `<option value="">Primero seleccione un servicio...</option>`;
            return;
        }

        selectPaciente.innerHTML = `<option value="">Cargando pacientes...</option>`;
        await cargarUltimosPacientes(servicio, selectPaciente);
    });

    selectPaciente.addEventListener("change", async () => {

        cambiarResultadoServicio("ATENDIDO");
        btnNoRealizado.disabled = !selectPaciente.value;
        btnNoRealizado.hidden = !selectPaciente.value;
        const paciente = pacientesDisponibles.find(item => String(item.id) === String(selectPaciente.value));
        inputPacienteId.value = paciente ? paciente.id : "";
        const servicio = selectServicio.value.trim().toLowerCase();
        const esImplementacion = servicio.includes("implement");
        const esRetiro = servicio.includes("retiro");
        const esRecarga = servicio.includes("recarga");
        const seccionCilindros = document.getElementById("seccionCilindros");

        if (paciente && esImplementacion && paciente.tipo) {
            await cargarElementos(paciente.tipo, paciente.detalleImplementacion || "");
        } else if (paciente && esRecarga) {

            limpiarElementos();

            // Ocultar definitivamente los contadores genéricos
            // para esta recarga.
            if (seccionCilindros) {seccionCilindros.hidden = true;}
            if (paciente.detalleRecarga) {
                try {pintarRecargaAgendada(paciente.detalleRecarga);
                } catch (error) {
                    console.error("Recarga programada inválida:", error);
                    alert("No fue posible interpretar los cilindros programados. Informe a Oficina.");
                }
            } else {
                alert("Esta recarga no tiene medidas programadas. Informe a Oficina.");
            }
        } else if (paciente && esRetiro && paciente.elementosOrigen) {
            if (seccionCilindros) seccionCilindros.hidden = true;
            cargarElementosRetiro(paciente.elementosOrigen);
        } else {
            limpiarElementos();

            // Sin paciente seleccionado no debe aparecer
            // ningún contador genérico.
            if (seccionCilindros) {seccionCilindros.hidden = !(paciente &&esRetiro && !paciente.elementosOrigen);}
        }
    });
});

async function refrescarPacientesServicioActual() {

    if (!navigator.onLine) return;

    const selectServicio =
        document.getElementById(
            "servicioParticular"
        );

    const selectPaciente =
        document.getElementById(
            "pacienteParticular"
        );

    const inputPacienteId =
        document.getElementById(
            "pacienteId"
        );

    if (
        !selectServicio ||
        !selectPaciente
    ) {
        return;
    }

    const servicio =
        selectServicio.value.trim();

    if (!servicio) return;

    const idAnterior =
        inputPacienteId?.value || "";

    await cargarUltimosPacientes(
        servicio,
        selectPaciente
    );

    if (
        idAnterior &&
        pacientesDisponibles.some(
            item =>
                String(item.id) ===
                String(idAnterior)
        )
    ) {
        selectPaciente.value =
            idAnterior;
    } else if (inputPacienteId) {
        inputPacienteId.value = "";
    }
}


window.addEventListener(
    "online",
    async () => {

        await sincronizarPendientesParticular();
        await refrescarPacientesServicioActual();

    }
);


document.addEventListener(
    "visibilitychange",
    async () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            await sincronizarPendientesParticular();
            await refrescarPacientesServicioActual();

        }

    }
);


window.addEventListener(
    "focus",
    async () => {

        await sincronizarPendientesParticular();
        await refrescarPacientesServicioActual();

    }
);


window.addEventListener(
    "pageshow",
    async () => {

        await sincronizarPendientesParticular();
        await refrescarPacientesServicioActual();

    }
);


if ("serviceWorker" in navigator) {

    navigator.serviceWorker.addEventListener(
        "message",
        async event => {

            if (
                event.data &&
                event.data.type ===
                "PARTICULAR_SINCRONIZADO"
            ) {

                await refrescarPacientesServicioActual();

            }

        }
    );

}

// ==========================================================
// SERVICIOS - VIENEN DESDE EL WORKER
// ==========================================================

async function cargarServicios(selectServicio) {

    let servicios = obtenerServiciosOffline();

    function pintarServicios(lista) {
        const valorAnterior = selectServicio.value;

        selectServicio.replaceChildren(
            new Option("Seleccione el tipo de servicio...", "")
        );

        lista.forEach(servicio => {
            selectServicio.add(
                new Option(servicio, servicio)
            );
        });

        if (lista.includes(valorAnterior)) {
            selectServicio.value = valorAnterior;
        }
    }

    // Mostrar inmediatamente lo que ya está guardado.
    pintarServicios(servicios);

    if (!navigator.onLine) {
        return;
    }

    try {
        const controlador = new AbortController();

        const temporizador = setTimeout(
            () => controlador.abort(),
            12000
        );

        let respuesta;

        try {
            respuesta = await fetch(
                WORKER_URL + "?modo=serviciosParticular",
                {
                    cache: "no-store",
                    signal: controlador.signal
                }
            );
        } finally {
            clearTimeout(temporizador);
        }

        const datos = await respuesta.json();

        if (!respuesta.ok || datos.ok !== true) {
            throw new Error(
                datos.error || `Error HTTP ${respuesta.status}`
            );
        }

        if (!Array.isArray(datos.servicios)) {
            throw new Error("Lista de servicios inválida.");
        }

        if (datos.servicios.length > 0) {
            servicios = datos.servicios;
            guardarServiciosOffline(servicios);
            pintarServicios(servicios);
        } else {
            console.warn(
                "Particular: el servidor devolvió cero servicios."
            );
        }

    } catch (error) {
        console.warn(
            "No se pudo actualizar el catálogo Particular:",
            error
        );

        // Se conserva el catálogo local.
    }

    if (servicios.length === 0) {
        console.warn(
            "No existen servicios Particular en la caché ni en la respuesta del servidor."
        );
    }
}

// ==========================================================
// ÚLTIMOS 5 PACIENTES SEGÚN SERVICIO
// ==========================================================

async function cargarUltimosPacientes(servicio,selectPaciente) {

    let resultados = [];
    let consultaOnlineExitosa = false;

    if (navigator.onLine) {

        try {

            const url = `${WORKER_URL}?modo=particular&servicio=${encodeURIComponent(servicio)}`;
            const respuesta = await fetch(url, {cache: "no-store"});
            const datos = await respuesta.json();

            if (
                respuesta.ok &&
                datos.ok === true &&
                Array.isArray(datos.pacientes)
            ) {

                consultaOnlineExitosa = true;
                resultados = datos.pacientes.slice(0, 5);

                // La respuesta online es la verdad actual,
                // incluso si viene vacía.

                guardarPacientesOffline(servicio, resultados);
            }


        } catch (error) {

            console.warn(
                "Falló consulta online de pacientes. Se utilizará caché local.",
                error
            );

        }

    }


    // Solo usamos caché si NO conseguimos
    // una respuesta válida del servidor.

    if (!consultaOnlineExitosa) {

        resultados =
            obtenerPacientesOffline(
                servicio
            );

    }


    pacientesDisponibles =
        resultados;


    selectPaciente.innerHTML =
        `<option value="">Seleccione el paciente...</option>`;


    if (
        resultados.length === 0
    ) {

        selectPaciente.innerHTML =
            `<option value="">No hay pacientes disponibles</option>`;

        selectPaciente.disabled = true;

        return;

    }


    resultados.forEach(item => {

        const opcion =
            document.createElement(
                "option"
            );


        opcion.value =
            item.id;


        opcion.textContent =
            item.nombreMostrar ||
            item.nombre;


        selectPaciente.appendChild(
            opcion
        );

    });


    selectPaciente.disabled = false;

}

// ==========================================================
// PRECARGA PARA TRABAJO OFFLINE
// ==========================================================

async function precargarDatosOfflineParticular() {

    if (!navigator.onLine) {
        return;
    }


    const servicios =
        obtenerServiciosOffline();


    for (const servicio of servicios) {

        try {

            const respuesta =
                await fetch(
                    `${WORKER_URL}?modo=particular&servicio=${encodeURIComponent(servicio)}`,
                    { cache: "no-store" }
                );


            const datos =
                await respuesta.json();


            if (
                respuesta.ok &&
                datos.ok === true &&
                Array.isArray(datos.pacientes)
            ) {

                const pacientes =
                    datos.pacientes.slice(
                        0,
                        5
                    );


                guardarPacientesOffline(
                    servicio,
                    pacientes
                );


                const tipos =
                    [
                        ...new Set(
                            pacientes
                                .map(
                                    paciente =>
                                        String(
                                            paciente.tipo ||
                                            ""
                                        ).trim()
                                )
                                .filter(Boolean)
                        )
                    ];


                for (
                    const tipo of tipos
                ) {

                    try {

                        const respuestaElementos =
                            await fetch(
                                `${WORKER_URL}?modo=elementosParticular&tipo=${encodeURIComponent(tipo)}`,
                                { cache: "no-store" }
                            );


                        const datosElementos =
                            await respuestaElementos.json();


                        if (
                            respuestaElementos.ok &&
                            datosElementos.ok === true &&
                            Array.isArray(
                                datosElementos.elementos
                            )
                        ) {

                            guardarElementosOffline(
                                tipo,
                                datosElementos.elementos
                            );

                        }

                    } catch (error) {

                        console.warn(
                            "No se pudo precargar elementos:",
                            tipo,
                            error
                        );

                    }

                }

            }

        } catch (error) {

            console.warn(
                "No se pudo precargar el servicio:",
                servicio,
                error
            );

        }

    }

}

// ==========================================================
// ELEMENTOS SEGÚN TIPO DE IMPLEMENTACIÓN
// ==========================================================

async function cargarElementos(tipo, detalleImplementacion = "") {

    const seccion =document.getElementById("seccionElementos");
    const lista =document.getElementById( "listaElementos");
    elementosDisponibles = [];
    lista.innerHTML = "";
    seccion.hidden = true;
    let elementos = [];
    if (navigator.onLine) {
        try {
            const respuesta =await fetch(`${WORKER_URL}?modo=elementosParticular&tipo=${encodeURIComponent(tipo)}`,{ cache: "no-store" });
            const datos =await respuesta.json();

            if (respuesta.ok && datos.ok === true & Array.isArray(datos.elementos)) {
                elementos = datos.elementos;
                guardarElementosOffline(tipo,elementos);
            }
        } catch (error) {
            console.warn("Falló consulta online de elementos. Se utilizará caché.",error);
        }
    }


    if (elementos.length === 0) {elementos =obtenerElementosOffline(tipo);}
    elementosDisponibles = elementos;
    let cantidadesProgramadas = new Map();

    if (detalleImplementacion) {
        try {
            const detalle = JSON.parse(detalleImplementacion);
            if (!Array.isArray(detalle)) {throw new Error("Detalle de implementación inválido.");}
            cantidadesProgramadas = new Map(detalle.map(item => [String(item.elemento || "").trim().toUpperCase(),Number(item.cantidad)]));
        } catch (error) {
            console.error("Error en cantidades programadas:", error);
            alert("No fue posible interpretar el equipamiento solicitado. Informe a Oficina.");
            return;
        }
    }
    if (!elementosDisponibles.length) {

        lista.innerHTML = `<p>No hay elementos disponibles sin conexión para este tipo.</p>`;
        seccion.hidden = false;
        return;
    }


    elementosDisponibles.forEach((elemento, index) => {
            const fila =document.createElement("div");
            fila.className ="elemento-fila";
            fila.innerHTML = ` <label class="elemento-nombre">${elemento.elemento}</label>
                <div class="contador elemento-contador">

                    <button
                        type="button"
                        class="btn-elemento-menos"
                        data-index="${index}"
                    >
                        −
                    </button>

                    <input
                        id="elemento-${index}"
                        value="${cantidadesProgramadas.get(String(elemento.elemento || '').trim().toUpperCase()) ?? 0}"
                        readonly
                    >

                    <button
                        type="button"
                        class="btn-elemento-mas"
                        data-index="${index}"
                    >
                        +
                    </button>

                </div>
            `;
            lista.appendChild(fila);

        }
    );


    lista.querySelectorAll(".btn-elemento-menos").forEach(btn => {
            btn.addEventListener("click",() =>cambiarCantidadElemento(Number(btn.dataset.index),-1));});
    lista.querySelectorAll(".btn-elemento-mas").forEach(btn => {
            btn.addEventListener("click",() =>cambiarCantidadElemento(Number(btn.dataset.index), 1));});
    seccion.hidden = false;
}

let cilindrosRecargaActual = [];

function pintarRecargaAgendada(detalle) {
    const entregados = document.getElementById("listaRecargaEntregados");
    const retirados = document.getElementById("listaRecargaRetirados");
    const seccion = document.getElementById("seccionRecargaDinamica");
    const antiguos = document.getElementById("seccionCilindros");

    if (!entregados || !retirados || !seccion) return;

    const datos = typeof detalle === "string" ? JSON.parse(detalle) : detalle;
    if (!Array.isArray(datos) || !datos.length) throw new Error("La recarga no tiene cilindros agendados.");

    cilindrosRecargaActual = datos.map(item => ({
        elemento:String(item.elemento || "").trim(),
        gas:String(item.gas || "OXÍGENO").trim(),
        entregados:Number(item.cantidad),
        retirados:0
    }));

    if (cilindrosRecargaActual.some(item => !item.elemento || !Number.isInteger(item.entregados) || item.entregados < 1)) {
        throw new Error("El detalle de recarga contiene cilindros o cantidades inválidas.");
    }

    function crearFilas(contenedor, campo) {
        contenedor.replaceChildren();

        cilindrosRecargaActual.forEach((item, index) => {
            const fila = document.createElement("div");
            fila.className = "elemento-fila";

            const nombre = document.createElement("label");
            nombre.className = "elemento-nombre";
            nombre.textContent = `${item.gas} — ${item.elemento}`;

            const contador = document.createElement("div");
            contador.className = "contador elemento-contador";

            const menos = document.createElement("button");
            menos.type = "button";
            menos.textContent = "−";

            const cantidad = document.createElement("input");
            cantidad.readOnly = true;
            cantidad.value = String(item[campo]);

            const mas = document.createElement("button");
            mas.type = "button";
            mas.textContent = "+";

            menos.addEventListener("click", () => {
                item[campo] = Math.max(0, item[campo] - 1);
                cantidad.value = String(item[campo]);
            });

            mas.addEventListener("click", () => {
                item[campo]++;
                cantidad.value = String(item[campo]);
            });

            contador.append(menos, cantidad, mas);
            fila.append(nombre, contador);
            contenedor.appendChild(fila);
        });
    }

    crearFilas(entregados, "entregados");
    crearFilas(retirados, "retirados");

    if (antiguos) antiguos.hidden = true;
    seccion.hidden = false;
}

function obtenerRecargaRealizada() {
    return cilindrosRecargaActual.map(item => ({
        elemento:item.elemento,
        gas:item.gas,
        entregados:item.entregados,
        retirados:item.retirados
    }));
}


function cargarElementosRetiro(elementosOrigen) {

    const seccion = document.getElementById("seccionElementos");
    const lista = document.getElementById("listaElementos");
    elementosDisponibles = [];
    lista.innerHTML = "";
    seccion.hidden = true;

    try {
        const elementos = typeof elementosOrigen === "string" ? JSON.parse(elementosOrigen) : elementosOrigen;

        if (!Array.isArray(elementos) || elementos.length === 0) {throw new Error("El retiro no contiene elementos de origen.");}

        elementosDisponibles = elementos.map(item => ({
            elemento: String(item.elemento || "").trim(),
            cantidad: Number(item.cantidad) || 0,
            cantidadOriginal: Number(item.cantidad) || 0,
            recarga: item.recarga === true
        }));

        elementosDisponibles.forEach((elemento, index) => {
            const fila = document.createElement("div");
            fila.className = "elemento-fila";
            fila.innerHTML = `
                <label class="elemento-nombre">${elemento.elemento}</label>

                <div class="contador elemento-contador">
                    <button type="button" class="btn-elemento-retiro-menos" data-index="${index}">−</button>
                    <input id="elemento-${index}" value="${elemento.cantidadOriginal}" readonly>
                </div>
            `;

            lista.appendChild(fila);
        });

        lista.querySelectorAll(".btn-elemento-retiro-menos").forEach(btn => {btn.addEventListener("click", () => disminuirCantidadRetiro(Number(btn.dataset.index)));});
        seccion.hidden = false;

    } catch (error) {
        console.error("Error cargando elementos del retiro:", error);
        limpiarElementos();
        alert("No fue posible cargar los elementos originalmente entregados.");
    }
}

function cambiarCantidadElemento(index, cambio) {
    const input = document.getElementById(`elemento-${index}`);
    if (!input) return;

    const actual = parseInt(input.value, 10) || 0;
    input.value = Math.max(0, Math.min(20, actual + cambio));
}

function disminuirCantidadRetiro(index) {
    const input = document.getElementById(`elemento-${index}`);
    if (!input) return;

    const actual = parseInt(input.value, 10) || 0;
    input.value = actual > 0 ? actual - 1 : 0;
}

function obtenerElementosSeleccionados() {
    return elementosDisponibles
        .map((item, index) => ({
            elemento: item.elemento,
            cantidad: parseInt(
                document.getElementById(`elemento-${index}`)?.value || "0",
                10
            ),
            recarga: item.recarga === true
        }))
        .filter(item => item.cantidad > 0);
}

function obtenerElementosRetiro() {
    return elementosDisponibles.map((item, index) => ({
        elemento: item.elemento,
        cantidad: parseInt(
            document.getElementById(`elemento-${index}`)?.value || "0",
            10
        ),
        cantidadOriginal: Number(item.cantidadOriginal) || 0,
        recarga: item.recarga === true
    }));
}

function limpiarElementos() {
    elementosDisponibles = [];

    const seccion = document.getElementById("seccionElementos");
    const lista = document.getElementById("listaElementos");

    if (lista) lista.innerHTML = "";
    if (seccion) seccion.hidden = true;
}

// ==========================================================
// LIMPIAR FORMULARIO PARTICULAR
// ==========================================================

function limpiarFormularioParticular() {

    const formulario = document.getElementById("formularioParticular");
    const selectServicio = document.getElementById("servicioParticular");
    const selectPaciente = document.getElementById("pacienteParticular");
    const inputPacienteId = document.getElementById("pacienteId");
    const obs = document.getElementById("obs");
    const receptorParticular = document.getElementById("receptorParticular");

    // ------------------------------------------------------
    // FORMULARIO BASE
    // ------------------------------------------------------

    if (formulario) {formulario.reset();}
    if (receptorParticular) {receptorParticular.value = "";}

    // ------------------------------------------------------
    // SERVICIO
    // ------------------------------------------------------

    if (selectServicio) {selectServicio.value = "";}

    // ------------------------------------------------------
    // PACIENTE
    // ------------------------------------------------------

    if (selectPaciente) {
        selectPaciente.innerHTML =
            `<option value="">
                Primero seleccione un servicio...
            </option>`;
        selectPaciente.disabled = true;
    }

    if (inputPacienteId) {inputPacienteId.value = "";}
    pacientesDisponibles = [];

    // ------------------------------------------------------
    // CONTADORES
    // ------------------------------------------------------

    ["e07", "e10", "r07", "r10"].forEach(id => {
            const input = document.getElementById(id);
            if (input) {input.value = "0";}
        });

    // ------------------------------------------------------
    // ELEMENTOS
    // ------------------------------------------------------

    limpiarElementos();
    elementosDisponibles = [];

    // ------------------------------------------------------
    // OBSERVACIONES
    // ------------------------------------------------------

    if (obs) {obs.value = "";}

    // ------------------------------------------------------
    // FOTOS
    // ------------------------------------------------------

    detenerCamara();
    fotosCapturadas = [];
    pintarFotosCapturadas();

    // ------------------------------------------------------
    // FIRMA
    // ------------------------------------------------------

    if (signaturePad) {signaturePad.clear();}

    // ------------------------------------------------------
    // NUEVO ENVÍO = NUEVO ID
    // ------------------------------------------------------

    envioIdParticularActual = "";

    // ------------------------------------------------------
    // RESTABLECER VISTA
    // ------------------------------------------------------
    
    resultadoServicioParticular = "ATENDIDO";
    document.getElementById("avisoNoRealizado").hidden = true;
    document.getElementById("btnNoRealizado").disabled = true;
    document.getElementById("btnNoRealizado").hidden = true;
    document.getElementById("btnLimpiar").hidden = false;

    ["seccionElementos", "seccionRecargaDinamica", "seccionCilindros"].forEach(id => {
        const seccion = document.getElementById(id);
        if (seccion) delete seccion.dataset.ocultoAntesNoRealizado;
    });
    const textoFoto = document.querySelector("#seccionFotos .texto-foto");
    if (textoFoto) {textoFoto.textContent = "Tome al menos una fotografía del servicio realizado.";}
    document.getElementById("firma").hidden = false;
    document.getElementById("tituloFirmaParticular").hidden = false;
    document.getElementById("btnEnviar").textContent = "Enviar Registro";
    actualizarVistaSegunServicio("");

}

// ==========================================================
// MOSTRAR / OCULTAR SECCIONES SEGÚN SERVICIO
// ==========================================================

function actualizarVistaSegunServicio(servicio) {
    const valor = String(servicio || "").trim().toLowerCase();

    const esImplementacion = valor.includes("implement");
    const esRecarga = valor.includes("recarga");
    const esRetiro = valor.includes("retiro");
    const esCitaTecnica = valor.includes("cita técnica");
    const pacienteSeleccionado = Boolean(
    document.getElementById("pacienteParticular")?.value);
    const mostrarCilindros = esRetiro && pacienteSeleccionado;
    const mostrarFotos = !esRetiro;

    const seccionCilindros = document.getElementById("seccionCilindros");
    const seccionFotos = document.getElementById("seccionFotos");

    if (seccionCilindros) seccionCilindros.hidden = !mostrarCilindros;

    // La recarga dinámica se muestra únicamente después
    // de seleccionar un paciente con detalle programado.
    const seccionRecarga = document.getElementById("seccionRecargaDinamica");
    if (seccionRecarga) {seccionRecarga.hidden = true;}
    cilindrosRecargaActual = [];
    const listaEntregados = document.getElementById("listaRecargaEntregados");
    const listaRetirados = document.getElementById("listaRecargaRetirados");

    if (listaEntregados) listaEntregados.replaceChildren();
    if (listaRetirados) listaRetirados.replaceChildren();
    if (seccionFotos) seccionFotos.hidden = !mostrarFotos;

    if (!esImplementacion) limpiarElementos();

    if (!mostrarCilindros) {
        ["e07", "e10", "r07", "r10"].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = "0";
        });
    }

    fotosCapturadas = [];
    pintarFotosCapturadas();
    detenerCamara();
}

// ==========================================================
// CONTADORES
// ==========================================================

function aumentar(id) {
    const input = document.getElementById(id);
    input.value = (parseInt(input.value, 10) || 0) + 1;
}

function disminuir(id) {
    const input = document.getElementById(id);
    const valor = parseInt(input.value, 10) || 0;
    input.value = valor > 0 ? valor - 1 : 0;
}

// ==========================================================
// FIRMA
// ==========================================================

function inicializarFirma() {
    const canvas = document.getElementById("firma");
    const btnLimpiar = document.getElementById("btnLimpiar");

    if (!canvas) {
        console.error("No existe el canvas de firma.");
        return;
    }

    canvas.width = canvas.offsetWidth;
    canvas.height = 220;
    signaturePad = new SignaturePad(canvas);

    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", () => signaturePad.clear());
    }
}

// ==========================================================
// CÁMARA PARTICULAR - MÁXIMO 2 FOTOS
// ==========================================================

function inicializarCamara() {
    const btnAbrir = document.getElementById("btnAbrirCamara");
    const btnTomar = document.getElementById("btnTomarFoto");

    if (btnAbrir) btnAbrir.addEventListener("click", abrirCamara);
    if (btnTomar) btnTomar.addEventListener("click", tomarFoto);

    pintarFotosCapturadas();
}

async function abrirCamara() {
    const video = document.getElementById("vistaCamara");
    const btnAbrir = document.getElementById("btnAbrirCamara");
    const btnTomar = document.getElementById("btnTomarFoto");

    if (!video || !btnTomar) {
        console.error("No se encontraron los controles de cámara.");
        return;
    }

    if (fotosCapturadas.length >= 2) {
        alert("Ya se alcanzó el máximo de 2 fotografías.");
        return;
    }

    try {
        if (streamCamara) detenerCamara();

        streamCamara = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
            audio: false
        });

        video.srcObject = streamCamara;
        video.hidden = false;
        if (btnAbrir) btnAbrir.hidden = true;
        btnTomar.hidden = false;

    } catch (error) {
        console.error("No fue posible abrir la cámara:", error);
        alert("No fue posible acceder a la cámara. Verifique los permisos del navegador.");
    }
}

function detenerCamara() {
    if (streamCamara) {
        streamCamara.getTracks().forEach(track => track.stop());
        streamCamara = null;
    }

    const video = document.getElementById("vistaCamara");
    const btnAbrir = document.getElementById("btnAbrirCamara");
    const btnTomar = document.getElementById("btnTomarFoto");

    if (video) {
        video.srcObject = null;
        video.hidden = true;
    }

    if (btnTomar) btnTomar.hidden = true;
    if (btnAbrir) btnAbrir.hidden = false;
}

async function tomarFoto() {
    if (!streamCamara || fotosCapturadas.length >= 2) return;

    const video = document.getElementById("vistaCamara");
    const canvas = document.getElementById("canvasFoto");

    if (!video || !canvas) {
        console.error("No se encontraron video o canvas de fotografía.");
        return;
    }

    if (!video.videoWidth || !video.videoHeight) {
        alert("La cámara todavía no está lista.");
        return;
    }

    const anchoMaximo = 1280;
    const escala = Math.min(1, anchoMaximo / video.videoWidth);

    canvas.width = Math.round(video.videoWidth * escala);
    canvas.height = Math.round(video.videoHeight * escala);

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/jpeg", 0.82)
    );

    if (!blob) {
        alert("No fue posible generar la fotografía.");
        return;
    }

    fotosCapturadas.push(blob);

    pintarFotosCapturadas();
    detenerCamara();
}

function pintarFotosCapturadas() {
    const contenedor = document.getElementById("previewFotos");
    const btnAbrir = document.getElementById("btnAbrirCamara");

    if (contenedor) {
        contenedor.innerHTML = "";

        fotosCapturadas.forEach((blob, index) => {
            const url = URL.createObjectURL(blob);
            const item = document.createElement("div");

            item.className = "foto-preview";

            item.innerHTML = `
                <img src="${url}" alt="Foto ${index + 1}">
                <button type="button" data-index="${index}">×</button>
            `;

            item.querySelector("button").addEventListener("click", () => {
                URL.revokeObjectURL(url);
                fotosCapturadas.splice(index, 1);
                pintarFotosCapturadas();
            });

            contenedor.appendChild(item);
        });
    }

    if (!btnAbrir) return;

    if (fotosCapturadas.length === 0) {
        btnAbrir.disabled = false;
        btnAbrir.textContent = "Abrir Cámara";
    } else if (fotosCapturadas.length === 1) {
        btnAbrir.disabled = false;
        btnAbrir.textContent = "Tomar Segunda Foto";
    } else {
        btnAbrir.disabled = true;
        btnAbrir.textContent = "Máximo 2 Fotos";
    }
}

// ==========================================================
// GPS
// ==========================================================

function capturarUbicacionGps() {
    if (!navigator.geolocation) {
        coordenadasGPS = "GPS no soportado en este dispositivo";
        return;
    }

    navigator.geolocation.watchPosition(
        position => {
            coordenadasGPS = `${position.coords.latitude}, ${position.coords.longitude}`;
            console.log("GPS particular actualizado:", coordenadasGPS);
        },
        error => {
            const gpsValido =
                /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(coordenadasGPS);

            if (gpsValido) return;

            if (error.code === error.PERMISSION_DENIED) {
                coordenadasGPS = "Permiso GPS denegado";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                coordenadasGPS = "Señal GPS no disponible";
            } else if (error.code === error.TIMEOUT) {
                coordenadasGPS = "Tiempo de espera GPS agotado";
            } else {
                coordenadasGPS = "Ubicación no disponible";
            }
        },
        {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 30000
        }
    );
}

// ==========================================================
// CONFIRMACIÓN FINAL ANTES DEL ENVÍO
// ==========================================================

async function confirmarEnvioParticular(datos) {

    const servicio = String(datos.servicio || "").toUpperCase();
    if (datos.resultadoServicio === "NO REALIZADO") {
        return true;
    }
    const esImplementacion = servicio.includes("IMPLEMENT");
    const esVenta = servicio.includes("VENTA");
    const esRetiro = servicio.includes("RETIRO");
    const esRecarga = servicio.includes("RECARGA");
    let contenido = `
        <div class="modal-seccion">
            <strong>Paciente:</strong>
            <span>${datos.paciente}</span>
        </div>

        <div class="modal-seccion">
            <strong>Servicio:</strong>
            <span>${servicio}</span>
        </div>
    `;


    // ======================================================
    // IMPLEMENTACIÓN
    // ======================================================

    if (esImplementacion && Array.isArray(datos.elementos)) {
        let elementosHtml = "";
        datos.elementos.forEach(item => {
            elementosHtml += `<span>${item.cantidad} × ${item.elemento}</span>`;
        });


        contenido += `
            <div class="modal-seccion">
                <strong>Elementos entregados:</strong>
                ${elementosHtml}
            </div>
        `;

    }


    // ======================================================
    // RETIRO CON ELEMENTOS
    // ======================================================

    if (
        esRetiro &&
        Array.isArray(datos.elementos) &&
        datos.elementos.length > 0
    ) {

        let elementosHtml = "";

        datos.elementos.forEach(item => {

            elementosHtml +=
                `<span>
                    ${item.cantidad} de
                    ${item.cantidadOriginal} ×
                    ${item.elemento}
                </span>`;

        });


        contenido += `
            <div class="modal-seccion">
                <strong>Elementos a retirar:</strong>
                ${elementosHtml}
            </div>
        `;


    } else if (
        !esImplementacion &&
        !esVenta &&
        !esRecarga
    ) {

        contenido += `
            <div class="modal-seccion">
                <strong>Entregados:</strong>
                <span>Cilindros 0.7 m³: ${datos.e07}</span>
                <span>Cilindros 10 m³: ${datos.e10}</span>
            </div>

            <div class="modal-seccion">
                <strong>Retirados:</strong>
                <span>Cilindros 0.7 m³: ${datos.r07}</span>
                <span>Cilindros 10 m³: ${datos.r10}</span>
            </div>
        `;

    }

    if (esRecarga && Array.isArray(datos.recargaRealizada)) {
        const detalle = datos.recargaRealizada.map(item =>
            `${item.gas} — ${item.elemento}: ` +
            `${item.entregados} entregados, ${item.retirados} retirados`
        );

        contenido += `
            <div class="modal-seccion">
                <strong>Recarga realizada:</strong>
                ${detalle.map(texto => `<span>${texto}</span>`).join("")}
            </div>
        `;
    }


    // ======================================================
    // FOTOGRAFÍAS
    // ======================================================

    if (!esRetiro && !String(datos.servicio || "").toLowerCase().includes("cita técnica")) {

        contenido += `
            <div class="modal-seccion">
                <strong>Fotografías:</strong>
                <span>${datos.fotos}</span>
            </div>
        `;

    }


    // ======================================================
    // OBSERVACIONES
    // ======================================================

    if (datos.observaciones) {

        contenido += `
            <div class="modal-seccion">
                <strong>Observaciones:</strong>
                <span>${datos.observaciones}</span>
            </div>
        `;

    }


    return await abrirModalConfirmacion(
        contenido
    );
}

// ==========================================================
// ENVÍO DEL FORMULARIO
// ==========================================================

function inicializarFormulario() {
    const formulario = document.getElementById("formularioParticular");

    if (!formulario) {
        console.error("No se encontró formularioParticular.");
        return;
    }

    formulario.addEventListener("submit", async event => {

        event.preventDefault();
        const btnEnviar = document.getElementById("btnEnviar");
        const servicio = document.getElementById("servicioParticular").value.trim();
        const pacienteId = document.getElementById("pacienteId").value.trim();
        const pacienteSelect = document.getElementById("pacienteParticular");
        const pacienteNombre = pacienteSelect.options[pacienteSelect.selectedIndex]?.textContent?.trim() || "";      
        const pacienteActual = pacientesDisponibles.find(item => String(item.id) === String(pacienteId));
        const e07 = document.getElementById("e07").value;
        const e10 = document.getElementById("e10").value;
        const r07 = document.getElementById("r07").value;
        const r10 = document.getElementById("r10").value;
        const receptorParticular = document.getElementById("receptorParticular").value.trim().toLocaleUpperCase("es-CL");
        const observaciones = document.getElementById("obs").value.trim().toLocaleUpperCase("es-CL");
        const observacionesFinales = [receptorParticular ? `RECIBE: ${receptorParticular}` : "",observaciones].filter(Boolean).join("\n");
        const esNoRealizado = resultadoServicioParticular === "NO REALIZADO";
        if (!servicio) {alert("Debe seleccionar un servicio."); return;}
        if (!pacienteId) {alert("Debe seleccionar un paciente válido.");return;}
        const servicioNormalizado = servicio.toLowerCase();
        const esImplementacion = servicioNormalizado.includes("implement");
        const esRetiro = servicioNormalizado.includes("retiro");
        const esRecarga = servicioNormalizado.includes("recarga");
        const esVisitaTecnica = servicioNormalizado.includes("visita técnica") || servicioNormalizado.includes("visita tecnica");
        const retiroConOrigen = esRetiro && pacienteActual && pacienteActual.idOrigen && pacienteActual.elementosOrigen;
        const requiereFoto = esImplementacion || servicioNormalizado.includes("recarga") || servicioNormalizado.includes("venta");
        if ((requiereFoto || esNoRealizado) && fotosCapturadas.length === 0) {alert("Debe tomar al menos una fotografía antes de enviar el registro.");return;}
        if (esNoRealizado && !observaciones) {alert("Debe explicar por qué no se realizó el servicio.");return;}
        if (fotosCapturadas.length > 2) {alert("Solo se permite un máximo de 2 fotografías.");return;}
        if (esVisitaTecnica && !observaciones.trim()) {alert("Debe registrar las observaciones de la visita técnica.");return;}
        const recargaRealizada = esRecarga && !esNoRealizado ? obtenerRecargaRealizada() : [];
        if (esRecarga && !esNoRealizado && recargaRealizada.length === 0) {alert("No se cargaron los cilindros programados para esta recarga.");return;}
        if (esRecarga && recargaRealizada.some(item =>
            !item.elemento ||
            !Number.isInteger(item.entregados) ||
            !Number.isInteger(item.retirados) ||
            item.entregados < 0 ||
            item.retirados < 0
        )) {alert("Las cantidades de recarga no son válidas.");return;}
        const elementosSeleccionados = esNoRealizado ? [] : esImplementacion ? obtenerElementosSeleccionados() : retiroConOrigen ? obtenerElementosRetiro() : [];
        if (esImplementacion && !esNoRealizado && elementosSeleccionados.length === 0) {alert("Debe registrar al menos un elemento entregado en la implementación.");return;}
        if (!esNoRealizado && (!signaturePad || signaturePad.isEmpty())) {alert("Debe solicitar la firma del cliente.");return;}
        const confirmado = await confirmarEnvioParticular({
            servicio,
            paciente: pacienteNombre,
            elementos: elementosSeleccionados,
            recargaRealizada,
            e07,
            e10,
            r07,
            r10,
            observaciones: observacionesFinales,
            fotos: fotosCapturadas.length,
            resultadoServicio: resultadoServicioParticular,
        });
        if (!confirmado) return;
        if (!envioIdParticularActual) {envioIdParticularActual = generarEnvioIdParticular();}
        btnEnviar.disabled = true;
        btnEnviar.textContent = "Enviando...";
        try {

            let blobFirma = null;
            if (!esNoRealizado) {
                const respuestaFirma = await fetch(signaturePad.toDataURL("image/png"));
                blobFirma = await respuestaFirma.blob();
            }
            const registroParticular = {envioId:envioIdParticularActual,
                fechaCreacion:new Date().toISOString(),
                servicio:servicio,
                resultadoServicio:resultadoServicioParticular,
                pacienteId:pacienteId,
                elementos:JSON.stringify(elementosSeleccionados),
                recargaRealizada:JSON.stringify(recargaRealizada),
                paciente:pacienteNombre,
                entrega07:e07,
                entrega10:e10,
                retiro07:r07,
                retiro10:r10,
                observaciones:observacionesFinales,
                gps:coordenadasGPS,
                dispositivo:navigator.userAgent,
                firma:blobFirma,
                foto:fotosCapturadas[0] || null,
                foto2:fotosCapturadas[1] || null

            };


            // ======================================================
            // PRIMERO GUARDAMOS LOCALMENTE
            // ANTES DE INTENTAR CUALQUIER ENVÍO
            // ======================================================

            await guardarEnvioOfflineParticular(registroParticular);
            console.log("Registro Particular protegido en IndexedDB:",registroParticular.envioId);

            // ======================================================
            // SIN CONEXIÓN SEGÚN EL NAVEGADOR
            // ======================================================

            if (!navigator.onLine) {

                programarSyncParticular();

                await mostrarModalResultado(
                    "Registro guardado",
                    "No hay conexión a internet. El registro quedó guardado de forma segura y se enviará automáticamente cuando vuelva la señal."
                );

                limpiarFormularioParticular();
                return;

            }


            // ======================================================
            // INTENTAR ENVÍO ONLINE
            // MÁXIMO 60 SEGUNDOS
            // ======================================================

            try {

                const resultado = await enviarRegistroParticular(registroParticular, 60000);

                // ----------------------------------------------
                // SERVIDOR CONFIRMÓ EL REGISTRO
                // YA PODEMOS ELIMINAR LA COPIA LOCAL
                // ----------------------------------------------

                await eliminarEnvioOfflineParticular(
                    registroParticular.envioId
                );


                if (
                    resultado.duplicado === true
                ) {

                    console.log(
                        "El registro ya había sido procesado."
                    );

                }

                await mostrarModalResultado(
                    "Registro enviado",
                    "El servicio fue registrado correctamente."
                );
                location.reload();
                return;

            } catch (errorEnvio) {

                // ==================================================
                // ERROR REAL DEL SERVIDOR
                // NO ES UN PROBLEMA DE CONECTIVIDAD
                // ==================================================

                if (
                    errorEnvio.reintentable === false
                ) {

                    await eliminarEnvioOfflineParticular(
                        registroParticular.envioId
                    );


                    throw errorEnvio;

                }


                // ==================================================
                // SIN INTERNET / TIMEOUT / RESPUESTA PERDIDA
                // EL REGISTRO YA ESTÁ EN INDEXEDDB
                // ==================================================

                console.warn(
                    "Registro Particular pendiente de sincronización:",
                    errorEnvio.message
                );


                programarSyncParticular();


                await mostrarModalResultado(
                    "Registro pendiente",
                    "No fue posible confirmar el envío con el servidor. El registro quedó guardado de forma segura y se sincronizará automáticamente cuando exista conexión."
                );

                limpiarFormularioParticular();
                return;

            }


        } catch (error) {

            console.error(
                "Error al procesar registro particular:",
                error
            );


            alert(
                `No fue posible enviar el registro.\n\n${error.message}`
            );


        } finally {

            btnEnviar.disabled = false;

            btnEnviar.textContent =
                "Enviar Registro";

        }
    });
}