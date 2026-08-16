// URL directa de tu Cloudflare Worker
const WORKER_URL = "https://oxilife.cl/api/oxitrack/";

// Variable global para retener las coordenadas GPS de forma indestructible
let coordenadasGPS = "Buscando señal GPS...";

// ==========================================================
// INICIO OXITRACK
// GPS + OFFLINE + SERVICIOS + BUSCADOR DE CLIENTES
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {

    // ------------------------------------------------------
    // 1. Iniciar GPS
    // ------------------------------------------------------
    capturarUbicacionGps();


    // ------------------------------------------------------
    // 2. Intentar sincronizar registros pendientes offline
    // ------------------------------------------------------
    intentarSincronizarOffline();


    // ------------------------------------------------------
    // 3. Cargar solamente los SERVICIOS al iniciar
    // ------------------------------------------------------
    try {

        const datalistServicios =
            document.getElementById("listaServicios");

        const respuesta =
            await fetch(WORKER_URL);

        const datos =
            await respuesta.json();


        if (
            datos &&
            datos.servicios &&
            Array.isArray(datos.servicios)
        ) {

            datalistServicios.innerHTML = "";

            datos.servicios.forEach(serv => {

                const opcion =
                    document.createElement("option");

                opcion.value = serv;

                datalistServicios.appendChild(opcion);
            });
        }

    } catch (error) {

        console.warn(
            "Aviso: no fue posible cargar los servicios.",
            error
        );
    }


    // ======================================================
    // 4. BUSCADOR DE CLIENTES
    // ======================================================

    const inputCliente =
        document.getElementById("cliente");

    const inputClienteId =
        document.getElementById("clienteId");

    const datalistClientes =
        document.getElementById("listaEmpresas");


    let clientesEncontrados = [];

    let temporizadorBusqueda = null;


    // ------------------------------------------------------
    // BUSCAR CUANDO EL OPERARIO ESCRIBA
    // ------------------------------------------------------
    inputCliente.addEventListener("input", () => {

        const textoBusqueda =
            inputCliente.value.trim();


        // Si modifica el texto, invalidamos
        // cualquier selección anterior.
        inputClienteId.value = "";


        clearTimeout(temporizadorBusqueda);


        // Menos de 3 caracteres:
        // no hacemos ninguna consulta.
        if (textoBusqueda.length < 3) {

            datalistClientes.innerHTML = "";

            clientesEncontrados = [];

            return;
        }


        // Esperamos 300 ms para no llamar al Worker
        // por cada tecla que escribe.
        temporizadorBusqueda =
            setTimeout(async () => {

                try {

                    const respuesta =
                        await fetch(
                            WORKER_URL +
                            "?buscar=" +
                            encodeURIComponent(textoBusqueda)
                        );


                    const datos =
                        await respuesta.json();


                    datalistClientes.innerHTML = "";

                    clientesEncontrados = [];


                    if (
                        datos &&
                        datos.clientes &&
                        Array.isArray(datos.clientes)
                    ) {

                        clientesEncontrados =
                            datos.clientes;


                        datos.clientes.forEach(item => {

                            const opcion =
                                document.createElement("option");

                            opcion.value =
                                item.nombre;

                            datalistClientes
                                .appendChild(opcion);
                        });
                    }

                } catch (error) {

                    console.error(
                        "Error al buscar empresas:",
                        error
                    );
                }

            }, 300);

    });


    // ------------------------------------------------------
    // GUARDAR EL ID CUANDO SELECCIONA UNA EMPRESA
    // ------------------------------------------------------
    inputCliente.addEventListener("change", () => {

        const nombreSeleccionado =
            inputCliente.value
                .trim()
                .toLowerCase();


        const clienteEncontrado =
            clientesEncontrados.find(item =>
                item.nombre
                    .trim()
                    .toLowerCase() ===
                nombreSeleccionado
            );


        if (clienteEncontrado) {

            inputClienteId.value =
                clienteEncontrado.id;

        } else {

            inputClienteId.value = "";
        }

    });

});

// Lanzar rastreo si el celular vuelve a recuperar internet estando abierto
window.addEventListener("online", intentarSincronizarOffline); // ACTIVADO DE FORMA CORRECTA

// ==========================================================
// REINTENTAR CUANDO EL OPERARIO REGRESA A OXITRACK
// ==========================================================

document.addEventListener("visibilitychange", () => {
        if ( document.visibilityState === "visible" && navigator.onLine) {
            intentarSincronizarOffline();
            }
        }
);

