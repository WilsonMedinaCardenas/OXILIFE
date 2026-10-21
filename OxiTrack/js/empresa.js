
"use strict";

// ==========================================================
// OXITRACK - TERRENO EMPRESA
// ==========================================================

const API_EMPRESA = "https://oxilife.cl/api/oxitrack/";
const $ = id => document.getElementById(id);
const normalizar = valor => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();

let identidad = "", operario = "", asignaciones = [], seleccion = null;
let gps = "No disponible", firmaPad = null, streamCamara = null;
let fotosCapturadas = [], resultadoServicio = "ATENDIDO";
let enviando = false, sincronizando = false, consultaAsignaciones = 0;
let perfilCargado = false, detalleActual = [], ultimoAviso = "";

const clave = sufijo => `oxitrack_empresa_v2_${identidad}_${sufijo}`;
const leer = (llave, defecto) => { try { return JSON.parse(localStorage.getItem(llave)) ?? defecto; } catch { return defecto; } };
const guardar = (llave, valor) => localStorage.setItem(llave, JSON.stringify(valor));

function mensaje(texto) {
    ultimoAviso = texto;
    $("resultado").textContent = texto;
}

function estado() {
    $("estadoConexion").textContent = navigator.onLine ? "" : "Sin conexión. Se utilizarán datos guardados.";
    if (identidad) {
        const cantidad = leer(clave("cola"), []).length;
        $("cola").textContent = cantidad ? `Envíos pendientes: ${cantidad}` : "";
    }
}

async function consultar(modo, parametros = {}) {
    const url = new URL(API_EMPRESA);
    url.searchParams.set("modo", modo);
    Object.entries(parametros).forEach(([llave, valor]) => url.searchParams.set(llave, valor));

    const respuesta = await fetch(url, { credentials: "same-origin", cache: "no-store" });
    const tipo = String(respuesta.headers.get("content-type") || "").toLowerCase();
    if (!tipo.includes("application/json")) throw Error("No fue posible validar la sesión de OxiTrack.");

    const datos = await respuesta.json();
    if (!respuesta.ok || datos.ok !== true) throw Error(datos.error || "Error al consultar el servidor.");
    return datos;
}

function agregarOpcion(select, valor, texto) {
    const opcion = document.createElement("option");
    opcion.value = String(valor);
    opcion.textContent = String(texto);
    select.appendChild(opcion);
}

function abrirModalConfirmacion(filas) {
    return new Promise(resolve => {
        const modal = $("modalConfirmacion");
        const resumen = $("modalResumen");
        const volver = $("btnModalVolver");
        const confirmar = $("btnModalConfirmar");

        resumen.replaceChildren();
        filas.forEach(([nombre, valor]) => {
            const fila = document.createElement("div");
            const etiqueta = document.createElement("span");
            const dato = document.createElement("strong");
            fila.className = "dato-resumen";
            etiqueta.textContent = nombre;
            dato.textContent = String(valor ?? "");
            fila.append(etiqueta, dato);
            resumen.appendChild(fila);
        });

        const cerrar = respuesta => {
            modal.hidden = true;
            volver.onclick = null;
            confirmar.onclick = null;
            resolve(respuesta);
        };

        volver.onclick = () => cerrar(false);
        confirmar.onclick = () => cerrar(true);
        modal.hidden = false;
    });
}

function mostrarModalResultado(titulo, texto) {
    return new Promise(resolve => {
        $("modalResultadoTitulo").textContent = titulo;
        $("modalResultadoMensaje").textContent = texto;
        $("modalResultado").hidden = false;
        $("btnModalResultado").onclick = () => {
            $("modalResultado").hidden = true;
            $("btnModalResultado").onclick = null;
            resolve();
        };
    });
}

// ==========================================================
// DETALLE SOLICITADO
// ==========================================================

