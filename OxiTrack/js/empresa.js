
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
let promesaSincronizacionEmpresa = null;
let perfilCargado = false, detalleActual = [], ultimoAviso = "";

const clave = sufijo => `oxitrack_empresa_v2_${identidad}_${sufijo}`;
const leer = (llave, defecto) => { try { return JSON.parse(localStorage.getItem(llave)) ?? defecto; } catch { return defecto; } };
const guardar = (llave, valor) => localStorage.setItem(llave, JSON.stringify(valor));
const CLAVE_IDENTIDAD_EMPRESA = "oxitrack_empresa_ultima_identidad";

function guardarIdentidadEmpresa(email, nombreOperario) {
    localStorage.setItem(
        CLAVE_IDENTIDAD_EMPRESA,
        JSON.stringify({
            email: String(email || "").trim().toLowerCase(),
            operario: String(nombreOperario || "").trim()
        })
    );
}

function recuperarIdentidadEmpresa() {
    const datos = leer(CLAVE_IDENTIDAD_EMPRESA, null);

    if (!datos || !datos.email || !datos.operario) {
        return false;
    }

    identidad = String(datos.email).trim().toLowerCase();
    operario = String(datos.operario).trim();

    return true;
}

function mensaje(texto) {
    ultimoAviso = texto;
    $("resultado").textContent = texto;
}

async function estado() {
    $("estadoConexion").textContent = navigator.onLine
        ? ""
        : "Sin conexión. Se utilizarán datos guardados.";

    if (!identidad) return;

    try {
        const cantidad = (await enviosPendientesEmpresa()).length;

        $("cola").textContent = cantidad
            ? `Envíos pendientes: ${cantidad}`
            : "";

    } catch (error) {
        console.error("No fue posible consultar la cola Empresa:", error);
        $("cola").textContent = "No fue posible consultar los envíos pendientes.";
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

function mostrarModalResultado(titulo, texto, limpiarAlAceptar = false) {
    return new Promise(resolve => {
        $("modalResultadoTitulo").textContent = titulo;
        $("modalResultadoMensaje").textContent = texto;
        $("modalResultado").hidden = false;

        $("btnModalResultado").onclick = () => {
            $("modalResultado").hidden = true;
            $("btnModalResultado").onclick = null;

            if (limpiarAlAceptar) {
                limpiarFormularioEmpresa();
                window.location.assign("./index.html");
            }

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

    // VENTA no requiere elementos ni contadores.
    if (clase === "OTRO") {return;}

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
    const select = $("servicio");
    let servicios = leer(clave("servicios"), []);

    function pintar(lista) {
        const anterior = select.value;

        select.replaceChildren();

        agregarOpcion(
            select,
            "",
            "Seleccione el tipo de servicio..."
        );

        lista.forEach(servicio => {
            agregarOpcion(select, servicio, servicio);
        });

        if (lista.includes(anterior)) {
            select.value = anterior;
        }
    }

    // Primero mostrar catálogo guardado.
    pintar(servicios);

    if (!navigator.onLine) return;

    try {
        const datos = await consultar("serviciosEmpresa");

        if (!Array.isArray(datos.servicios)) {
            throw Error("Catálogo de Empresa inválido.");
        }

        servicios = datos.servicios;

        guardar(clave("servicios"), servicios);

        // No reconstruir el selector si el operario ya eligió
        // un servicio o un paciente.
        if (!$("servicio").value && !seleccion) {
            pintar(servicios);
        }

    } catch (error) {
        console.warn(
            "Empresa: se conserva catálogo local:",
            error
        );
    }
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

    const pendientes = await enviosPendientesEmpresa();
    const pendientesLocales = new Set(pendientes.map(item => String(item.id)));
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
// INDEXEDDB - COLA EMPRESA
// ==========================================================

const DB_EMPRESA = "oxitrack_empresa_db";
const STORE_ENVIOS_EMPRESA = "envios";

function abrirDbEmpresa() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_EMPRESA, 1);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(STORE_ENVIOS_EMPRESA)) {
                db.createObjectStore(STORE_ENVIOS_EMPRESA, {
                    keyPath: "envioId"
                });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function guardarEnvioEmpresa(registro) {
    const db = await abrirDbEmpresa();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ENVIOS_EMPRESA, "readwrite");

        tx.objectStore(STORE_ENVIOS_EMPRESA).put(registro);

        tx.oncomplete = () => {
            db.close();
            resolve();
        };

        tx.onerror = () => {
            const error = tx.error;
            db.close();
            reject(error);
        };

        tx.onabort = () => {
            const error = tx.error || Error("Almacenamiento interrumpido.");
            db.close();
            reject(error);
        };
    });
}

async function obtenerEnviosEmpresa() {
    const db = await abrirDbEmpresa();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ENVIOS_EMPRESA, "readonly");
        const request = tx.objectStore(STORE_ENVIOS_EMPRESA).getAll();

        request.onsuccess = () => {
            const registros = Array.isArray(request.result)
                ? request.result
                : [];

            resolve(registros);
        };

        request.onerror = () => reject(request.error);

        tx.oncomplete = () => db.close();
    });
}