// Función nativa optimizada para smartphones en terreno
function capturarUbicacionGps() {
    if (navigator.geolocation) {
        // Usamos watchPosition para que el celular rastree continuamente la señal mientras el operario llena el formulario
        navigator.geolocation.watchPosition(
            (position) => {
                // Formato oficial: Latitud, Longitud limpio para Google Sheets y Google Maps
                coordenadasGPS = `${position.coords.latitude}, ${position.coords.longitude}`;
                console.log("GPS Actualizado en tiempo real con éxito:", coordenadasGPS);
            },
            (error) => {
                // Control defensivo secundario si hay pérdida total de señal
                if (coordenadasGPS === "Buscando señal GPS...") {
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            coordenadasGPS = "Permiso GPS denegado por operario";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            coordenadasGPS = "Señal GPS no disponible (Subterráneo)";
                            break;
                        case error.TIMEOUT:
                            coordenadasGPS = "Tiempo de espera GPS agotado";
                            break;
                        default:
                            coordenadasGPS = "Error de ubicación no identificado";
                    }
                }
            },
            // CONFIGURACIÓN FLEXIBLE CORPORATIVA PARA CELULARES
            { 
                enableHighAccuracy: false, // Permite usar antenas de red celular si el satélite puro tarda en enganchar bajo techo
                timeout: 15000,            // Ampliamos el tiempo de espera a 15 segundos para dar margen al teléfono
                maximumAge: 30000          // Permite usar ubicaciones guardadas en la caché del celular de los últimos 30 segundos si la señal es inestable
            }
        );
    } else {
        coordenadasGPS = "GPS no soportado en este dispositivo";
    }
}


// ----------------------------
// CONTADORES (TUS FUNCIONES NATIVAS)
// ----------------------------
function aumentar(id) {
    const input = document.getElementById(id);
    input.value = parseInt(input.value) + 1;
}

function disminuir(id) {
    const input = document.getElementById(id);
    let valor = parseInt(input.value);
    if (valor > 0) {
        valor--;
    }
    input.value = valor;
}


function limpiarTexto(e) {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]/g, '');
}
document.getElementById("operario").addEventListener("input", limpiarTexto);

// ----------------------------
// FIRMA ELECTRONICA
// ----------------------------
const canvas = document.getElementById("firma");
canvas.width = canvas.offsetWidth;
canvas.height = 220;
const signaturePad = new SignaturePad(canvas);

document.getElementById("btnLimpiar").addEventListener("click", () => {
    signaturePad.clear();
});