function detalleLista(valor) {
    let datos = valor;

    if (typeof datos === "string") {
        try {
            datos = JSON.parse(datos);
        } catch {
            datos = datos.trim() ? [{ elemento: datos, cantidad: 1 }] : [];
        }
    }

    if (datos && !Array.isArray(datos) && typeof datos === "object") {
        datos = Object.entries(datos).map(([elemento, cantidad]) => ({ elemento, cantidad }));
    }

    if (!Array.isArray(datos)) return [];

    return datos.map(item => {
        const gas = String(item.gas || "").trim();
        const elemento = String(item.elemento || item.nombre || item.producto || item.tipo || "").trim();
        const medida = String(item.medida || "").trim();
        const nombre = elemento || [gas, medida].filter(Boolean).join(" ");
        const cantidad = Number(item.cantidad ?? item.unidades ?? 1);
        return { nombre, cantidad, gas, elemento, medida };
    }).filter(item => item.nombre && Number.isInteger(item.cantidad) && item.cantidad >= 0);
}

function tipoServicio(servicio) {
    const texto = normalizar(servicio);
    if (texto.includes("IMPLEMENT")) return "IMPLEMENTACION";
    if (texto.includes("RETIRO")) return "RETIRO";
    if (texto.includes("RECARGA")) return "RECARGA";
    return "OTRO";
}

function crearContador(item, indice, grupo, inicial) {
    const fila = document.createElement("div");
    const nombre = document.createElement("label");
    const contador = document.createElement("div");
    const menos = document.createElement("button");
    const cantidad = document.createElement("input");
    const mas = document.createElement("button");

    fila.className = "elemento-fila";
    nombre.className = "elemento-nombre";
    contador.className = "contador elemento-contador";
    nombre.textContent = item.nombre;

    menos.type = "button";
    menos.textContent = "−";
    mas.type = "button";
    mas.textContent = "+";

    cantidad.type = "text";
    cantidad.readOnly = true;
    cantidad.value = String(inicial);
    cantidad.dataset.grupo = grupo;
    cantidad.dataset.indice = String(indice);

    menos.addEventListener("click", () => {
        cantidad.value = String(Math.max(0, Number(cantidad.value) - 1));
    });

    mas.addEventListener("click", () => {
        cantidad.value = String(Math.min(50, Number(cantidad.value) + 1));
    });

    contador.append(menos, cantidad, mas);
    fila.append(nombre, contador);
    return fila;
}

function crearSeccion(titulo, grupo, elementos, cantidadInicial) {
    const seccion = document.createElement("div");
    const encabezado = document.createElement("div");
    encabezado.className = "titulo";
    encabezado.textContent = titulo;
    seccion.appendChild(encabezado);

    elementos.forEach((item, indice) => {
        seccion.appendChild(crearContador(item, indice, grupo, cantidadInicial(item)));
    });

    return seccion;
}

function pintarCantidades() {
    const contenedor = $("cantidades");
    contenedor.replaceChildren();

    if (!seleccion) return;

    const clase = tipoServicio(seleccion.servicio);
    detalleActual = detalleLista(seleccion.detalleSolicitado);

    if (!detalleActual.length) {
        const aviso = document.createElement("p");
        aviso.className = "empresa-advertencia";
        aviso.textContent = "Este servicio no tiene elementos programados. Informe a Oficina antes de registrarlo.";
        contenedor.appendChild(aviso);
        return;
    }

    if (clase === "IMPLEMENTACION") {
        contenedor.appendChild(crearSeccion("ELEMENTOS ENTREGADOS", "ENTREGADOS", detalleActual, item => item.cantidad));
        return;
    }

    if (clase === "RETIRO") {
        contenedor.appendChild(crearSeccion("ELEMENTOS RETIRADOS", "RETIRADOS", detalleActual, item => item.cantidad));
        return;
    }

    contenedor.appendChild(crearSeccion("ENTREGADOS", "ENTREGADOS", detalleActual, item => item.cantidad));
    contenedor.appendChild(crearSeccion("RETIRADOS", "RETIRADOS", detalleActual, () => 0));
}