async function eliminarEnvioEmpresa(envioId) {
    const db = await abrirDbEmpresa();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ENVIOS_EMPRESA, "readwrite");

        tx.objectStore(STORE_ENVIOS_EMPRESA).delete(envioId);

        tx.oncomplete = () => {
            db.close();
            resolve();
        };

        tx.onerror = () => {
            const error = tx.error;
            db.close();
            reject(error);
        };

        tx.onabort = () => {
            const error = tx.error || Error("No fue posible eliminar el envío.");
            db.close();
            reject(error);
        };
    });
}

async function migrarColaEmpresaAnterior() {
    if (!identidad) return;

    const anterior = leer(clave("cola"), []);

    if (!Array.isArray(anterior) || !anterior.length) return;

    for (const registro of anterior) {
        await guardarEnvioEmpresa({
            ...registro,
            identidad,
            fechaCreacion: registro.fechaCreacion || new Date().toISOString()
        });
    }

    // Solo se elimina la cola antigua cuando todos los
    // registros se guardaron correctamente en IndexedDB.
    localStorage.removeItem(clave("cola"));
}

async function enviosPendientesEmpresa() {
    const registros = await obtenerEnviosEmpresa();

    return registros
        .filter(item => item.identidad === identidad)
        .sort((a, b) =>
            String(a.fechaCreacion || "").localeCompare(
                String(b.fechaCreacion || "")
            )
        );
}

// Diagnóstico temporal: no elimina ni modifica registros.
window.diagnosticoOfflineEmpresa = async function() {

    const todos = await obtenerEnviosEmpresa();

    const resumen = todos.map(item => ({
        id: item.id,
        envioId: item.envioId,
        identidad: item.identidad,
        identidadActual: identidad,
        fechaCreacion: item.fechaCreacion,
        ultimoError: item.ultimoError || "",
        ultimoIntento: item.ultimoIntento || "",
        tieneFoto: Boolean(item.fotoData),
        tieneFirma: Boolean(item.firmaData)
    }));

    console.table(resumen);

    return resumen;
};
// ==========================================================
// DIAGNÓSTICO OFFLINE EMPRESA - VISIBLE EN CELULAR
// ==========================================================

let ultimoErrorSincronizacionEmpresa = "";

async function mostrarDiagnosticoEmpresa() {

    const registros = await obtenerEnviosEmpresa();

    const propios = registros.filter(item =>
        item.identidad === identidad
    );

    const otrasIdentidades = registros.filter(item =>
        item.identidad !== identidad
    );

    const errores = propios
        .map(item => item.ultimoError || "")
        .filter(Boolean);

    const texto = [
        `Conexión del teléfono: ${navigator.onLine ? "ACTIVA" : "SIN CONEXIÓN"}`,
        `Sesión Empresa: ${identidad ? "IDENTIFICADA" : "NO IDENTIFICADA"}`,
        `Registros pendientes: ${propios.length}`,
        `Registros con otra identidad: ${otrasIdentidades.length}`,
        `Último error: ${ultimoErrorSincronizacionEmpresa || errores[0] || "NINGUNO REGISTRADO"}`,
        `IDs pendientes: ${propios.map(item => item.id).join(", ") || "NINGUNO"}`
    ].join("\n");

    await mostrarModalResultado(
        "Diagnóstico Empresa",
        texto
    );
}

