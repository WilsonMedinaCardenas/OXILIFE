// URL directa de tu Cloudflare Worker
const WORKER_URL = "https://oxitrack-api.oxilife.workers.dev";

// ----------------------------
// CARGA DINÁMICA DE CLIENTES (MÉTODO TUYO ORIGINAL RESTAURADO)
// ----------------------------
document.addEventListener("DOMContentLoaded", async () => {
    // Al cargar la app, intentamos enviar registros offline si quedaron guardados en la memoria
    intentarSincronizarOffline();

    try {
        const datalist = document.getElementById("listaEmpresas");
        const respuesta = await fetch(WORKER_URL); // Realiza el GET limpio al Worker
        const datos = await respuesta.json();

        if (datos.ok && datos.clientes) {
            datalist.innerHTML = ""; // Limpieza preventiva
            datos.clientes.forEach(empresa => {
                const opcion = document.createElement("option");
                opcion.value = empresa;
                datalist.appendChild(opcion);
            });
        }
    } catch (error) {
        console.warn("Aviso: No se pudo actualizar la lista de clientes (Modo Offline activo).");
    }
});

// Sincronizar automáticamente si el celular recupera internet mientras la app está abierta
window.addEventListener("online", intentarSincronizarOffline);

// ----------------------------
// CONTADORES (TUS FUNCIONES ORIGINALES)
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

// ----------------------------
// FILTRO DE TEXTO SOLO OPERARIO (CLIENTE QUEDA LIBRE PARA SELECCIÓN)
// ----------------------------
function limpiarTexto(e) {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]/g, '');
}
document.getElementById("operario").addEventListener("input", limpiarTexto);

// ----------------------------
// FIRMA (TU CONFIGURACIÓN ORIGINAL)
// ----------------------------
const canvas = document.getElementById("firma");
canvas.width = canvas.offsetWidth;
canvas.height = 220;
const signaturePad = new SignaturePad(canvas);

document.getElementById("btnLimpiar").addEventListener("click", () => {
    signaturePad.clear();
});

// ----------------------------
// ENVIAR FORMULARIO (CAPA PROTEGIDA)
// ----------------------------
document.getElementById("formulario").addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (signaturePad.isEmpty()) {
        alert("Debe ingresar la firma.");
        return;
    }

    // 1. CAPTURA DE DATOS PARA SEGUNDA COMPROBACIÓN (POPUP DE CILINDROS)
    const e07 = document.getElementById("e07").value;
    const e10 = document.getElementById("e10").value;
    const r07 = document.getElementById("r07").value;
    const r10 = document.getElementById("r10").value;
    const cliente = document.getElementById("cliente").value;

    const mensajeConfirmacion = 
        `¿Está seguro del conteo de los cilindros para ${cliente}?\n\n` +
        `📥 ENTREGADOS:\n` +
        `• Cilindros 0.7 m³: ${e07}\n` +
        `• Cilindros 10 m³: ${e10}\n\n` +
        `📤 RETIRADOS:\n` +
        `• Cilindros 0.7 m³: ${r07}\n` +
        `• Cilindros 10 m³: ${r10}`;

    // Si el operario presiona "Cancelar", detenemos el envío para que revise
    if (!confirm(mensajeConfirmacion)) {
        return;
    }

    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    // 2. CONVERSIÓN BINARIA SÍNCRONA DE LA FIRMA (TU PROCESO INDESTRUCTIBLE)
    const dataUrl = signaturePad.toDataURL("image/png");
    const partesData = dataUrl.split(","); 
    const base64Limpio = partesData.pop();
    const caracteresBinarios = atob(base64Limpio);
    const arrayConBytes = new Uint8Array(caracteresBinarios.length);
    for (let i = 0; i < caracteresBinarios.length; i++) {
        arrayConBytes[i] = caracteresBinarios.charCodeAt(i);
    }
    const blobFirma = new Blob([arrayConBytes], { type: "image/png" });

    // 3. CONSTRUCCIÓN DEL FORM DATA ORIGINAL
    const payload = new FormData();
    payload.append("cliente", cliente);
    payload.append("operario", document.getElementById("operario").value);
    payload.append("entrega07", e07);
    payload.append("entrega10", e10);
    payload.append("retiro07", r07);
    payload.append("retiro10", r10);
    payload.append("observaciones", document.getElementById("obs").value);
    payload.append("dispositivo", navigator.userAgent);
    payload.append("firma", blobFirma, "firma.png");

    // 4. DESPACHO DE RED CON RESPALDO OFFLINE AUTOMÁTICO
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
        // RESPALDO EN CASO DE PÉRDIDA REAL DE INTERNET (SUBTERRÁNEOS / SIN SEÑAL)
        console.warn("Fallo de red detectado. Guardando copia en almacenamiento local...", error);
        
        const registroOffline = {
            cliente: cliente,
            operario: document.getElementById("operario").value,
            entrega07: e07,
            entrega10: e10,
            retiro07: r07,
            retiro10: r10,
            observaciones: document.getElementById("obs").value,
            dispositivo: navigator.userAgent,
            firmaBase64: base64Limpio
        };

        // Almacenar en la memoria interna del teléfono
        let registrosGuardados = JSON.parse(localStorage.getItem("oxitrack_offline") || "[]");
        registrosGuardados.push(registroOffline);
        localStorage.setItem("oxitrack_offline", JSON.stringify(registrosGuardados));

        alert("⚠️ Sin señal de Internet. El registro se guardó de forma segura en la memoria del celular. Se enviará automáticamente apenas recuperes conexión.");
        limpiarCamposFormulario();
    }

    btn.disabled = false;
    btn.textContent = "Enviar Registro";
});

// Función auxiliar de reseteo limpio
function limpiarCamposFormulario() {
    document.getElementById("formulario").reset();
    document.getElementById("e07").value = 0;
    document.getElementById("e10").value = 0;
    document.getElementById("r07").value = 0;
    document.getElementById("r10").value = 0;
    signaturePad.clear();
}

// SINCRONIZADOR EN SEGUNDO PLANO (CORREGIDO DE FORMA ESTRICTA)
async function intentarSincronizarOffline() {
    let registrosGuardados = JSON.parse(localStorage.getItem("oxitrack_offline") || "[]");
    if (registrosGuardados.length === 0) return;

    console.log(`Sincronizador: Procesando ${registrosGuardados.length} registros offline pendientes...`);

    for (let i = registrosGuardados.length - 1; i >= 0; i--) {
        const reg = registrosGuardados[i];
        
        const payloadOffline = new FormData();
        payloadOffline.append("cliente", reg.cliente);
        payloadOffline.append("operario", reg.operario);
        payloadOffline.append("entrega07", reg.entrega07);
        payloadOffline.append("entrega10", reg.entrega10);
        payloadOffline.append("retiro07", reg.retiro07);
        payloadOffline.append("retiro10", reg.retiro10);
        payloadOffline.append("observaciones", reg.observaciones + " (Sincronizado de modo Offline)");
        payloadOffline.append("dispositivo", reg.dispositivo);

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
                // Si la red responde bien, removemos este elemento específico de la lista
                registrosGuardados.splice(i, 1);
                localStorage.setItem("oxitrack_offline", JSON.stringify(registrosGuardados));
            }
        } catch (err) {
            console.error("El reintento offline falló. Conexión inestable.");
            break; 
        }
    }
}
