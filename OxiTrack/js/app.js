// URL directa de tu Cloudflare Worker
const WORKER_URL = "https://workers.dev";

// 🛡️ CAPTURA AUTOMÁTICA DE CLIENTES DIRECTO DE GOOGLE SHEETS
document.addEventListener("DOMContentLoaded", async () => {
    // Intentar sincronizar datos pendientes guardados offline al abrir la app
    intentarSincronizarOffline();

    try {
        const datalist = document.getElementById("listaEmpresas");
        console.log("Iniciando consulta GET a:", WORKER_URL);
        
        const respuesta = await fetch(WORKER_URL); // Realiza el GET automático
        
        if (!respuesta.ok) {
            throw new Error(`El servidor respondió con código HTTP ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        console.log("Datos crudos recibidos de Google:", datos);

        if (datos.ok && datos.clientes) {
            datalist.innerHTML = ""; // Limpiar cualquier opción previa
            datos.clientes.forEach(empresa => {
                const opcion = document.createElement("option");
                opcion.value = empresa;
                datalist.appendChild(opcion);
            });
            console.log("Lista de empresas cargada dinámicamente con éxito. Total:", datos.clientes.length);
        } else {
            throw new Error(datos.error || "El formato del JSON no es el esperado.");
        }
    } catch (error) {
        console.error("ALERTA CRÍTICA - No se pudo cargar los clientes:", error.message);
    }
});


// Detectar automáticamente cuando el celular recupera internet para vaciar la memoria interna
window.addEventListener("online", intentarSincronizarOffline);

// ----------------------------
// CONTADORES
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
// FIRMA
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

    // Capturar datos para el Popup de validación
    const e07 = document.getElementById("e07").value;
    const e10 = document.getElementById("e10").value;
    const r07 = document.getElementById("r07").value;
    const r10 = document.getElementById("r10").value;
    const cliente = document.getElementById("cliente").value;

    // POPUP DE CONFIRMACIÓN EN SEGUNDA CAPA
    const mensajeConfirmacion = 
        `¿Está seguro del conteo de los cilindros para ${cliente}?\n\n` +
        `📥 ENTREGADOS:\n` +
        `• Cilindros 0.7 m³: ${e07}\n` +
        `• Cilindros 10 m³: ${e10}\n\n` +
        `📤 RETIRADOS:\n` +
        `• Cilindros 0.7 m³: ${r07}\n` +
        `• Cilindros 10 m³: ${r10}`;

    if (!confirm(mensajeConfirmacion)) {
        return; // El operario canceló el envío para revisar el formulario
    }

    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.textContent = "Procesando...";

    // Estructurar el payload de envío
    const payload = new FormData();
    payload.append("cliente", cliente);
    payload.append("operario", document.getElementById("operario").value);
    payload.append("entrega07", e07);
    payload.append("entrega10", e10);
    payload.append("retiro07", r07);
    payload.append("retiro10", r10);
    payload.append("observaciones", document.getElementById("obs").value);
    payload.append("dispositivo", navigator.userAgent);

    // Convertir la firma a binario síncrono estándar
    const dataUrl = signaturePad.toDataURL("image/png");
    const partesData = dataUrl.split(","); 
    const base64Limpio = partesData.pop();
    const caracteresBinarios = atob(base64Limpio);
    const arrayConBytes = new Uint8Array(caracteresBinarios.length);
    for (let i = 0; i < caracteresBinarios.length; i++) {
        arrayConBytes[i] = caracteresBinarios.charCodeAt(i);
    }
    const blobFirma = new Blob([arrayConBytes], { type: "image/png" });
    payload.append("firma", blobFirma, "firma.png");

    // EJECUCIÓN DEL ENVÍO CON RESPALDO OFFLINE INTELIGENTE
    try {
        const respuesta = await fetch(WORKER_URL, {
            method: "POST",
            body: payload
        });

        const textoServidor = await respuesta.text();
        const resultado = JSON.parse(textoServidor);

        if (resultado.ok) {
            alert("Registro enviado correctamente a la base de datos.");
            limpiarCamposFormulario();
        } else {
            throw new Error(resultado.error);
        }

    } catch (error) {
        console.warn("Sin señal o error de red detectado. Guardando copia local...", error);
        
        const registroOffline = {
            cliente: cliente,
            operario: document.getElementById("operario").value,
            entrega07: e07,
            entrega10: e10,
            retiro07: r07,
            retiro10: r10,
            observaciones: document.getElementById("obs").value,
            dispositivo: navigator.userAgent,
            firmaBase64: base64Limpio, 
            timestamp: Date.now()
        };

        // Guardar en el histórico de la memoria del teléfono
        let registrosGuardados = JSON.parse(localStorage.getItem("oxitrack_offline") || "[]");
        registrosGuardados.push(registroOffline);
        localStorage.setItem("oxitrack_offline", JSON.stringify(registrosGuardados));

        alert("⚠️ Sin señal de Internet. El registro se guardó de forma segura en la memoria del celular. Se enviará automáticamente apenas recuperes conexión.");
        limpiarCamposFormulario();
    }

    btn.disabled = false;
    btn.textContent = "Enviar Registro";
});

// Función auxiliar para resetear los componentes visuales
function limpiarCamposFormulario() {
    document.getElementById("formulario").reset();
    document.getElementById("e07").value = 0;
    document.getElementById("e10").value = 0;
    document.getElementById("r07").value = 0;
    document.getElementById("r10").value = 0;
    signaturePad.clear();
}

// PROCESADOR EN SEGUNDO PLANO PARA VACIAR REGISTROS OFFLINE AL VOLVER EL INTERNET
async function intentarSincronizarOffline() {
    let registrosGuardados = JSON.parse(localStorage.getItem("oxitrack_offline") || "[]");
    if (registrosGuardados.length === 0) return;

    console.log(`Detectados ${registrosGuardados.length} registros fuera de línea pendientes. Sincronizando...`);

    for (let i = registrosGuardados.length - 1; i >= 0; i--) {
        const reg = registrosGuardados[i];
        
        const payloadOffline = new FormData();
        payloadOffline.append("cliente", reg.cliente);
        payloadOffline.append("operario", reg.operario);
        payloadOffline.append("entrega07", reg.entrega07);
        payloadOffline.append("entrega10", reg.entrega10);
        payloadOffline.append("retiro07", reg.retiro07);
        payloadOffline.append("retiro10", reg.retiro10);
        payloadOffline.append("observaciones", reg.observaciones + " (Enviado en modo Offline diferido)");
        payloadOffline.append("dispositivo", reg.dispositivo);

        // CORRECCIÓN AQUÍ: Se procesa el índice j de forma estricta y limpia
        const caracteresBinarios = atob(reg.firmaBase64);
        const arrayConBytes = new Uint8Array(caracteresBinarios.length);
        for (let j = 0; j < caracteresBinarios.length; j++) {
            arrayConBytes[j] = caracteresBinarios.charCodeAt(j);
        }
        const blobFirma = new Blob([arrayConBytes], { type: "image/png" });
        payloadOffline.append("firma", blobFirma, "firma.png");

        try {
            const res = await fetch(WORKER_URL, { method: "POST", body: payloadOffline });
            if (res.ok) {
                registrosGuardados.splice(i, 1);
                localStorage.setItem("oxitrack_offline", JSON.stringify(registrosGuardados));
                console.log("Registro diferido sincronizado con éxito.");
            }
        } catch (err) {
            console.error("El reintento de envío offline falló. Esperando señal...");
            break; 
        }
    }
}
