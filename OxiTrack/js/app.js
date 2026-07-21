// URL directa de tu Cloudflare Worker sin dependencias de otros archivos externos
const WORKER_URL = "https://oxitrack-api.oxilife.workers.dev";

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

// ----------------------------
// SOLO LETRAS Y NUMEROS
// ----------------------------
function limpiarTexto(e) {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]/g, '');
}

document.getElementById("cliente").addEventListener("input", limpiarTexto);
document.getElementById("operario").addEventListener("input", limpiarTexto);

// ----------------------------
// FIRMA
// ----------------------------
const canvas = document.getElementById("firma");
canvas.width = canvas.offsetWidth;
canvas.height = 220;
const signaturePad = new SignaturePad(canvas);

// ----------------------------
// LIMPIAR FIRMA
// ----------------------------
document.getElementById("btnLimpiar").addEventListener("click", () => {
    signaturePad.clear();
});

// ----------------------------
// ENVIAR FORMULARIO
// ----------------------------
document.getElementById("formulario").addEventListener("submit", async (e) => {
    // 1. Detener por completo cualquier intento de recarga o comportamiento nativo del HTML
    e.preventDefault();
    e.stopPropagation();

    if (signaturePad.isEmpty()) {
        alert("Debe ingresar la firma.");
        return;
    }

    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    try {
        // 2. Extraer el Base64 puro de SignaturePad de forma inmediata
        const dataUrl = signaturePad.toDataURL("image/png");
        const partesData = dataUrl.split(",")[1]; // Aislamos los bytes base64 de la imagen

        // 3. Convertir de Base64 a archivo binario (Blob) de forma síncrona e instantánea
        const caracteresBinarios = atob(partesData);
        const arrayConBytes = new Uint8Array(caracteresBinarios.length);
        for (let i = 0; i < caracteresBinarios.length; i++) {
            arrayConBytes[i] = caracteresBinarios.charCodeAt(i);
        }
        const blobFirma = new Blob([arrayConBytes], { type: "image/png" });

        // 4. Construir el contenedor FormData estándar de envío de archivos
        const payload = new FormData();
        payload.append("cliente", document.getElementById("cliente").value);
        payload.append("operario", document.getElementById("operario").value);
        payload.append("entrega07", document.getElementById("e07").value);
        payload.append("entrega10", document.getElementById("e10").value);
        payload.append("retiro07", document.getElementById("r07").value);
        payload.append("retiro10", document.getElementById("r10").value);
        payload.append("observaciones", document.getElementById("obs").value);
        payload.append("dispositivo", navigator.userAgent);
        
        // Adjuntamos el archivo físico de la firma
        payload.append("firma", blobFirma, "firma.png");

        console.log("Iniciando conexión con el servidor...");

        // 5. Despachar la petición de red directo a la URL de tu Worker
        const respuesta = await fetch(WORKER_URL, {
            method: "POST",
            body: payload
        });

        // 6. Leer la respuesta directamente como texto plano para evitar fallos de formato JSON
        const textoServidor = await respuesta.text();
        console.log("Respuesta recibida del servidor:", textoServidor);

        // 7. Evaluar el contenido de la respuesta
        const resultado = JSON.parse(textoServidor);

        if (resultado.ok) {
            alert("Registro enviado correctamente.");
            
            // Reiniciar el estado visual del formulario y contadores
            document.getElementById("formulario").reset();
            document.getElementById("e07").value = 0;
            document.getElementById("e10").value = 0;
            document.getElementById("r07").value = 0;
            document.getElementById("r10").value = 0;
            signaturePad.clear();
        } else {
            alert("Error reportado por Google: " + resultado.error);
        }

    } catch (error) {
        // Si el navegador llega a abortar la petición, imprimiremos el error técnico real en la consola
        alert("No fue posible conectar con el servidor.");
        console.error("Detalle técnico del fallo capturado:", error);
    }

    btn.disabled = false;
    btn.textContent = "Enviar Registro";
});