function valorCantidad(grupo, indice) {
    const input = [...$("cantidades").querySelectorAll("input")].find(item =>
        item.dataset.grupo === grupo && item.dataset.indice === String(indice)
    );

    if (!input) return 0;
    const valor = Number(input.value);
    if (!Number.isInteger(valor) || valor < 0 || valor > 50) throw Error("Cantidad inválida.");
    return valor;
}

function cantidades() {
    const clase = tipoServicio(seleccion.servicio);
    const entregados = clase === "RETIRO" ? [] : detalleActual.map((item, indice) => ({
        nombre: item.nombre, cantidad: valorCantidad("ENTREGADOS", indice)
    }));

    const retirados = clase === "IMPLEMENTACION" ? [] : detalleActual.map((item, indice) => ({
        nombre: item.nombre, cantidad: valorCantidad("RETIRADOS", indice)
    }));

    return { entregados, retirados };
}

// ==========================================================
// FIRMA Y CÁMARA
// ==========================================================

function ajustarFirma() {
    const canvas = $("firma");
    const ancho = canvas.getBoundingClientRect().width || canvas.offsetWidth || 400;
    const escala = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Math.round(ancho * escala);
    canvas.height = Math.round(220 * escala);
    canvas.getContext("2d").scale(escala, escala);
    if (firmaPad) firmaPad.clear();
}

async function abrirCamara() {
    if (fotosCapturadas.length >= 2) {
        await mostrarModalResultado("Fotografías", "Puede registrar un máximo de dos fotografías.");
        return;
    }

    try {
        detenerCamara();
        if (!navigator.mediaDevices?.getUserMedia) throw Error("Cámara no disponible.");
        streamCamara = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } }, audio: false
        });

        $("vistaCamara").srcObject = streamCamara;
        $("vistaCamara").hidden = false;
        $("btnAbrirCamara").hidden = true;
        $("btnTomarFoto").hidden = false;
        await $("vistaCamara").play();
    } catch (error) {
        detenerCamara();
        await mostrarModalResultado("Cámara", "No fue posible abrir la cámara. Revise los permisos del teléfono.");
    }
}

function detenerCamara() {
    if (streamCamara) {
        streamCamara.getTracks().forEach(track => track.stop());
        streamCamara = null;
    }
    $("vistaCamara").srcObject = null;
    $("vistaCamara").hidden = true;
    $("btnTomarFoto").hidden = true;
    $("btnAbrirCamara").hidden = false;
}

async function tomarFoto() {
    const video = $("vistaCamara");
    if (!streamCamara || !video.videoWidth || fotosCapturadas.length >= 2) return;

    const canvas = $("canvasFoto");
    const escala = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * escala);
    canvas.height = Math.round(video.videoHeight * escala);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    fotosCapturadas.push(canvas.toDataURL("image/jpeg", 0.72));
    detenerCamara();
    pintarFotos();
}

function pintarFotos() {
    const contenedor = $("previewFotos");
    contenedor.replaceChildren();

    fotosCapturadas.forEach((foto, indice) => {
        const marco = document.createElement("div");
        const imagen = document.createElement("img");
        const eliminar = document.createElement("button");

        marco.className = "foto-preview";
        imagen.src = foto;
        imagen.alt = `Fotografía ${indice + 1}`;
        eliminar.type = "button";
        eliminar.textContent = "×";
        eliminar.setAttribute("aria-label", "Eliminar fotografía");

        eliminar.onclick = () => {
            fotosCapturadas.splice(indice, 1);
            pintarFotos();
        };

        marco.append(imagen, eliminar);
        contenedor.appendChild(marco);
    });

    $("btnAbrirCamara").hidden = fotosCapturadas.length >= 2;
}

// ==========================================================
// RESULTADO DEL SERVICIO
// ==========================================================

