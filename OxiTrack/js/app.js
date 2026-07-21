// ----------------------------
// CONTADORES
// ----------------------------

const WORKER_URL = "https://oxitrack-api.oxilife.workers.dev";

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
            const respuesta = await fetch(WORKER_URL, {



                method: "POST",
                body: payload // El navegador maneja el Content-Type automáticamente
            });

            // 1. Capturamos la respuesta del servidor como TEXTO PLANO primero
            const textoRespuesta = await respuesta.text();

            // 2. Intentamos verificar si el texto es un JSON antes de parsearlo
            try {
                const resultado = JSON.parse(textoRespuesta);

                if (resultado.ok) {
                    alert("Registro enviado correctamente.");
                    document.getElementById("formulario").reset();
                    document.getElementById("e07").value = 0;
                    document.getElementById("e10").value = 0;
                    document.getElementById("r07").value = 0;
                    document.getElementById("r10").value = 0;
                    signaturePad.clear();
                } else {
                    alert("Error del servidor Google: " + resultado.error);
                }
            } catch (jsonError) {
                // 3. ¡AQUÍ CAZAMOS EL ERROR! Si el Worker devolvió HTML, te mostrará la verdad
                console.error("El servidor no devolvió un JSON válido. Respuesta recibida:", textoRespuesta);
                
                // Cortamos los primeros 250 caracteres de la página de error para ver el título o código HTTP
                const fragmentoError = textoRespuesta.substring(0, 250).replace(/</g, "&lt;").replace(/>/g, "&gt;");
                
                alert("¡Cloudflare bloqueó el envío! El servidor respondió con una página HTML:\n\n" + fragmentoError + "\n\n(Revisa la consola F12 para ver el código completo)");
            }

        } catch (error) {
            alert("No fue posible conectar con el servidor.");
            console.error(error);
        }


    btn.disabled = false;
    btn.textContent = "Enviar Registro";
});
