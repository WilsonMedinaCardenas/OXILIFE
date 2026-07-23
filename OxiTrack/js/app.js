// URL directa de tu Cloudflare Worker
const WORKER_URL = "https://oxitrack-api.oxilife.workers.dev";

// Variable global para retener las coordenadas GPS de forma indestructible
let coordenadasGPS = "Buscando señal GPS...";

// 🛡️ CAPTURA AUTOMÁTICA DE CLIENTES, SERVICIOS Y GPS AL INICIAR APP
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Iniciar captura del GPS nativo de forma asíncrona pasiva
    capturarUbicacionGps();
    
    // 2. Intentar sincronizar datos pendientes guardados offline si existen
    // intentarSincronizarOffline(); // Nota: Asegúrate de tener esta función declarada en tu archivo offline

    // 3. Traer las listas desplegables unificadas desde el Worker
    try {
        const datalistClientes = document.getElementById("listaEmpresas");
        const datalistServicios = document.getElementById("listaServicios");
        
        const respuesta = await fetch(WORKER_URL); // Ejecuta el GET limpio
        const datos = await respuesta.json();

        // CORRECCIÓN: Validamos si existen las propiedades directamente en la respuesta
        if (datos) {
            // Renderizar listado de Clientes
            if (datos.clientes && Array.isArray(datos.clientes)) {
                datalistClientes.innerHTML = "";
                datos.clientes.forEach(empresa => {
                    const opcion = document.createElement("option");
                    opcion.value = empresa;
                    datalistClientes.appendChild(opcion);
                });
            }
            // Renderizar listado de Servicios
            if (datos.servicios && Array.isArray(datos.servicios)) {
                datalistServicios.innerHTML = "";
                datos.servicios.forEach(serv => {
                    const opcion = document.createElement("option");
                    opcion.value = serv;
                    datalistServicios.appendChild(opcion);
                });
            }
        }
    } catch (error) {
        console.warn("Aviso: Modo Offline. Se mantendrán las opciones de caché local.", error);
    }
});

// Lanzar rastreo si el celular vuelve a recuperar internet estando abierto
// window.addEventListener("online", intentarSincronizarOffline); 

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
        
        if (respuesta.ok) {
            alert("Formulario enviado con éxito.");
            location.reload();
        } else {
            alert("Error al enviar el formulario al servidor.");
        }
    } catch (error) {
        console.error("Error de red:", error);
        alert("Fallo de conexión. El envío se gestionará en modo offline.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Enviar Reporte";
    }
});
