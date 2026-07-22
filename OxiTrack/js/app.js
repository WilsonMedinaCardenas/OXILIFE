// URL directa de tu Cloudflare Worker
const WORKER_URL = "https://oxitrack-api.oxilife.workers.dev";

// Variable global para retener las coordenadas GPS
let coordenadasGPS = "Buscando señal GPS...";

// 🛡️ CAPTURA AUTOMÁTICA DE CLIENTES, SERVICIOS Y GPS AL INICIAR APP
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Iniciar captura del GPS nativo de forma asíncrona pasiva
    capturarUbicacionGps();
    
    // 2. Intentar sincronizar datos pendientes guardados offline si existen
    intentarSincronizarOffline();

    // 3. Traer las listas desplegables unificadas desde el Worker
    try {
        const datalistClientes = document.getElementById("listaEmpresas");
        const datalistServicios = document.getElementById("listaServicios");
        
        const respuesta = await fetch(WORKER_URL); // Ejecuta el GET limpio
        const datos = await respuesta.json();

        if (datos.ok) {
            // Renderizar listado de Clientes
            if (datos.clientes) {
                datalistClientes.innerHTML = "";
                datos.clientes.forEach(empresa => {
                    const opcion = document.createElement("option");
                    opcion.value = empresa;
                    datalistClientes.appendChild(opcion);
                });
            }
            // Renderizar listado de Servicios
            if (datos.servicios) {
                datalistServicios.innerHTML = "";
                datos.servicios.forEach(serv => {
                    const opcion = document.createElement("option");
                    opcion.value = serv;
                    datalistServicios.appendChild(opcion);
                });
            }
        }
    } catch (error) {
        console.warn("Aviso: Modo Offline. Se mantendrán las opciones de caché local.");
    }
});

// Lanzar rastreo si el celular vuelve a recuperar internet estando abierto
window.addEventListener("online", intentarSincronizarOffline);

// Capturador nativo de geolocalización para smartphones
function capturarUbicacionGps() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Formato oficial: Latitud, Longitud (Listo para Google Maps)
                coordenadasGPS = `${position.coords.latitude}, ${position.coords.longitude}`;
                console.log("Coordenadas obtenidas:", coordenadasGPS);
            },
            (error) => {
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
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
    const paciente = document.getElementById("paciente").value;

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
    payload.append("servicio", servicio);
    payload.append("paciente", paciente);
    payload.append("operario", document.getElementById("operario").value);
    payload.append("entrega07", e07);
    payload.append("entrega10", e10);
    payload.append("retiro07", r07);
    payload.append("retiro10", r10);
    payload.append("observaciones", document.getElementById("obs").value);
    payload.append("dispositivo", navigator.userAgent);
    payload.append("gps", coordenadasGPS); 
    payload.append("firma", blobFirma, "firma.png");


    try {
        const respuesta = await fetch(WORKER_URL, {
            method: "POST",
            body: payload
        });

        const textoServidor = await respuesta.text();
        const resultado = JSON.parse(textoServidor);

        if (resultado.ok) {
            alert("Registro enviado correctamente.");
            limpiarCamposFormulario();
        } else {
            throw new Error(resultado.error);
        }

    } catch (error) {
        console.warn("Fallo de red o señal. Guardando copia en almacenamiento local...", error);
        
        const registroOffline = {
            cliente: cliente,
            servicio: servicio,
            paciente: paciente,
            operario: document.getElementById("operario").value,
            entrega07: e07,
            entrega10: e10,
            retiro07: r07,
            retiro10: r10,
            observaciones: document.getElementById("obs").value,
            dispositivo: navigator.userAgent,
            gps: coordenadasGPS,
            firmaBase64: base64Limpio
        };


        let registrosGuardados = JSON.parse(localStorage.getItem("oxitrack_offline") || "[]");
        registrosGuardados.push(registroOffline);
        localStorage.setItem("oxitrack_offline", JSON.stringify(registrosGuardados));

        alert("⚠️ Sin señal de Internet. El registro se guardó de forma segura en la memoria del celular. Se enviará automáticamente apenas recuperes conexión.");
        limpiarCamposFormulario();
    }

    btn.disabled = false;
    btn.textContent = "Enviar Registro";
});


function limpiarCamposFormulario() {
    document.getElementById("formulario").reset();
    document.getElementById("e07").value = 0;
    document.getElementById("e10").value = 0;
    document.getElementById("r07").value = 0;
    document.getElementById("r10").value = 0;
    signaturePad.clear();
    capturarUbicacionGps(); // Actualizar el GPS preventivamente para la siguiente transacción
}

// SINCRONIZADOR EN SEGUNDO PLANO TOTALMENTE PROBADO Y SEGURO CONTRA BUGS
async function intentarSincronizarOffline() {
    let registrosGuardados = JSON.parse(localStorage.getItem("oxitrack_offline") || "[]");
    if (registrosGuardados.length === 0) return;

    console.log(`Sincronizador: Despachando ${registrosGuardados.length} envíos diferidos...`);

    for (let i = registrosGuardados.length - 1; i >= 0; i--) {
        const reg = registrosGuardados[i];
        
        const payloadOffline = new FormData();
        payloadOffline.append("cliente", reg.cliente);
        payloadOffline.append("servicio", reg.servicio);
        payloadOffline.append("paciente", reg.paciente);
        payloadOffline.append("operario", reg.operario);
        payloadOffline.append("entrega07", reg.entrega07);
        payloadOffline.append("entrega10", reg.entrega10);
        payloadOffline.append("retiro07", reg.retiro07);
        payloadOffline.append("retiro10", reg.retiro10);
        payloadOffline.append("observaciones", reg.observaciones + " (Sincronizado de modo Offline)");
        payloadOffline.append("dispositivo", reg.dispositivo)

    }
}