function crearBotonDiagnosticoEmpresa() {

    if (document.getElementById("btnDiagnosticoEmpresa")) {
        return;
    }

    const boton = document.createElement("button");

    boton.id = "btnDiagnosticoEmpresa";
    boton.type = "button";
    boton.textContent = "REVISAR ENVÍOS PENDIENTES";

    boton.style.cssText = `
        display:block;
        width:100%;
        margin:16px 0;
        padding:14px;
        border-radius:8px;
        border:1px solid #611e63;
        background:#ffffff;
        color:#611e63;
        font-weight:bold;
        cursor:pointer;
    `;

    boton.addEventListener("click", async () => {

        boton.disabled = true;
        boton.textContent = "COMPROBANDO ENVÍOS...";

        try {

            await sincronizar();

            await mostrarDiagnosticoEmpresa();

        } catch (error) {

            await mostrarModalResultado(
                "Error de diagnóstico",
                String(error.message || error)
            );

        } finally {

            boton.disabled = false;
            boton.textContent = "REVISAR ENVÍOS PENDIENTES";
        }
    });

    $("formulario").insertAdjacentElement(
        "afterend",
        boton
    );
}
// ==========================================================
// ENVÍO Y ALMACENAMIENTO OFFLINE
// ==========================================================

function limpiarFormularioEmpresa() {
    detenerCamara();

    seleccion = null;
    asignaciones = [];
    detalleActual = [];
    fotosCapturadas = [];

    $("formulario").reset();

    $("servicio").value = "";
    $("asignacion").replaceChildren();
    agregarOpcion(
        $("asignacion"),
        "",
        "Primero seleccione un servicio..."
    );
    $("asignacion").disabled = true;

    $("pacienteId").value = "";
    $("receptor").value = "";
    $("observaciones").value = "";
    $("cantidades").replaceChildren();

    pintarFotos();

    if (firmaPad) {
        firmaPad.clear();
    }

    cambiarResultado("ATENDIDO");
    $("resultado").textContent = "";
}

