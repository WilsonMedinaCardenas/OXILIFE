// ==========================================================
// OXITRACK - PARTICULAR
// ==========================================================

const WORKER_URL = "https://oxilife.cl/api/oxitrack/";
const CLAVE_CACHE_SERVICIOS = "oxitrack_particular_servicios";
const CLAVE_CACHE_PACIENTES = "oxitrack_particulares_cache";

let coordenadasGPS = "Buscando señal GPS...";
let pacientesDisponibles = [];
let streamCamara = null;
let fotosCapturadas = [];
let signaturePad = null;
let elementosDisponibles = [];


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
// INICIO
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
    capturarUbicacionGps();
    inicializarFirma();
    inicializarFotografia();
    inicializarFormulario();

    document.getElementById("btnAbrirCamara").addEventListener("click", abrirCamara);
    document.getElementById("btnTomarFoto").addEventListener("click", tomarFoto);   

    const selectServicio = document.getElementById("servicioParticular");
    const selectPaciente = document.getElementById("pacienteParticular");
    const inputPacienteId = document.getElementById("pacienteId");

    await cargarServicios(selectServicio);

    selectServicio.addEventListener("change", async () => {
        const servicio = selectServicio.value.trim();

        actualizarVistaSegunServicio(servicio);

        inputPacienteId.value = "";
        pacientesDisponibles = [];
        selectPaciente.disabled = true;

        if (!servicio) {
            selectPaciente.innerHTML = `<option value="">Primero seleccione un servicio...</option>`;
            return;
        }

        selectPaciente.innerHTML = `<option value="">Cargando pacientes...</option>`;
        await cargarUltimosPacientes(servicio, selectPaciente);
    });

    selectPaciente.addEventListener("change", async () => {
        const paciente = pacientesDisponibles.find(item => String(item.id) === String(selectPaciente.value));
        inputPacienteId.value = paciente ? paciente.id : "";

        const servicio = selectServicio.value.trim().toLowerCase();
        const esImplementacion = servicio.includes("implement");

        if (paciente && esImplementacion && paciente.tipo) {
            await cargarElementos(paciente.tipo);
        } else {
            limpiarElementos();
        }
    });
});


// ==========================================================
// SERVICIOS - VIENEN DESDE EL WORKER
// ==========================================================

async function cargarServicios(selectServicio) {
    let servicios = [];

    if (navigator.onLine) {
        try {
            const respuesta = await fetch(WORKER_URL + "?modo=serviciosParticular");
            const datos = await respuesta.json();

            if (respuesta.ok && datos.ok === true && Array.isArray(datos.servicios)) {
                servicios = datos.servicios;
                guardarServiciosOffline(servicios);
            }
        } catch (error) {
            console.warn("No fue posible cargar servicios desde el Worker.", error);
        }
    }

    if (servicios.length === 0) servicios = obtenerServiciosOffline();

    selectServicio.innerHTML = `<option value="">Seleccione el tipo de servicio...</option>`;

    servicios.forEach(servicio => {
        const opcion = document.createElement("option");
        opcion.value = servicio;
        opcion.textContent = servicio;
        selectServicio.appendChild(opcion);
    });
}


// ==========================================================
// ÚLTIMOS 5 PACIENTES SEGÚN SERVICIO
// ==========================================================

async function cargarUltimosPacientes(servicio, selectPaciente) {
    let resultados = [];

    if (navigator.onLine) {
        try {
            const url = `${WORKER_URL}?modo=particular&servicio=${encodeURIComponent(servicio)}`;
            const respuesta = await fetch(url);
            const datos = await respuesta.json();

            if (respuesta.ok && datos.ok === true && Array.isArray(datos.pacientes)) {
                resultados = datos.pacientes.slice(0, 5);
                guardarPacientesOffline(servicio, resultados);
            }
        } catch (error) {
            console.warn("Falló consulta online de pacientes. Se utilizará caché local.", error);
        }
    }

    if (resultados.length === 0) resultados = obtenerPacientesOffline(servicio);

    pacientesDisponibles = resultados;
    selectPaciente.innerHTML = `<option value="">Seleccione el paciente...</option>`;

    if (resultados.length === 0) {
        selectPaciente.innerHTML = `<option value="">No hay pacientes disponibles</option>`;
        selectPaciente.disabled = true;
        return;
    }

    resultados.forEach(item => {
        const opcion = document.createElement("option");
        opcion.value = item.id;
        opcion.textContent = item.nombre;
        selectPaciente.appendChild(opcion);
    });

    selectPaciente.disabled = false;
}

// ==========================================================
// ELEMENTOS SEGÚN TIPO DE IMPLEMENTACIÓN
// ==========================================================