function cambiarResultado(resultado) {
    resultadoServicio = resultado;
    const noRealizado = resultado === "NO REALIZADO";

    $("cantidades").hidden = noRealizado;
    $("tituloFirmaEmpresa").hidden = noRealizado;
    $("firma").hidden = noRealizado;
    $("btnLimpiar").hidden = noRealizado;
    $("btnNoRealizado").hidden = noRealizado;
    $("avisoNoRealizado").hidden = !noRealizado;
    $("seccionFotos").hidden = false;

    $("seccionFotos").querySelector(".texto-foto").textContent = noRealizado
        ? "Tome al menos una fotografía como respaldo del servicio no realizado."
        : "Tome al menos una fotografía del servicio realizado.";

    $("btnEnviar").textContent = "Enviar Registro";

    if (noRealizado) $("observaciones").focus();
}

// ==========================================================
// SERVICIOS Y ASIGNACIONES
// ==========================================================

async function cargarServicios() {
    let servicios = [];

    if (navigator.onLine) {
        try {
            const datos = await consultar("serviciosEmpresa");
            if (!Array.isArray(datos.servicios)) throw Error("Catálogo inválido.");
            servicios = datos.servicios;
            guardar(clave("servicios"), servicios);
        } catch (error) {
            servicios = leer(clave("servicios"), []);
            mensaje(`Se utilizará el catálogo guardado: ${error.message}`);
        }
    } else {
        servicios = leer(clave("servicios"), []);
    }

    $("servicio").replaceChildren();
    agregarOpcion($("servicio"), "", "Seleccione el tipo de servicio...");
    servicios.forEach(servicio => agregarOpcion($("servicio"), servicio, servicio));
}

async function cargarAsignaciones() {
    const consulta = ++consultaAsignaciones;
    const servicio = $("servicio").value.trim();

    seleccion = null;
    asignaciones = [];
    detalleActual = [];
    $("cantidades").replaceChildren();
    $("asignacion").disabled = true;
    $("asignacion").replaceChildren();

    if (!servicio) {
        agregarOpcion($("asignacion"), "", "Primero seleccione un servicio...");
        return;
    }

    agregarOpcion($("asignacion"), "", "Cargando pacientes...");
    const llave = clave(`asignaciones_${normalizar(servicio)}`);
    let resultados = [];
    let consultaCorrecta = false;

    if (navigator.onLine) {
        try {
            const datos = await consultar("asignacionesEmpresaTerreno", { servicio });
            if (!Array.isArray(datos.servicios)) throw Error("Respuesta de asignaciones inválida.");
            resultados = datos.servicios;
            consultaCorrecta = true;
        } catch (error) {
            mensaje(`No fue posible actualizar pacientes. Se utilizará información guardada: ${error.message}`);
        }
    }

    if (!consultaCorrecta) resultados = leer(llave, []);
    if (consulta !== consultaAsignaciones) return;

    if (consultaCorrecta) guardar(llave, resultados);

    const pendientesLocales = new Set(leer(clave("cola"), []).map(item => String(item.id)));
    asignaciones = resultados.filter(item => !pendientesLocales.has(String(item.id)));

    $("asignacion").replaceChildren();
    agregarOpcion($("asignacion"), "", asignaciones.length ? "Seleccione el paciente..." : "No hay pacientes disponibles");

    asignaciones.forEach(item => {
        const etiqueta = item.paciente ? `${item.paciente} | ${item.empresa}` : item.empresa;
        agregarOpcion($("asignacion"), item.id, etiqueta);
    });

    $("asignacion").disabled = asignaciones.length === 0;
}

function mostrarSeleccion() {
    seleccion = asignaciones.find(item => String(item.id) === String($("asignacion").value)) || null;
    if (!seleccion) {
        $("cantidades").replaceChildren();
        return;
    }

    $("pacienteId").value = String(seleccion.id);
    $("receptor").value = "";
    $("observaciones").value = "";
    fotosCapturadas = [];
    detenerCamara();
    pintarFotos();

    ajustarFirma();
    pintarCantidades();
    cambiarResultado("ATENDIDO");
}

// ==========================================================
// ENVÍO Y ALMACENAMIENTO OFFLINE
// ==========================================================