// ----------------------------
// ENVIAR FORMULARIO CON SEGUNDA COMPROBACIÓN & CONTROL OFFLINE
// ----------------------------
document.getElementById("formulario").addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (signaturePad.isEmpty()) {
        alert("Debe ingresar la firma.");
        return;
    }


    const e07 = document.getElementById("e07").value;
    const e10 = document.getElementById("e10").value;
    const r07 = document.getElementById("r07").value;
    const r10 = document.getElementById("r10").value;
    const cliente = document.getElementById("cliente").value;
    const servicio = document.getElementById("servicio").value;
    const paciente = document.getElementById("paciente").value.toUpperCase();

    // POPUP ENRIQUECIDO DE CONTROL DE CILINDROS
    const mensajeConfirmacion = 
        `¿Está seguro del conteo de los cilindros?\n\n` +
        `🏢 Empresa: ${cliente}\n` +
        `🛠️ Servicio: ${servicio}\n` +
        `👤 Paciente: ${paciente || "No aplica"}\n\n` +
        `📥 ENTREGADOS:\n` +
        `• Cilindros 0.7 m³: ${e07}\n` +
        `• Cilindros 10 m³: ${e10}\n\n` +
        `📤 RETIRADOS:\n` +
        `• Cilindros 0.7 m³: ${r07}\n` +
        `• Cilindros 10 m³: ${r10}`;


    if (!confirm(mensajeConfirmacion)) {
        return; 
    }

    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    // Convertir la firma a archivo binario físico síncrono
    const dataUrl = signaturePad.toDataURL("image/png");
    const partesData = dataUrl.split(","); 
    const base64Limpio = partesData.pop();
    const caracteresBinarios = atob(base64Limpio);
    const arrayConBytes = new Uint8Array(caracteresBinarios.length);
    for (let i = 0; i < caracteresBinarios.length; i++) {
        arrayConBytes[i] = caracteresBinarios.charCodeAt(i);
    }
    const blobFirma = new Blob([arrayConBytes], { type: "image/png" });

    // Construcción del FormData dinámico con las nuevas propiedades
    const payload = new FormData();

    payload.append("cliente", cliente);
    payload.append("clienteId", clienteIdSeleccionado);
    payload.append("servicio", servicio);
    payload.append("paciente", paciente);
    payload.append("entrega07", e07);
    payload.append("entrega10", e10);
    payload.append("retiro07", r07);
    payload.append("retiro10", r10);
    payload.append("observaciones", document.getElementById("obs").value.toUpperCase());
    payload.append("dispositivo", navigator.userAgent);
    payload.append("gps", coordenadasGPS);
    const clienteIdSeleccionado = document.getElementById("clienteId").value.trim();
    if (!clienteIdSeleccionado) { alert("Debe seleccionar una empresa válida de la lista."); return;}
    payload.append("firma", blobFirma, "firma.png");

    try {

    const respuesta = await fetch(WORKER_URL, {
        method: "POST",
        body: payload
    });

    const resultado = await respuesta.json();

    console.log("RESPUESTA DEL WORKER:", resultado);

    if (respuesta.ok && resultado.ok === true) {

        alert("Formulario enviado con éxito.");
        location.reload();

    } else {

        console.error(
            "ERROR REPORTADO POR EL WORKER:",
            resultado.error
        );

        alert(
            "Error al enviar el formulario:\n\n" +
            (resultado.error || "Error desconocido del servidor.")
        );
    }

} catch (error) {

    console.error(
        "Error de red, ejecutando salvaguarda local offline:",
        error
    );
        
        // 🛡️ INYECTOR QUIRÚRGICO OFFLINE (GUARDA EN EL STORE DEL CELULAR SI SE PIERDE LA SEÑAL)
        const registroOffline = { 
            cliente: cliente,
            clienteId: clienteIdSeleccionado,
            servicio: servicio,
            paciente: paciente,
            entrega07: e07,
            entrega10: e10,
            retiro07: r07,
            retiro10: r10,
            observaciones: document.getElementById("obs").value.toUpperCase(),
            dispositivo: navigator.userAgent,
            gps: coordenadasGPS,
            fechaRegistroOffline: new Date().toISOString(),
            firmaBase64: base64Limpio
        };

        let registrosGuardados = JSON.parse(localStorage.getItem("oxitrack_offline") || "[]");
        registrosGuardados.push(registroOffline);
        localStorage.setItem("oxitrack_offline", JSON.stringify(registrosGuardados));

        alert("⚠️ Sin señal de Internet. El registro se guardó de forma segura en la memoria del celular. Se enviará automáticamente apenas recuperes conexión.");
        location.reload();
    } finally {
        btn.disabled = false;
        btn.textContent = "Enviar Reporte";
    }
});

// 🛡️ SINCRONIZADOR EN SEGUNDO PLANO (CORREGIDO ASÍNCRONO & INMUNE A ERRORES)
// ==========================================================
// SINCRONIZADOR DE REGISTROS OFFLINE
// ==========================================================

