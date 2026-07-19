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

    if (signaturePad.isEmpty()) {
        alert("Debe ingresar la firma.");
        return;
    }

    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    try {
        // 1. Convertir la firma de SignaturePad a un archivo binario (Blob) real
        const dataUrl = signaturePad.toDataURL("image/png");
        const respuestaBlob = await fetch(dataUrl);
        const blobFirma = await respuestaBlob.blob();

        // 2. Crear un contenedor FormData para enviar los datos y el archivo juntos
        const payload = new FormData();
        payload.append("cliente", document.getElementById("cliente").value);
        payload.append("operario", document.getElementById("operario").value);
        payload.append("entrega07", document.getElementById("e07").value);
        payload.append("entrega10", document.getElementById("e10").value);
        payload.append("retiro07", document.getElementById("r07").value);
        payload.append("retiro10", document.getElementById("r10").value);
        payload.append("observaciones", document.getElementById("obs").value);
        payload.append("dispositivo", navigator.userAgent);
        
        // Adjuntamos la firma como un archivo físico llamado 'firma.png'
        payload.append("firma", blobFirma, "firma.png");

        // 3. Enviar la petición al Worker
        const respuesta = await fetch(CONFIG.WORKER_URL, {
            method: "POST",
            body: payload // El navegador configura automáticamente el Content-Type correcto
        });

        const resultado = await respuesta.json();

        if (resultado.ok) {
            alert("Registro enviado correctamente.");

            // Reiniciar el formulario y contadores a cero
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
        alert("No fue posible conectar con el servidor.");
        console.error(error);
    }

    btn.disabled = false;
    btn.textContent = "Enviar Registro";
});
