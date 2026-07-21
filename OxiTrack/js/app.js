// URL directa de tu Cloudflare Worker
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
        // 1. Extraer el Base64 y aislar los bytes limpios sin prefijos url
        const dataUrl = signaturePad.toDataURL("image/png");
        const partesData = dataUrl.split(","); 
        const base64Limpio = partesData.pop(); // EXTRAE ÚNICAMENTE LA CADENA ALFANUMÉRICA VALIDA

        // 2. Convertir de Base64 a binario real de forma síncrona e instantánea
        const caracteresBinarios = atob(base64Limpio);
        const arrayConBytes = new Uint8Array(caracteresBinarios.length);
        for (let i = 0; i < caracteresBinarios.length; i++) {
            arrayConBytes[i] = caracteresBinarios.charCodeAt(i);
        }
        const blobFirma = new Blob([arrayConBytes], { type: "image/png" });

        // 3. Construir el contenedor FormData estándar de envío de archivos
        const payload = new FormData();
        payload.append("cliente", document.getElementById("cliente").value);
        payload.append("operario", document.getElementById("operario").value);
        payload.append("entrega07", document.getElementById("e07").value);
        payload.append("entrega10", document.getElementById("e10").value);
        payload.append("retiro07", document.getElementById("r07").value);
        payload.append("retiro10", document.getElementById("r10").value);
        payload.append("observaciones", document.getElementById("obs").value);
        payload.append("dispositivo", navigator.userAgent);
        payload.append("firma", blobFirma, "firma.png");

        // 4. Despachar la petición de red directo al Worker
        const respuesta = await fetch(WORKER_URL, {
            method: "POST",
            body: payload
        });

        // 5. Leer la respuesta de forma segura
        const textoServidor = await respuesta.text();
        let resultado;
        
        try {
            resultado = JSON.parse(textoServidor);
        } catch (err) {
            throw new Error("El servidor devolvió una respuesta inesperada (HTML). Código HTTP: " + respuesta.status);
        }

        if (resultado.ok) {
            alert("Registro enviado correctamente.");
            document.getElementById("formulario").reset();
            document.getElementById("e07").value = 0;
            document.getElementById("e10").value = 0;
            document.getElementById("r07").value = 0;
            document.getElementById("r10").value = 0;
            signaturePad.clear();
        } else {
            alert("Error del servidor: " + resultado.error);
        }

    } catch (error) {
        alert("Error en el envío: " + error.message);
        console.error("Detalle técnico del fallo:", error);
    }

    btn.disabled = false;
    btn.textContent = "Enviar Registro";
});