async function cargarElementos(tipo) {
    const seccion = document.getElementById("seccionElementos");
    const lista = document.getElementById("listaElementos");

    elementosDisponibles = [];
    lista.innerHTML = "";
    seccion.hidden = true;

    try {
        const respuesta = await fetch(`${WORKER_URL}?modo=elementosParticular&tipo=${encodeURIComponent(tipo)}`);
        const datos = await respuesta.json();

        if (!respuesta.ok || datos.ok !== true || !Array.isArray(datos.elementos)) {
            throw new Error(datos.error || "No fue posible obtener los elementos.");
        }

        elementosDisponibles = datos.elementos;

        if (!elementosDisponibles.length) {
            lista.innerHTML = `<p>No hay elementos configurados para este tipo.</p>`;
            seccion.hidden = false;
            return;
        }

        elementosDisponibles.forEach((elemento, index) => {
            const fila = document.createElement("div");
            fila.className = "elemento-fila";

            fila.innerHTML = `
                <label class="elemento-nombre">${elemento.elemento}</label>
                <div class="contador elemento-contador">
                    <button type="button" class="btn-elemento-menos" data-index="${index}">−</button>
                    <input id="elemento-${index}" value="0" readonly>
                    <button type="button" class="btn-elemento-mas" data-index="${index}">+</button>
                </div>
            `;

            lista.appendChild(fila);
        });

        lista.querySelectorAll(".btn-elemento-menos").forEach(btn => {
            btn.addEventListener("click", () => cambiarCantidadElemento(Number(btn.dataset.index), -1));
        });

        lista.querySelectorAll(".btn-elemento-mas").forEach(btn => {
            btn.addEventListener("click", () => cambiarCantidadElemento(Number(btn.dataset.index), 1));
        });

        seccion.hidden = false;

    } catch (error) {
        console.error("Error cargando elementos:", error);
        limpiarElementos();
        alert("No fue posible cargar los elementos de la implementación.");
    }
}

function cambiarCantidadElemento(index, cambio) {
    const input = document.getElementById(`elemento-${index}`);
    if (!input) return;

    const actual = parseInt(input.value, 10) || 0;
    input.value = Math.max(0, Math.min(20, actual + cambio));
}

function obtenerElementosSeleccionados() {
    return elementosDisponibles
        .map((item, index) => ({
            elemento: item.elemento,
            cantidad: parseInt(document.getElementById(`elemento-${index}`)?.value || "0", 10),
            recarga: item.recarga === true
        }))
        .filter(item => item.cantidad > 0);
}

function limpiarElementos() {
    elementosDisponibles = [];

    const seccion = document.getElementById("seccionElementos");
    const lista = document.getElementById("listaElementos");

    if (lista) lista.innerHTML = "";
    if (seccion) seccion.hidden = true;
}

// ==========================================================
// MOSTRAR / OCULTAR SECCIONES SEGÚN SERVICIO
// ==========================================================

// ==========================================================
// MOSTRAR / OCULTAR SECCIONES SEGÚN SERVICIO
// ==========================================================

function actualizarVistaSegunServicio(servicio) {
    const valor = String(servicio || "").trim().toLowerCase();

    const esImplementacion = valor.includes("implement");
    const esRecarga = valor.includes("recarga");
    const esRetiro = valor.includes("retiro");
    const esVenta = valor.includes("venta");

    // IMPLEMENTACIÓN y VENTA no utilizan contadores normales.
    const mostrarCilindros = esRecarga || esRetiro;

    // RETIRO no utiliza fotografía.
    const mostrarFotos = !esRetiro;

    const seccionCilindros = document.getElementById("seccionCilindros");
    const seccionFotos = document.getElementById("seccionFotos");

    if (seccionCilindros) seccionCilindros.hidden = !mostrarCilindros;
    if (seccionFotos) seccionFotos.hidden = !mostrarFotos;

    // ELEMENTOS solamente pertenecen a IMPLEMENTACIÓN.
    if (!esImplementacion) limpiarElementos();

    // Si pasamos a Implementación o Venta, borramos cantidades
    // antiguas que pudieran haber quedado de otro servicio.
    if (!mostrarCilindros) {
        ["e07", "e10", "r07", "r10"].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = "0";
        });
    }

    // Al cambiar de servicio eliminamos fotografías anteriores.
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

    if (btnLimpiar) btnLimpiar.addEventListener("click", () => signaturePad.clear());
}


// ==========================================================
// FOTOGRAFÍA
// ==========================================================