async function intentarSincronizarOffline() {

    // ------------------------------------------------------
    // 1. LEER REGISTROS PENDIENTES
    // ------------------------------------------------------

    let registrosGuardados = JSON.parse(
        localStorage.getItem("oxitrack_offline") || "[]"
    );

    if (registrosGuardados.length === 0) {
        return;
    }


    // Si el navegador todavía considera que no hay conexión,
    // ni siquiera intentamos sincronizar.
    if (!navigator.onLine) {

        console.log(
            "Sincronizador: aún no hay conexión. Registros conservados."
        );

        return;
    }


    console.log(
        `Sincronizador: Procesando ${registrosGuardados.length} envíos diferidos...`
    );


    // ------------------------------------------------------
    // 2. PROCESAR DE ATRÁS HACIA ADELANTE
    // ------------------------------------------------------

    for (
        let i = registrosGuardados.length - 1;
        i >= 0;
        i--
    ) {

        const reg = registrosGuardados[i];


        // --------------------------------------------------
        // GPS DEL REGISTRO OFFLINE
        // --------------------------------------------------

        let gpsFinal = reg.gps || "No disponible";

        // Verificamos si realmente tenemos coordenadas válidas.
        // Ejemplo válido:
        // -33.412345, -70.598765
        const gpsOriginalValido = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(String(gpsFinal).trim());


        // --------------------------------------------------
        // SI NO HUBO GPS AL MOMENTO DEL REGISTRO,
        // INTENTAR CAPTURAR UNA UBICACIÓN AL RECUPERAR SEÑAL
        // --------------------------------------------------

        if (!gpsOriginalValido && navigator.geolocation) {

            try {

                const posicionRecuperada =
                    await new Promise((resolve, reject) => {

                        navigator.geolocation.getCurrentPosition(
                            resolve,
                            reject,
                            {
                                enableHighAccuracy: true,
                                timeout: 8000,
                                maximumAge: 0
                            }
                        );

                    });


                const lat =
                    posicionRecuperada.coords.latitude;

                const lng =
                    posicionRecuperada.coords.longitude;


                gpsFinal =
                    `${lat}, ${lng} (Ubicación capturada al recuperar señal)`;


                console.log(
                    "Sincronizador: ubicación recuperada después del registro offline."
                );


            } catch (errorGps) {

                gpsFinal = "No disponible";

                console.warn(
                    "Sincronizador: no fue posible obtener ubicación al recuperar señal."
                );
            }
        }


        // --------------------------------------------------
        // 3. RECONSTRUIR FORMDATA
        // --------------------------------------------------

        const payloadOffline = new FormData();

        payloadOffline.append("cliente", reg.cliente || "");
        payloadOffline.append("clienteId", reg.clienteId || "");
        payloadOffline.append("servicio", reg.servicio || "");
        payloadOffline.append("paciente", reg.paciente || "");
        payloadOffline.append("entrega07", reg.entrega07 || "0");
        payloadOffline.append("entrega10", reg.entrega10 || "0");
        payloadOffline.append("retiro07", reg.retiro07 || "0");
        payloadOffline.append("retiro10", reg.retiro10 || "0");
        payloadOffline.append("observaciones", (reg.observaciones || "") + " Sincronizado offline");
        payloadOffline.append("dispositivo", reg.dispositivo || "");
        payloadOffline.append("gps", gpsFinal);
        // Guardamos también cuándo se creó originalmente.
        payloadOffline.append("fechaRegistroOffline", reg.fechaRegistroOffline || "");

        // --------------------------------------------------
        // 4. RECONSTRUIR FIRMA PNG
        // --------------------------------------------------

        const caracteresBinarios =atob(reg.firmaBase64);

        const arrayConBytes = new Uint8Array(caracteresBinarios.length);

        for (let j = 0; j < caracteresBinarios.length; j++) {
                arrayConBytes[j] =
                caracteresBinarios.charCodeAt(j);
            }


        const blobFirma = new Blob(
                [arrayConBytes],
                { type: "image/png" }
            );

        payloadOffline.append("firma", blobFirma, "firma.png");
        // --------------------------------------------------
        // 5. INTENTAR SINCRONIZAR
        // --------------------------------------------------

        try {

            const res = await fetch(
                WORKER_URL,
                {
                    method: "POST",
                    body: payloadOffline
                }
            );
            // ------------------------------------------------
            // NO CONFIAR ÚNICAMENTE EN res.ok
            // ------------------------------------------------
            let resultado;

            try {

                resultado = await res.json();

            } catch (errorJson) {

                console.error(
                    "Sincronizador: el servidor no devolvió JSON válido. " +
                    "El registro se conservará."
                );

                break;
            }

            // ------------------------------------------------
            // BORRAR SOLO SI EL WORKER CONFIRMA ok:true
            // ------------------------------------------------

            if (
                res.ok &&
                resultado &&
                resultado.ok === true
            ) {

                registrosGuardados.splice(i, 1);

                localStorage.setItem(
                    "oxitrack_offline",
                    JSON.stringify(
                        registrosGuardados
                    )
                );


                console.log(
                    `✅ Registro diferido de ${reg.cliente} sincronizado con éxito.`
                );

            } else {

                console.error(
                    "❌ El Worker rechazó el registro offline:",
                    resultado?.error ||
                    "Error desconocido"
                );

                // NO eliminamos nada.
                // Queda pendiente para otro intento.
                break;
            }

        } catch (err) {

            console.error(
                "Sincronizador: volvió a fallar la conexión. " +
                "El registro permanecerá guardado."
            );


            // Detenemos el resto para no generar múltiples
            // intentos con una conexión inestable.
            break;
        }
    }
}