function generarEnvioId() {
    return crypto.randomUUID ? crypto.randomUUID() :
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

async function registrar() {
    if (enviando || !seleccion) return;

    try {
        const observaciones = $("observaciones").value.trim();
        const clase = tipoServicio(seleccion.servicio);
        const noRealizado = resultadoServicio === "NO REALIZADO";
        const requiereFoto = noRealizado || clase === "IMPLEMENTACION" || clase === "RECARGA";

        if (noRealizado && !observaciones) throw Error("NO REALIZADO requiere observaciones.");
        if (requiereFoto && fotosCapturadas.length === 0) throw Error("Debe tomar al menos una fotografía.");
        if (!noRealizado && firmaPad.isEmpty()) throw Error("Debe registrar la firma.");
        if (!noRealizado && !detalleActual.length) throw Error("El servicio no tiene elementos programados. Consulte a Oficina.");

        const detalle = noRealizado ? { entregados: [], retirados: [] } : cantidades();
        const resumen = [
            ["Resultado", resultadoServicio],
            ["Servicio", seleccion.servicio],
            ["Paciente / Empresa", seleccion.paciente ? `${seleccion.paciente} | ${seleccion.empresa}` : seleccion.empresa],
            ["Recibe", $("receptor").value.trim() || "No informado"],
            ["Observaciones", observaciones || "Sin observaciones"]
        ];

        if (!noRealizado) {
            detalle.entregados.forEach(item => resumen.push([`Entregado: ${item.nombre}`, item.cantidad]));
            detalle.retirados.forEach(item => resumen.push([`Retirado: ${item.nombre}`, item.cantidad]));
        }

        if (!await abrirModalConfirmacion(resumen)) return;

        enviando = true;
        $("btnEnviar").disabled = true;
        $("btnNoRealizado").disabled = true;

        const envio = {
            tipoCliente: "EMPRESA_TERRENO",
            id: seleccion.id,
            servicio: seleccion.servicio,
            resultadoServicio,
            envioId: generarEnvioId(),
            detalleRealizado: JSON.stringify(detalle),
            observaciones,
            receptor: $("receptor").value.trim(),
            gps,
            dispositivo: navigator.userAgent.slice(0, 180),
            fotoData: fotosCapturadas[0] || "",
            firmaData: noRealizado ? "" : firmaPad.toDataURL("image/png")
        };

        const cola = leer(clave("cola"), []);
        cola.push(envio);
        guardar(clave("cola"), cola);

        const servicioActual = $("servicio").value;

        $("btnEnviar").textContent = "Enviando...";
        mensaje("Procesando registro. Espere un momento.");

        detenerCamara();
        estado();

        await sincronizar();

        const siguePendiente = leer(clave("cola"), []).some(item => item.envioId === envio.envioId);

        await mostrarModalResultado(
            siguePendiente ? "Registro pendiente" : "Registro exitoso",
            siguePendiente
                ? "El servicio quedó guardado en este dispositivo. Se enviará cuando el servidor esté disponible."
                : "El servicio fue recibido por el servidor."
        );

            if (!siguePendiente) {
                seleccion = null;
                asignaciones = [];
                detalleActual = [];

                $("asignacion").value = "";
                $("receptor").value = "";
                $("observaciones").value = "";
                $("cantidades").replaceChildren();

                fotosCapturadas = [];
                pintarFotos();

                firmaPad.clear();
                cambiarResultado("ATENDIDO");

                $("servicio").value = servicioActual;
                await cargarAsignaciones();
        } else {
            mensaje("Registro guardado en este dispositivo, pendiente de sincronización.");
        }
    } catch (error) {
        await mostrarModalResultado("No fue posible registrar", error.message);
    } finally {
        enviando = false;
        $("btnEnviar").disabled = false;
        $("btnEnviar").textContent = "Enviar Registro";
        $("btnNoRealizado").disabled = false;
        estado();
    }
}

async function sincronizar() {
    if (sincronizando || !navigator.onLine || !identidad) return;

    sincronizando = true;

    try {
        let cola = leer(clave("cola"), []);

        while (cola.length) {
            const registro = cola[0];
            const formulario = new FormData();
            Object.entries(registro).forEach(([llave, valor]) => formulario.append(llave, valor));

            let respuesta, datos;

            try {
                respuesta = await fetch(API_EMPRESA, {
                    method: "POST",
                    body: formulario,
                    credentials: "same-origin",
                    cache: "no-store"
                });

                const tipo = String(respuesta.headers.get("content-type") || "").toLowerCase();
                if (!tipo.includes("application/json")) throw Error("La sesión no devolvió una respuesta válida.");
                datos = await respuesta.json();
            } catch (error) {
                mensaje("Sin conexión o sesión no disponible. El envío permanece guardado.");
                break;
            }

            if (!respuesta.ok || datos.ok !== true) {
                mensaje(`Envío pendiente: ${datos.error || respuesta.status}. No se eliminará.`);
                break;
            }

            cola.shift();
            guardar(clave("cola"), cola);
            mensaje(datos.duplicado ? "El servicio ya estaba registrado." : "Servicio registrado correctamente.");
        }
    } finally {
        sincronizando = false;
        estado();
    }
}

// ==========================================================
// INICIALIZACIÓN
// ==========================================================

async function iniciar() {
    $("formulario").addEventListener("submit", evento => {
        evento.preventDefault();
        registrar();
    });

    $("btnNoRealizado").addEventListener("click", async () => {
        if (!seleccion) return;
        cambiarResultado("NO REALIZADO");
        await mostrarModalResultado(
            "Servicio no realizado",
            "Indique el motivo en Observaciones y tome al menos una fotografía. No se requiere firma."
        );
    });

    $("btnCancelarNoRealizado").addEventListener("click", () => cambiarResultado("ATENDIDO"));
    $("btnAbrirCamara").addEventListener("click", abrirCamara);
    $("btnTomarFoto").addEventListener("click", tomarFoto);
    $("btnLimpiar").addEventListener("click", () => firmaPad?.clear());
    $("servicio").addEventListener("change", cargarAsignaciones);
    $("asignacion").addEventListener("change", mostrarSeleccion);

    window.addEventListener("online", async () => {
        estado();
        await sincronizar();
        if ($("servicio").value) await cargarAsignaciones();
    });

    window.addEventListener("offline", estado);

    document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === "visible" && navigator.onLine) {
            await sincronizar();
        }
    });

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            posicion => gps = `${posicion.coords.latitude},${posicion.coords.longitude}`,
            () => {},
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 12000 }
        );
    }

    try {
        const perfil = await consultar("perfilUsuario");
        identidad = String(perfil.email || perfil.emailAccess || "").trim().toLowerCase();
        operario = String(perfil.operario || "").trim();

        if (!identidad || !operario) throw Error("El perfil no devolvió correo y operario.");

        perfilCargado = true;
        firmaPad = new SignaturePad($("firma"));
        await cargarServicios();
        await sincronizar();

        // Precarga todas las asignaciones para mantenerlas disponibles sin internet.
        if (navigator.onLine) {
            const servicioOriginal = $("servicio").value;

            for (const opcion of [...$("servicio").options].slice(1)) {
                try {
                    const datos = await consultar("asignacionesEmpresaTerreno", { servicio: opcion.value });
                    if (Array.isArray(datos.servicios)) {
                        guardar(clave(`asignaciones_${normalizar(opcion.value)}`), datos.servicios);
                    }
                } catch (error) {
                    console.warn("No fue posible precargar:", opcion.value, error);
                }
            }

            $("servicio").value = servicioOriginal;
        }

        mensaje("");
    } catch (error) {
        mensaje(`No fue posible iniciar Empresa: ${error.message}`);
        $("servicio").disabled = true;
    }

    estado();
}

window.addEventListener("DOMContentLoaded", iniciar);