function inicializarFotografia() {
    const inputFoto = document.getElementById("fotoServicio");
    const preview = document.getElementById("previewFoto");
    const contenedorPreview = document.getElementById("contenedorPreviewFoto");
    const btnEliminar = document.getElementById("btnEliminarFoto");

    if (!inputFoto || !preview || !contenedorPreview || !btnEliminar) return;

    inputFoto.addEventListener("change", () => {
        const archivo = inputFoto.files?.[0];

        if (!archivo) {
            fotoSeleccionada = null;
            contenedorPreview.hidden = true;
            return;
        }

        if (!archivo.type.startsWith("image/")) {
            alert("Debe seleccionar una fotografía válida.");
            inputFoto.value = "";
            fotoSeleccionada = null;
            return;
        }

        if (archivo.size > 10 * 1024 * 1024) {
            alert("La fotografía supera el máximo permitido de 10 MB.");
            inputFoto.value = "";
            fotoSeleccionada = null;
            return;
        }

        fotoSeleccionada = archivo;
        preview.src = URL.createObjectURL(archivo);
        contenedorPreview.hidden = false;
    });

    btnEliminar.addEventListener("click", () => {
        fotoSeleccionada = null;
        inputFoto.value = "";
        preview.removeAttribute("src");
        contenedorPreview.hidden = true;
    });
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
            const gpsValido = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(coordenadasGPS);
            if (gpsValido) return;

            if (error.code === error.PERMISSION_DENIED) coordenadasGPS = "Permiso GPS denegado";
            else if (error.code === error.POSITION_UNAVAILABLE) coordenadasGPS = "Señal GPS no disponible";
            else if (error.code === error.TIMEOUT) coordenadasGPS = "Tiempo de espera GPS agotado";
            else coordenadasGPS = "Ubicación no disponible";
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
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

    // ==========================================================
    // CÁMARA PARTICULAR - MÁXIMO 2 FOTOS
    // ==========================================================

    async function abrirCamara() {
        const video = document.getElementById("vistaCamara");
        const btnTomar = document.getElementById("btnTomarFoto");

        if (fotosCapturadas.length >= 2) {
            alert("Ya se alcanzó el máximo de 2 fotografías.");
            return;
        }

        try {
            if (streamCamara) detenerCamara();

            streamCamara = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" }
                },
                audio: false
            });

            video.srcObject = streamCamara;
            video.hidden = false;
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
        const btnTomar = document.getElementById("btnTomarFoto");

        if (video) {
            video.srcObject = null;
            video.hidden = true;
        }

        if (btnTomar) btnTomar.hidden = true;
    }


    async function tomarFoto() {
        if (!streamCamara || fotosCapturadas.length >= 2) return;

        const video = document.getElementById("vistaCamara");
        const canvas = document.getElementById("canvasFoto");

        if (!video.videoWidth || !video.videoHeight) {
            alert("La cámara todavía no está lista.");
            return;
        }

        const anchoMaximo = 1280;
        const escala = Math.min(1, anchoMaximo / video.videoWidth);

        canvas.width = Math.round(video.videoWidth * escala);
        canvas.height = Math.round(video.videoHeight * escala);

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

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

        if (!contenedor) return;

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

        const btnAbrir = document.getElementById("btnAbrirCamara");

        if (!btnAbrir) return;

        if (fotosCapturadas.length === 0) {
            btnAbrir.disabled = false;
            btnAbrir.textContent = "Abrir Cámara";
        }

        if (fotosCapturadas.length === 1) {
            btnAbrir.disabled = false;
            btnAbrir.textContent = "Tomar Segunda Foto";
        }

        if (fotosCapturadas.length >= 2) {
            btnAbrir.disabled = true;
            btnAbrir.textContent = "Máximo 2 Fotos";
        }
    }

    // ==========================================================
    // CONFIRMACIÓN FINAL ANTES DEL ENVÍO
    // ==========================================================

    function confirmarEnvioParticular(datos) {
        const servicio = String(datos.servicio || "").toUpperCase();

        const esImplementacion = servicio.includes("IMPLEMENT");
        const esVenta = servicio.includes("VENTA");

        let resumen = "CONFIRMAR SERVICIO\n\n";

        resumen += `Paciente: ${datos.paciente}\n`;
        resumen += `Servicio: ${servicio}\n`;

        if (esImplementacion && Array.isArray(datos.elementos)) {
            resumen += "\nELEMENTOS ENTREGADOS:\n";

            datos.elementos.forEach(item => {
                resumen += `${item.cantidad} × ${item.elemento}\n`;
            });
        }

        if (!esImplementacion && !esVenta) {
            resumen += "\n";

            resumen += `Entregados 0.7 m³: ${datos.e07}\n`;
            resumen += `Entregados 10 m³: ${datos.e10}\n`;
            resumen += `Retirados 0.7 m³: ${datos.r07}\n`;
            resumen += `Retirados 10 m³: ${datos.r10}\n`;
        }

        if (!servicio.includes("RETIRO")) {
            resumen += `\nFotografías: ${datos.fotos}\n`;
        }

        if (datos.observaciones) {
            resumen += `\nObservaciones:\n${datos.observaciones}\n`;
        }

        resumen += "\n¿Confirma que la información es correcta?";

        return window.confirm(resumen);
    }

    formulario.addEventListener("submit", async event => {
        event.preventDefault();

        const btnEnviar = document.getElementById("btnEnviar");
        const servicio = document.getElementById("servicioParticular").value.trim();
        const pacienteId = document.getElementById("pacienteId").value.trim();
        const pacienteSelect = document.getElementById("pacienteParticular");
        const pacienteNombre = pacienteSelect.options[pacienteSelect.selectedIndex]?.textContent?.trim() || "";
        const e07 = document.getElementById("e07").value;
        const e10 = document.getElementById("e10").value;
        const r07 = document.getElementById("r07").value;
        const r10 = document.getElementById("r10").value;
        const observaciones = document.getElementById("obs").value.trim().toUpperCase();
        const servicioNormalizado = servicio.toLowerCase();
        const requiereFoto =
            servicioNormalizado.includes("implement") ||
            servicioNormalizado.includes("recarga") ||
            servicioNormalizado.includes("venta");

        if (requiereFoto && fotosCapturadas.length === 0) {
            alert("Debe tomar al menos una fotografía antes de enviar el registro.");
            return;
        }

        if (fotosCapturadas.length > 2) {
            alert("Solo se permite un máximo de 2 fotografías.");
            return;
        }

        if (!servicio) {
            alert("Debe seleccionar un servicio.");
            return;
        }

        if (!pacienteId) {
            alert("Debe seleccionar un paciente válido.");
            return;
        }
        const esImplementacion = servicio.toLowerCase().includes("implement");
        const elementosSeleccionados = esImplementacion ? obtenerElementosSeleccionados() : [];

        if (esImplementacion && elementosSeleccionados.length === 0) {
            alert("Debe registrar al menos un elemento entregado en la implementación.");
            return;
        }

        if (!signaturePad || signaturePad.isEmpty()) {
            alert("Debe solicitar la firma del cliente.");
            return;
        }

        const confirmar = confirm(`¿Confirma el envío del registro?\n\nPaciente: ${pacienteNombre}`);
        if (!confirmar) return;

        btnEnviar.disabled = true;
        btnEnviar.textContent = "Enviando...";

        try {
            const firmaDataUrl = signaturePad.toDataURL("image/png");
            const respuestaFirma = await fetch(firmaDataUrl);
            const blobFirma = await respuestaFirma.blob();

            const payload = new FormData();
            payload.append("tipoCliente", "PARTICULAR");
            payload.append("servicio", servicio);
            payload.append("pacienteId", pacienteId);
            payload.append("elementos", JSON.stringify(elementosSeleccionados));
            payload.append("paciente", pacienteNombre);
            payload.append("entrega07", e07);
            payload.append("entrega10", e10);
            payload.append("retiro07", r07);
            payload.append("retiro10", r10);
            payload.append("observaciones", observaciones);
            payload.append("gps", coordenadasGPS);
            payload.append("dispositivo", navigator.userAgent);
            payload.append("firma", blobFirma, "firma.png");

            if (fotosCapturadas[0]) {
                payload.append(
                    "foto",
                    fotosCapturadas[0],
                    "foto-servicio-1.jpg"
                );
            }

            if (fotosCapturadas[1]) {
                payload.append(
                    "foto2",
                    fotosCapturadas[1],
                    "foto-servicio-2.jpg"
                );
            }

            const confirmado = confirmarEnvioParticular({
                servicio: servicio,
                paciente: pacienteNombre,
                elementos: elementosSeleccionados,
                e07: e07,
                e10: e10,
                r07: r07,
                r10: r10,
                observaciones: observaciones,
                fotos: fotosCapturadas.length
            });

            if (!confirmado) {
                btn.disabled = false;
                btn.textContent = "Enviar Registro";
                return;
            }

            const respuesta = await fetch(WORKER_URL, { method: "POST", body: payload });
            const resultado = await respuesta.json();

            if (!respuesta.ok || resultado.ok !== true) {
                throw new Error(resultado.error || "El servidor rechazó el registro.");
            }

            alert("Registro particular enviado correctamente.");
            location.reload();

        } catch (error) {
            console.error("Error al enviar registro particular:", error);
            alert(`No fue posible enviar el registro.\n\n${error.message}`);

        } finally {
            btnEnviar.disabled = false;
            btnEnviar.textContent = "Enviar Registro";
        }
    });
}