function generarEnvioId() {
    return crypto.randomUUID ? crypto.randomUUID() :
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

async function registrar() {
    if (enviando) return;

    if (!seleccion || !$("servicio").value) {
        await mostrarModalResultado(
            "Seleccione un servicio",
            "Seleccione el servicio y el paciente antes de enviar."
        );
        return;
    }

    let guardadoLocalmente = false;

    try {
        const observaciones = $("observaciones").value.trim().toUpperCase();
        const receptor = $("receptor").value.trim().toUpperCase();
        const noRealizado = resultadoServicio === "NO REALIZADO";
        const clase = tipoServicio(seleccion.servicio);

        if (fotosCapturadas.length === 0) {throw Error("Debe tomar al menos una fotografía.");}
        if (noRealizado && !observaciones) {throw Error("Debe indicar el motivo del servicio no realizado.");}
        if (!noRealizado && (!firmaPad || firmaPad.isEmpty())) {throw Error("Debe registrar la firma del cliente.");}
        if (!noRealizado && clase !== "OTRO" && !detalleActual.length) {throw Error("El servicio no tiene elementos programados. Consulte a Oficina.");}
        const detalle = (noRealizado || clase === "OTRO") ? { entregados: [], retirados: [] } : cantidades();
        const resumen = [["Resultado", resultadoServicio],["Servicio", seleccion.servicio],
            ["Paciente / Empresa",seleccion.paciente ? `${seleccion.paciente} | ${seleccion.empresa}` : seleccion.empresa],
            ["Recibe", receptor || "NO INFORMADO"]
        ];

        if (observaciones) {
            resumen.push(["Observaciones", observaciones]);
        }

        if (!noRealizado) {
            detalle.entregados.forEach(item => {
                resumen.push([
                    `Entregado: ${item.nombre}`,
                    item.cantidad
                ]);
            });

            detalle.retirados.forEach(item => {
                resumen.push([
                    `Retirado: ${item.nombre}`,
                    item.cantidad
                ]);
            });
        }

        if (!await abrirModalConfirmacion(resumen)) {
            return;
        }

        // Bloquear un segundo envío del mismo formulario.
        enviando = true;
        $("btnEnviar").disabled = true;
        $("btnNoRealizado").disabled = true;
        $("btnEnviar").textContent = "Guardando...";

        const envio = {
            tipoCliente: "EMPRESA_TERRENO",
            id: seleccion.id,
            servicio: seleccion.servicio,
            resultadoServicio,
            envioId: generarEnvioId(),
            detalleRealizado: JSON.stringify(detalle),
            observaciones,
            receptor,
            gps,
            dispositivo: navigator.userAgent.slice(0, 180),
            fotoData: fotosCapturadas[0] || "",
            foto2Data: fotosCapturadas[1] || "",
            firmaData: noRealizado
                ? ""
                : firmaPad.toDataURL("image/png"),
            identidad,
            fechaCreacion: new Date().toISOString()
        };

        // Primero proteger todos los datos, fotografías
        // y firma en IndexedDB.
        await guardarEnvioEmpresa(envio);

        guardadoLocalmente = true;

        // Desde este momento NO se debe volver a generar
        // otro envioId para el mismo registro.

        if (!navigator.onLine) {
            await mostrarModalResultado(
                "Registro guardado",
                "No hay conexión a internet. El registro quedó guardado de forma segura y se enviará automáticamente cuando vuelva la señal.",
                true
            );
            return;
        }

        // Con señal, intentar enviar el registro guardado.
        $("btnEnviar").textContent = "Enviando...";

        await sincronizar();

        const pendientes = await enviosPendientesEmpresa();

        const siguePendiente = pendientes.some(
            item => item.envioId === envio.envioId
        );

        if (siguePendiente) {
            await mostrarModalResultado(
                "Envío pendiente",
                "No fue posible confirmar la recepción del servicio. El registro quedó guardado y se enviará automáticamente cuando se restablezca la conexión.",
                true
            );
        } else {
            await mostrarModalResultado(
                "Registro enviado",
                "El servicio fue recibido correctamente.",
                true
            );
        }

    } catch (error) {
        console.error("Empresa: error de registro:", error);

        if (guardadoLocalmente) {
            await mostrarModalResultado(
                "Envío pendiente",
                "El servicio quedó guardado en este dispositivo. Se intentará enviarlo automáticamente cuando se restablezca la conexión.",
                true
            );
        } else {
            await mostrarModalResultado(
                "No se pudo guardar",
                "El servicio NO quedó guardado. Conserve la fotografía, la firma y los datos en pantalla. Detalle: " +
                error.message
            );
        }

    } finally {
        enviando = false;
        $("btnEnviar").disabled = false;
        $("btnNoRealizado").disabled = false;
        $("btnEnviar").textContent = "Enviar Registro";

        void estado();
    }
}

function sincronizar() {

    if (promesaSincronizacionEmpresa) {
        return promesaSincronizacionEmpresa;
    }

    if (!navigator.onLine || !identidad) {
        return Promise.resolve();
    }

    promesaSincronizacionEmpresa = (async () => {

        sincronizando = true;

        try {

            const pendientes = await enviosPendientesEmpresa();

            for (const registro of pendientes) {

                if (!navigator.onLine) {
                    break;
                }

                const formulario = new FormData();

                Object.entries(registro).forEach(([llave, valor]) => {

                    if (
                        llave !== "identidad" &&
                        llave !== "fechaCreacion" &&
                        llave !== "ultimoError" &&
                        llave !== "ultimoIntento"
                    ) {
                        formulario.append(llave, valor);
                    }
                });

                const controlador = new AbortController();

                const temporizador = setTimeout(
                    () => controlador.abort(),
                    60000
                );

                try {

                    const respuesta = await fetch(API_EMPRESA, {
                        method: "POST",
                        body: formulario,
                        credentials: "same-origin",
                        cache: "no-store",
                        signal: controlador.signal
                    });

                    const tipo = String(
                        respuesta.headers.get("content-type") || ""
                    ).toLowerCase();

                    if (!tipo.includes("application/json")) {
                        throw new Error(
                            `Respuesta no JSON. HTTP ${respuesta.status}. ` +
                            "Compruebe que la sesión esté activa."
                        );
                    }

                    const datos = await respuesta.json();

                    if (!respuesta.ok || datos.ok !== true) {

                        throw new Error(
                            String(
                                datos.error ||
                                `Servidor rechazó el envío. HTTP ${respuesta.status}`
                            )
                        );
                    }

                    console.log(
                        "EMPRESA: servidor confirmó el envío",
                        registro.id,
                        registro.envioId
                    );

                    // Solo borrar cuando el servidor confirmó éxito.
                    await eliminarEnvioEmpresa(registro.envioId);

                    ultimoErrorSincronizacionEmpresa = "";

                    console.log(
                        "Empresa: registro confirmado:",
                        registro.id,
                        registro.envioId
                    );

                } catch (error) {

                    const motivo = error.name === "AbortError"
                        ? "Tiempo de espera agotado al contactar el servidor."
                        : String(error.message || error);

                    ultimoErrorSincronizacionEmpresa = motivo;

                    console.error(
                        "Empresa: envío pendiente:",
                        registro.id,
                        motivo
                    );

                    // Preservar toda la evidencia y registrar el error.
                    try {
                        await guardarEnvioEmpresa({
                            ...registro,
                            ultimoError: motivo,
                            ultimoIntento: new Date().toISOString()
                        });
                    } catch (errorAlGuardar) {
                        console.error(
                            "No se pudo guardar el diagnóstico:",
                            errorAlGuardar
                        );
                    }

                    // No seguir enviando los siguientes registros
                    // hasta resolver el primero.
                    break;

                } finally {

                    clearTimeout(temporizador);
                }
            }

        } catch (error) {

            ultimoErrorSincronizacionEmpresa =
                String(error.message || error);

            console.error(
                "Empresa: error general de sincronización:",
                error
            );

        } finally {

            sincronizando = false;

            try {
                await estado();
            } catch (error) {
                console.warn(
                    "Empresa: error al actualizar estado:",
                    error
                );
            }
        }

    })();

    const tarea = promesaSincronizacionEmpresa;

    return tarea.finally(() => {

        if (promesaSincronizacionEmpresa === tarea) {
            promesaSincronizacionEmpresa = null;
        }
    });
}

// ==========================================================
// INICIALIZACIÓN
// ==========================================================

async function iniciar() {

    crearBotonDiagnosticoEmpresa();

    // Mientras Empresa esté abierta, revisar periódicamente
    // si hay registros pendientes y conexión disponible.
    setInterval(async () => {

        if (
            !navigator.onLine ||
            !identidad ||
            sincronizando ||
            document.visibilityState !== "visible"
        ) {
            return;
        }

        try {

            const pendientes = await enviosPendientesEmpresa();

            if (pendientes.length > 0) {
                await sincronizar();
            }

        } catch (error) {

            ultimoErrorSincronizacionEmpresa =
                String(error.message || error);

            console.error(
                "Empresa: reintento automático:",
                error
            );
        }

    }, 30000);
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
    ["receptor", "observaciones"].forEach(id => {
    $(id).addEventListener("input", () => {
            const campo = $(id);
            const inicio = campo.selectionStart;
            const fin = campo.selectionEnd;
            campo.value = campo.value.toLocaleUpperCase("es-CL");
            if (inicio !== null && fin !== null) {campo.setSelectionRange(inicio, fin);}
        });
    });

    window.addEventListener("online", async () => {
        estado();
        await sincronizar();
        if ($("servicio").value && !seleccion && !enviando) {await cargarAsignaciones();}
    });

    window.addEventListener("offline", estado);

    document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {await sincronizar();}});
    window.addEventListener("focus", async () => {await sincronizar();});
    window.addEventListener("pageshow", async () => {await sincronizar();});

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            posicion => gps = `${posicion.coords.latitude},${posicion.coords.longitude}`,
            () => {},
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 12000 }
        );
    } try {
        let perfilDisponible = false;

        try {
            const perfil = await consultar("perfilUsuario");

            identidad = String(perfil.email || perfil.emailAccess || "").trim().toLowerCase();
            operario = String(perfil.operario || "").trim();
            if (!identidad || !operario) {throw Error("El perfil no devolvió correo y operario.");}
            guardarIdentidadEmpresa(identidad, operario);
            perfilDisponible = true;

        } catch (error) {
            if (!recuperarIdentidadEmpresa()) {throw Error("No existe un perfil guardado. Ingrese una vez con conexión para habilitar el modo offline.");}
            console.warn("Empresa: utilizando identidad guardada.",error);
        }

        perfilCargado = true;
        firmaPad = new SignaturePad($("firma"));
        await migrarColaEmpresaAnterior();
        await cargarServicios();

        // Sincronización automática, sin bloquear la pantalla.
        void sincronizar();

        // Precarga todas las asignaciones para mantenerlas disponibles sin internet.
        if (navigator.onLine) {
            const serviciosPrecarga = [...$("servicio").options]
                .map(opcion => opcion.value)
                .filter(Boolean);

            // Se ejecuta aparte para no bloquear ni modificar
            // la selección que esté utilizando el operario.
            void (async () => {
                for (const servicioPrecarga of serviciosPrecarga) {
                    try {
                        const datos = await consultar(
                            "asignacionesEmpresaTerreno",
                            { servicio: servicioPrecarga }
                        );

                        if (Array.isArray(datos.servicios)) {
                            guardar(
                                clave(`asignaciones_${normalizar(servicioPrecarga)}`),
                                datos.servicios
                            );
                        }
                    } catch (error) {
                        console.warn(
                            "Empresa: no se pudo precargar:",
                            servicioPrecarga,
                            error
                        );
                    }
                }
            })();
        }

        mensaje("");
    } catch (error) {
        mensaje(`No fue posible iniciar Empresa: ${error.message}`);
        $("servicio").disabled = true;
    }

    estado();
}

window.addEventListener("DOMContentLoaded", iniciar);
