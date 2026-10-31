"use strict";


// ==========================================================
// OXITRACK
// REGISTRO EMPRESAS - OFICINA
// MARCHA BLANCA FRONTEND
// ==========================================================


// ==========================================================
// MODO DE PRUEBA
// SE ELIMINA AL CONECTAR CLIENTES CON EL BACKEND
// ==========================================================

const MARCHA_BLANCA_EMPRESA = false;


// ==========================================================
// ESTADO
// ==========================================================

let empresaSeleccionada = null;
let servicioEmpresaActual = "";
let destinoServicioEmpresa = "";
let llevaFleteEmpresa = "";
let solicitudIdEmpresa = "";


// ==========================================================
// DOM
// ==========================================================

const formRegistroEmpresa = document.getElementById("formRegistroEmpresa");
const selectServicioEmpresa = document.getElementById("selectServicioEmpresa");
const seccionGestionEmpresa = document.getElementById("seccionGestionEmpresa");
const seccionEmpresa = document.getElementById("seccionEmpresa");
const inputRutEmpresa = document.getElementById("inputRutEmpresa");
const btnBuscarEmpresa = document.getElementById("btnBuscarEmpresa");
const mensajeBusquedaEmpresa = document.getElementById("mensajeBusquedaEmpresa");
const resultadosBusquedaEmpresa = document.getElementById("resultadosBusquedaEmpresa");
const seccionEmpresaSeleccionada = document.getElementById("seccionEmpresaSeleccionada");
const empresaNombre = document.getElementById("empresaNombre");
const empresaRut = document.getElementById("empresaRut");
const seccionModalidadMixta = document.getElementById("seccionModalidadMixta");
const btnDestinoEmpresa = document.getElementById("btnDestinoEmpresa");
const btnDestinoPaciente = document.getElementById("btnDestinoPaciente");
const seccionPacienteEmpresa = document.getElementById("seccionPacienteEmpresa");
const inputPacienteEmpresa = document.getElementById("inputPacienteEmpresa");
const inputDireccionPacienteEmpresa = document.getElementById("inputDireccionPacienteEmpresa");
const selectComunaPacienteEmpresa = document.getElementById("selectComunaPacienteEmpresa");
const seccionDireccionAlternativaEmpresa = document.getElementById("seccionDireccionAlternativaEmpresa");
const checkOtraDireccionEmpresa = document.getElementById("checkOtraDireccionEmpresa");
const camposOtraDireccionEmpresa = document.getElementById("camposOtraDireccionEmpresa");
const inputOtraDireccionEmpresa = document.getElementById("inputOtraDireccionEmpresa");
const selectOtraComunaEmpresa = document.getElementById("selectOtraComunaEmpresa");

function reiniciarDireccionAlternativaEmpresa() {
    checkOtraDireccionEmpresa.checked = false;
    inputOtraDireccionEmpresa.value = "";
    selectOtraComunaEmpresa.value = "";
    camposOtraDireccionEmpresa.hidden = true;
    seccionDireccionAlternativaEmpresa.hidden = true;
}

function actualizarDireccionAlternativaEmpresa() {
    // Disponible tanto para EMPRESA como para PACIENTE.
    const disponible = !!empresaSeleccionada && ["EMPRESA", "PACIENTE"].includes(destinoServicioEmpresa);
    seccionDireccionAlternativaEmpresa.hidden = !disponible;
    if (!disponible) {checkOtraDireccionEmpresa.checked = false; camposOtraDireccionEmpresa.hidden = true;}
}

function cargarComunasAlternativasEmpresa() {
    selectOtraComunaEmpresa.innerHTML = '<option value="">Seleccione una comuna</option>';

    // Reutiliza el catálogo que ya cargó Oficina Empresa.
    Array.from(selectComunaPacienteEmpresa.options).forEach(function(opcion) {
        if (!opcion.value || opcion.disabled) return;

        const copia = document.createElement("option");
        copia.value = opcion.value;
        copia.textContent = opcion.textContent; 
        selectOtraComunaEmpresa.appendChild(copia);
    });
}

checkOtraDireccionEmpresa.addEventListener("change", function() {
    camposOtraDireccionEmpresa.hidden = !this.checked;

    if (this.checked) {
        cargarComunasAlternativasEmpresa();
        inputOtraDireccionEmpresa.focus();
    } else {
        inputOtraDireccionEmpresa.value = "";
        selectOtraComunaEmpresa.value = "";
    }
});

inputOtraDireccionEmpresa.addEventListener("input", function() {
    this.value = this.value.toUpperCase();
});

function obtenerDestinoFinalEmpresa() {
    const esPaciente = destinoServicioEmpresa === "PACIENTE";

    if (checkOtraDireccionEmpresa.checked) {
        const direccion = inputOtraDireccionEmpresa.value.trim().toUpperCase();
        const comuna = selectOtraComunaEmpresa.value.trim().toUpperCase();

        if (!direccion || !comuna) {
            throw new Error(
                "Complete la dirección y comuna alternativa del servicio."
            );
        }

        return { direccion, comuna, alternativa: true };
    }

    return {
        direccion: esPaciente
            ? inputDireccionPacienteEmpresa.value.trim()
            : empresaSeleccionada.direccion,
        comuna: esPaciente
            ? selectComunaPacienteEmpresa.value
            : empresaSeleccionada.comuna,
        alternativa: false
    };
}

const seccionDireccionEmpresa = document.getElementById("seccionDireccionEmpresa");
const empresaDireccion = document.getElementById("empresaDireccion");
const empresaComuna = document.getElementById("empresaComuna");
const seccionDetalleEmpresa = document.getElementById("seccionDetalleEmpresa");
const contenedorProductosEmpresa = document.getElementById("contenedorProductosEmpresa");
const seccionTipoImplementacionEmpresa = document.getElementById("seccionTipoImplementacionEmpresa");
const selectTipoImplementacionEmpresa = document.getElementById("selectTipoImplementacionEmpresa");
const seccionProgramacionEmpresa = document.getElementById("seccionProgramacionEmpresa");
const inputFechaEmpresa = document.getElementById("inputFechaEmpresa");
const selectOperarioEmpresa = document.getElementById("selectOperarioEmpresa");
const selectVentanaEmpresa = document.getElementById("selectVentanaEmpresa");
const seccionFleteEmpresa = document.getElementById("seccionFleteEmpresa");
const btnFleteSiEmpresa = document.getElementById("btnFleteSiEmpresa");
const btnFleteNoEmpresa = document.getElementById("btnFleteNoEmpresa");
const seccionObservacionesEmpresa = document.getElementById("seccionObservacionesEmpresa");
const inputObservacionesEmpresa = document.getElementById("inputObservacionesEmpresa");
const seccionBotonEmpresa = document.getElementById("seccionBotonEmpresa");
const mensajeEmpresa = document.getElementById("mensajeEmpresa");
const modalConfirmacionEmpresa = document.getElementById("modalConfirmacionEmpresa");
const resumenConfirmacionEmpresa = document.getElementById("resumenConfirmacionEmpresa");
const btnVolverConfirmacionEmpresa = document.getElementById("btnVolverConfirmacionEmpresa");
const btnConfirmarEmpresa = document.getElementById("btnConfirmarEmpresa");
const modalExitoEmpresa = document.getElementById("modalExitoEmpresa");
const btnNuevoServicioEmpresa = document.getElementById("btnNuevoServicioEmpresa");
const btnReagendarEmpresa = document.getElementById("btnReagendarEmpresa");
const btnCancelarEmpresa = document.getElementById("btnCancelarEmpresa");

// ==========================================================
// GESTIÓN SERVICIO EMPRESA
// REAGENDAR / CANCELAR
// ==========================================================

const modalGestionServicioEmpresa = document.getElementById("modalGestionServicioEmpresa");
const tituloGestionServicioEmpresa = document.getElementById("tituloGestionServicioEmpresa");
const inputBuscarGestionEmpresa = document.getElementById("inputBuscarGestionEmpresa");
const resultadosGestionServicioEmpresa = document.getElementById("resultadosGestionServicioEmpresa");
const detalleGestionServicioEmpresa = document.getElementById("detalleGestionServicioEmpresa");
const resumenGestionServicioEmpresa = document.getElementById("resumenGestionServicioEmpresa");
const nuevaProgramacionGestionEmpresa = document.getElementById("nuevaProgramacionGestionEmpresa");
const inputNuevaFechaGestionEmpresa = document.getElementById("inputNuevaFechaGestionEmpresa");
const selectNuevoOperarioGestionEmpresa = document.getElementById("selectNuevoOperarioGestionEmpresa");
const selectNuevaVentanaGestionEmpresa = document.getElementById("selectNuevaVentanaGestionEmpresa");
const btnAtencionInmediataGestionEmpresa = document.getElementById("btnAtencionInmediataGestionEmpresa");
const inputAtencionInmediataGestionEmpresa = document.getElementById("inputAtencionInmediataGestionEmpresa");
const btnCerrarGestionServicioEmpresa = document.getElementById("btnCerrarGestionServicioEmpresa");
const btnCerrarGestionSinSeleccionEmpresa = document.getElementById("btnCerrarGestionSinSeleccionEmpresa");
const btnConfirmarGestionServicioEmpresa = document.getElementById("btnConfirmarGestionServicioEmpresa");
const accionesCerrarGestionEmpresa = document.getElementById("accionesCerrarGestionEmpresa");

let tipoGestionActualEmpresa = "";
let servicioGestionSeleccionadoEmpresa = null;
let solicitudGestionIdEmpresa = "";
let temporizadorBusquedaGestionEmpresa = null;
// ==========================================================
// DETALLE DEL PEDIDO EN REAGENDAMIENTO EMPRESA
// ==========================================================

let detalleOriginalGestionEmpresa = "";
let detalleEditableGestionEmpresa = [];
let detalleGestionModificadoEmpresa = false;

let productosAutorizadosGestionEmpresa = [];

async function cargarProductosGestionEmpresa(servicio) {

    productosAutorizadosGestionEmpresa = [];
    const rut = String(servicio.rut || "").trim();
    if (!rut) {throw new Error("No se encontró el RUT de la empresa del servicio.");}
    const respuesta = await fetch("/api/oxitrack/?modo=buscarEmpresaRegistro&rut=" +
        encodeURIComponent(rut),{method: "GET",headers: { Accept: "application/json" },cache: "no-store"});
    const datos = await respuesta.json();
    if (!respuesta.ok || datos.ok !== true || !datos.empresa) {throw new Error(datos.error || "No fue posible consultar la empresa.");}
    const normalizarRut = valor => String(valor || "").replace(/[^0-9kK]/g, "").toUpperCase();
    if (normalizarRut(datos.empresa.rut) !== normalizarRut(rut)) {throw new Error("La consulta devolvió una empresa diferente.");}
    if (String(datos.empresa.estado || "").trim().toUpperCase() !== "ACTIVO") {throw new Error("La empresa no está activa.");}
    productosAutorizadosGestionEmpresa =filtrarProductosPorServicio(parsearProductosEmpresa(datos.empresa.productos),normalizarTextoEmpresa(servicio.servicio || ""));
    return productosAutorizadosGestionEmpresa;
}

// ==========================================================
// DIRECCIÓN Y FLETE DEL REAGENDAMIENTO EMPRESA
// ==========================================================

const panelDestinoGestionEmpresa = document.createElement("div");

panelDestinoGestionEmpresa.id = "panelDestinoGestionEmpresa";
panelDestinoGestionEmpresa.className = "form-seccion";
panelDestinoGestionEmpresa.style.cssText =
    "margin:16px 0;padding:0;border:none;" +
    "border-radius:0;background:transparent;box-shadow:none;";

panelDestinoGestionEmpresa.innerHTML = `
   
    <div class="campo-direccion-check">
        <label for="checkDireccionGestionEmpresa"
            style="display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;width:100%!important;margin:0!important;font-size:14px!important;font-weight:400!important;text-align:left!important;">
            <input type="checkbox"
                id="checkDireccionGestionEmpresa"
                style="display:inline-block!important;position:static!important;appearance:checkbox!important;-webkit-appearance:checkbox!important;flex:0 0 16px!important;width:16px!important;min-width:16px!important;max-width:16px!important;height:16px!important;min-height:16px!important;max-height:16px!important;margin:0!important;padding:0!important;accent-color:#611e63;">
            <span style="display:inline!important;flex:1 1 auto!important;min-width:0!important;font-size:14px!important;font-weight:400!important;">
                Realizar este servicio en otra dirección
            </span>
        </label>
    </div>


    <div id="camposDireccionGestionEmpresa" hidden>

        <div class="campo">
            <label for="direccionGestionEmpresa">
                Nueva dirección
            </label>

            <input
                type="text"
                id="direccionGestionEmpresa"
                maxlength="200"
                placeholder="Calle, número, departamento..."
            >
        </div>

        <div class="campo">
            <label for="comunaGestionEmpresa">
                Nueva comuna
            </label>

            <select id="comunaGestionEmpresa">
                <option value="">Seleccione una comuna</option>
            </select>
        </div>

    </div>

    <h2 style="margin-top:22px;">Flete</h2>
    <div class="campo">
        <label>¿Este reagendamiento lleva nuevo flete?</label>

        <div class="selector-tipo-paciente">
            <button type="button"
                    id="btnFleteSiGestionEmpresa"
                    class="btn-selector">
                Sí
            </button>

            <button type="button"
                    id="btnFleteNoGestionEmpresa"
                    class="btn-selector">
                No
            </button>
        </div>

        <input type="hidden"
               id="fleteGestionEmpresa"
               value="NO">
    </div>
`;

const checkDireccionGestionEmpresa =panelDestinoGestionEmpresa.querySelector("#checkDireccionGestionEmpresa");
const camposDireccionGestionEmpresa =panelDestinoGestionEmpresa.querySelector("#camposDireccionGestionEmpresa");
const direccionGestionEmpresa =panelDestinoGestionEmpresa.querySelector("#direccionGestionEmpresa");
const comunaGestionEmpresa =panelDestinoGestionEmpresa.querySelector("#comunaGestionEmpresa");
const fleteGestionEmpresa =panelDestinoGestionEmpresa.querySelector("#fleteGestionEmpresa");
const btnFleteSiGestionEmpresa = panelDestinoGestionEmpresa.querySelector("#btnFleteSiGestionEmpresa");
const btnFleteNoGestionEmpresa = panelDestinoGestionEmpresa.querySelector("#btnFleteNoGestionEmpresa");
function seleccionarFleteGestionEmpresa(valor) {
    fleteGestionEmpresa.value = valor;
    btnFleteSiGestionEmpresa.classList.toggle("activo", valor === "SI");
    btnFleteNoGestionEmpresa.classList.toggle("activo", valor === "NO");
}
btnFleteSiGestionEmpresa.addEventListener("click", function() {seleccionarFleteGestionEmpresa("SI");});
btnFleteNoGestionEmpresa.addEventListener("click", function() {seleccionarFleteGestionEmpresa("NO");});
checkDireccionGestionEmpresa.addEventListener("change", function () {
    camposDireccionGestionEmpresa.hidden = !this.checked;
    if (!this.checked) {direccionGestionEmpresa.value = "";comunaGestionEmpresa.value = "";}
});
direccionGestionEmpresa.addEventListener("input", function () {this.value = this.value.toLocaleUpperCase("es-CL");});

function prepararDestinoGestionEmpresa(servicio) {
    checkDireccionGestionEmpresa.checked = false;
    camposDireccionGestionEmpresa.hidden = true;
    direccionGestionEmpresa.value = "";
    seleccionarFleteGestionEmpresa("NO");
    comunaGestionEmpresa.replaceChildren();
    const inicial = document.createElement("option");
    inicial.value = "";
    inicial.textContent = "Seleccione una comuna";
    comunaGestionEmpresa.appendChild(inicial);

    Array.from(selectComunaPacienteEmpresa.options).forEach(function (opcion) {
        if (opcion.value && !opcion.disabled) {comunaGestionEmpresa.appendChild(opcion.cloneNode(true));}
    });
}

const observacionesReagendarEmpresa = document.createElement("div");
observacionesReagendarEmpresa.className = "campo";
observacionesReagendarEmpresa.innerHTML = `
    <label for="inputObservacionesReagendarEmpresa">
        Observaciones del reagendamiento
    </label>
    <textarea
        id="inputObservacionesReagendarEmpresa"
        rows="4"
        maxlength="2000"
        placeholder="Ingrese indicaciones adicionales para este servicio"
        style="width:100%;box-sizing:border-box;min-height:100px;"
    ></textarea>
`;

// BLOQUE INDEPENDIENTE PARA LA DIRECCIÓN DEL REAGENDAMIENTO
const panelDireccionGestionEmpresa = document.createElement("div");
panelDireccionGestionEmpresa.id = "panelDireccionGestionEmpresa";
panelDireccionGestionEmpresa.className = "form-seccion";
panelDireccionGestionEmpresa.style.cssText = "margin:16px 0;padding:0;border:none;" + "border-radius:0;background:transparent;box-shadow:none;";

// Mover los controles existentes, conservando sus eventos.
panelDireccionGestionEmpresa.append(panelDestinoGestionEmpresa.querySelector(".campo-direccion-check"),camposDireccionGestionEmpresa);
const panelPedidoGestionEmpresa = document.createElement("div");
// Estilos compactos del pedido de reagendamiento Empresa.
const estiloPedidoGestionEmpresa = document.createElement("style");

estiloPedidoGestionEmpresa.textContent = `
    #panelPedidoGestionEmpresa .ox-pedido-fila {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        min-width: 0;
    }

    #panelPedidoGestionEmpresa .ox-pedido-descripcion {
        flex: 1 1 auto;
        min-width: 0;
        font-size: 14px !important;
        font-weight: 400 !important;
        line-height: 1.3;
        overflow-wrap: anywhere;
    }

    #panelPedidoGestionEmpresa .ox-pedido-controles {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 8px;
    }
`;

document.head.appendChild(estiloPedidoGestionEmpresa);
panelPedidoGestionEmpresa.id = "panelPedidoGestionEmpresa";
panelPedidoGestionEmpresa.className = "ox-pedido-panel";

function normalizarDetalleGestionEmpresa(servicio) {

    const original = String(servicio.detalleSolicitado || "").trim();
    if (!original) {return [];}
    let datos;
    try {datos = JSON.parse(original);
    } catch (_) {
        // Algunas implementaciones antiguas guardan
        // su tipo como texto y no como arreglo JSON.
        return [{elemento: original,cantidad: 1,formato: "TEXTO"}];
    }

    if (!Array.isArray(datos)) {throw new Error("El pedido original tiene un formato no compatible.");}
    return datos.map(function(item) {

        const cantidad = Number(item.cantidad);

        if (!Number.isSafeInteger(cantidad) || cantidad < 0) {throw new Error("El pedido original contiene cantidades inválidas.");}
        return {...item,cantidad: cantidad};
    });
}

function pintarPedidoGestionEmpresa(servicio) {

    detalleOriginalGestionEmpresa = String(servicio.detalleSolicitado || "").trim();
    detalleEditableGestionEmpresa = normalizarDetalleGestionEmpresa(servicio);
    detalleGestionModificadoEmpresa = false;
    panelPedidoGestionEmpresa.replaceChildren();
    const titulo = document.createElement("h2");
    titulo.textContent = "Pedido agendado";
    titulo.className = "ox-pedido-titulo";
    panelPedidoGestionEmpresa.appendChild(titulo);

    if (!detalleEditableGestionEmpresa.length) {
        const aviso = document.createElement("p");
        aviso.textContent =
            "Este servicio no tiene elementos detallados en el pedido original.";
        panelPedidoGestionEmpresa.appendChild(aviso);
    }

    detalleEditableGestionEmpresa.forEach(function(item, indice) {

        const fila = document.createElement("div");
        fila.className = "ox-pedido-fila";

        const descripcion = document.createElement("span");
        descripcion.className = "ox-pedido-descripcion";

        descripcion.textContent =
            item.tipoImplementacion ||
            item.elemento ||
            [item.gas, item.medida].filter(Boolean).join(" - ") ||
            item.nombre ||
            "Elemento";

        const controles = document.createElement("div");
        controles.className = "ox-pedido-controles";

        const menos = document.createElement("button");
        menos.type = "button";
        menos.className = "ox-pedido-boton";
        menos.textContent = "−";
        menos.setAttribute("aria-label", "Disminuir cantidad");

        const cantidad = document.createElement("strong");
        cantidad.className = "ox-pedido-cantidad";
        cantidad.textContent = String(item.cantidad);

        const mas = document.createElement("button");
        mas.type = "button";
        mas.className = "ox-pedido-boton";
        mas.textContent = "+";
        mas.setAttribute("aria-label", "Aumentar cantidad");

        function cambiarCantidad(diferencia) {
            const nuevaCantidad =
                detalleEditableGestionEmpresa[indice].cantidad +
                diferencia;

            if (nuevaCantidad < 0 || nuevaCantidad > 1000) return;

            detalleEditableGestionEmpresa[indice].cantidad =
                nuevaCantidad;

            cantidad.textContent = String(nuevaCantidad);
            detalleGestionModificadoEmpresa = true;
        }

        menos.addEventListener("click", function() {cambiarCantidad(-1);});
        mas.addEventListener("click", function() {cambiarCantidad(1);});
        controles.append(menos, cantidad, mas);
        fila.append(descripcion, controles);
                panelPedidoGestionEmpresa.appendChild(fila);
    });
    const tipoServicio = String(servicio.servicio || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    if (!tipoServicio.includes("RECARGA") && !tipoServicio.includes("IMPLEMENT")) {return;}
    const contenedorAgregar = document.createElement("div");
    contenedorAgregar.className = "campo";
    const etiqueta = document.createElement("label");
    etiqueta.textContent = tipoServicio.includes("IMPLEMENT") ? "Agregar tipo de implementación" : "Agregar gas y medida autorizados";
    const selector = document.createElement("select");
    const inicial = document.createElement("option");
    inicial.value = "";
    inicial.textContent = "Seleccione una opción";
    selector.appendChild(inicial);

    if (tipoServicio.includes("RECARGA")) {

        productosAutorizadosGestionEmpresa.forEach(producto => {
            producto.medidas.forEach(medida => {
                const opcion = document.createElement("option");
                opcion.value = JSON.stringify({ gas: producto.gas, medida: medida});
                opcion.textContent = producto.gas + " — " + medida;
                selector.appendChild(opcion);
            });
        });

    } else {

        Array.from(selectTipoImplementacionEmpresa.options)
            .filter(opcion => opcion.value && !opcion.disabled)
            .forEach(opcion => {
                const nueva = document.createElement("option");
                nueva.value = JSON.stringify({tipoImplementacion: opcion.value});
                nueva.textContent = opcion.textContent;
                selector.appendChild(nueva);});
    }

    selector.addEventListener("change", function() {

        if (!this.value) return;
        const nuevo = JSON.parse(this.value);
        const existente = detalleEditableGestionEmpresa.find(item => {
            if (nuevo.tipoImplementacion) {return item.tipoImplementacion === nuevo.tipoImplementacion;}
            return item.gas === nuevo.gas && item.medida === nuevo.medida;});
        if (existente) {("El elemento ya está incluido. Modifique su cantidad con + y −.");this.value = "";return;}
        detalleEditableGestionEmpresa.push({...nuevo,cantidad: 1});
        const pedidoActualizado = detalleEditableGestionEmpresa.map(item => ({ ...item }));
        pintarPedidoGestionEmpresa({...servicio,detalleSolicitado: JSON.stringify(pedidoActualizado)});
        detalleGestionModificadoEmpresa = true;});
    contenedorAgregar.append(etiqueta, selector);
    panelPedidoGestionEmpresa.appendChild(contenedorAgregar);

}

function obtenerPedidoReagendadoEmpresa() {

    if (!detalleGestionModificadoEmpresa) {return { modificar: "NO", detalle: "" };}
    const pedidoFinal = detalleEditableGestionEmpresa.filter(item => Number(item.cantidad) > 0).map(item => ({ ...item }));
    if (!pedidoFinal.length) {throw new Error("Debe mantener o agregar al menos un elemento con cantidad mayor que cero.");}
    if (pedidoFinal.some(item => item.formato === "TEXTO")) {throw new Error("El pedido original tiene un formato antiguo que no admite modificación directa.");}
    return {modificar: "SI",detalle: JSON.stringify(pedidoFinal)};

}

function configurarMayusculasEmpresa() {
    const campos = [
        inputPacienteEmpresa,
        inputDireccionPacienteEmpresa,
        inputObservacionesEmpresa
    ];

    campos.forEach(function(campo) {
        if (!campo) return;

        campo.style.textTransform = "uppercase";

        campo.addEventListener("input", function() {
            const inicio = campo.selectionStart;
            const fin = campo.selectionEnd;

            campo.value = campo.value.toLocaleUpperCase("es-CL");

            if (inicio !== null && fin !== null) {
                campo.setSelectionRange(inicio, fin);
            }
        });
    });
}

// ==========================================================
// INICIO
// ========================================================== 
document.addEventListener("DOMContentLoaded",inicializarRegistroEmpresa);

async function inicializarRegistroEmpresa() {

    seccionDireccionAlternativaEmpresa.before(seccionProgramacionEmpresa);
    const hoy = obtenerFechaLocalEmpresa();
    configurarMayusculasEmpresa();

    inputFechaEmpresa.min = hoy;
    inputFechaEmpresa.value = hoy;

    await Promise.all([
        cargarServiciosEmpresa(),
        cargarOperariosEmpresa(),
        cargarComunasEmpresa()
    ]);

}

// ==========================================================
// SERVICIOS EMPRESA
// CATÁLOGO DESDE BACKEND
// ==========================================================

async function cargarServiciosEmpresa() {

    selectServicioEmpresa.disabled = true;

    selectServicioEmpresa.innerHTML = `
        <option value="">
            Cargando servicios...
        </option>
    `;

    try {

        const respuesta = await fetch(
            "/api/oxitrack/?modo=serviciosEmpresa",
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            }
        );

        const datos = await respuesta.json();

        if (
            !respuesta.ok ||
            datos.ok !== true ||
            !Array.isArray(datos.servicios)
        ) {

            throw new Error(
                datos.error ||
                "No fue posible cargar los servicios."
            );

        }

        selectServicioEmpresa.innerHTML = `
            <option value="">
                Seleccione un servicio
            </option>
        `;

        const servicios = [
            ...new Set(
                datos.servicios
                    .map(function (servicio) {
                        return String(servicio || "").trim();
                    })
                    .filter(Boolean)
            )
        ];

        servicios.forEach(function (servicio) {

            const option =
                document.createElement("option");

            option.value = servicio;
            option.textContent = servicio;

            selectServicioEmpresa.appendChild(
                option
            );

        });

        selectServicioEmpresa.disabled = false;

    } catch (error) {

        console.error(
            "Error cargando servicios Empresa:",
            error
        );

        selectServicioEmpresa.innerHTML = `
            <option value="">
                No fue posible cargar los servicios
            </option>
        `;

        selectServicioEmpresa.disabled = true;

    }

}


// ==========================================================
// SERVICIO
// ==========================================================

selectServicioEmpresa.addEventListener("change", function () {

        servicioEmpresaActual =
            normalizarTextoEmpresa(
                selectServicioEmpresa.value
            );

        reiniciarEmpresaSeleccionada();

        if (!servicioEmpresaActual) {

            ocultarEmpresa(seccionEmpresa);
            mostrarEmpresa(seccionGestionEmpresa);

            return;
        }

        // Si se eligió un servicio nuevo,
        // desaparecen las gestiones de servicios existentes.
        ocultarEmpresa(seccionGestionEmpresa);

        // Y comienza inmediatamente la búsqueda de empresa.
        mostrarEmpresa(seccionEmpresa);
    }
);

// ==========================================================
// BUSCAR EMPRESA
// ==========================================================

btnBuscarEmpresa.addEventListener(
    "click",
    buscarEmpresa
);


inputRutEmpresa.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();
            buscarEmpresa();

        }

    }
);


async function buscarEmpresa() {
  ocultarMensajeBusqueda();
  const buscar = inputRutEmpresa.value.trim();

  reiniciarEmpresaSeleccionada();
  inputRutEmpresa.value = buscar;
  solicitudIdEmpresa = "";
  resultadosBusquedaEmpresa.replaceChildren();
  resultadosBusquedaEmpresa.hidden = true;

  if (buscar.replace(/[^0-9kK]/g,"").length < 5) {
    mostrarMensajeBusqueda("Ingrese al menos 5 caracteres del RUT o teléfono.","error");
    return;
  }

  btnBuscarEmpresa.disabled = true;
  btnBuscarEmpresa.textContent = "Buscando empresa...";

  try {
    const respuesta = await fetch("/api/oxitrack/?modo=buscarCoincidenciasEmpresa&buscar=" + encodeURIComponent(buscar),{
      method:"GET",headers:{"Accept":"application/json"},cache:"no-store"
    });

    const datos = await respuesta.json();
    if (!respuesta.ok || datos.ok !== true) throw new Error(datos.error || "No fue posible buscar empresas.");

    const coincidencias = Array.isArray(datos.coincidencias) ? datos.coincidencias : [];
    if (!coincidencias.length) {
      mostrarMensajeBusqueda("No se encontraron empresas con ese RUT o teléfono.","error");
      return;
    }

    coincidencias.forEach(function(empresa) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "btn-selector";
      boton.style.cssText = "display:block;width:100%;margin:0 0 8px;text-align:left;white-space:normal;padding:12px;";
      boton.textContent = empresa.nombreCorto + " — " + empresa.rutCorto;
      boton.addEventListener("click",function() {seleccionarEmpresaEncontrada(empresa.id);});
      resultadosBusquedaEmpresa.appendChild(boton);
    });

    resultadosBusquedaEmpresa.hidden = false;
  } catch (error) {
    mostrarMensajeBusqueda(error.message || "No fue posible buscar empresas.","error");
    console.error("Error búsqueda Empresa:",error);
  } finally {
    btnBuscarEmpresa.disabled = false;
    btnBuscarEmpresa.textContent = "Buscar empresa";
  }
}

async function seleccionarEmpresaEncontrada(id) {
  resultadosBusquedaEmpresa.querySelectorAll("button").forEach(function(boton) {boton.disabled = true;});
  ocultarMensajeBusqueda();

  try {
    const respuesta = await fetch("/api/oxitrack/?modo=seleccionarEmpresaRegistro&id=" + encodeURIComponent(id),{
      method:"GET",headers:{"Accept":"application/json"},cache:"no-store"
    });

    const datos = await respuesta.json();
    if (!respuesta.ok || datos.ok !== true || !datos.empresa) {
      throw new Error(datos.error || "No fue posible seleccionar la empresa.");
    }

    const modalidad = normalizarTextoEmpresa(datos.empresa.modalidad);
    if (!["DIRECTO","INDIRECTO","MIXTO"].includes(modalidad)) {
      throw new Error("La empresa tiene una modalidad no reconocida: " + modalidad);
    }

    empresaSeleccionada = datos.empresa;
    resultadosBusquedaEmpresa.replaceChildren();
    resultadosBusquedaEmpresa.hidden = true;
    pintarEmpresaSeleccionada();
  } catch (error) {
    empresaSeleccionada = null;
    mostrarMensajeBusqueda(error.message || "No fue posible seleccionar la empresa.","error");
    resultadosBusquedaEmpresa.querySelectorAll("button").forEach(function(boton) {boton.disabled = false;});
  }
}

// ==========================================================
// PINTAR EMPRESA
// ==========================================================

function pintarEmpresaSeleccionada() {

    if (!empresaSeleccionada) return;

    empresaNombre.textContent = empresaSeleccionada.nombre || "-";
    empresaRut.textContent = ocultarRutEmpresa(empresaSeleccionada.rut);
    empresaDireccion.textContent = empresaSeleccionada.direccion || "-";
    empresaComuna.textContent = empresaSeleccionada.comuna || "-";
    mostrarEmpresa(seccionEmpresaSeleccionada);
    procesarModalidadEmpresa();
    pintarDetalleServicioEmpresa();
    mostrarEmpresa(seccionProgramacionEmpresa);
    if (servicioEmpresaActual === "RETIRO") {
        // Los retiros no generan flete.
        llevaFleteEmpresa = "NO";
        btnFleteSiEmpresa.classList.remove("activo");
        btnFleteNoEmpresa.classList.add("activo");
        ocultarEmpresa(seccionFleteEmpresa);
    } else {mostrarEmpresa(seccionFleteEmpresa);}
    mostrarEmpresa(seccionObservacionesEmpresa);
    mostrarEmpresa(seccionBotonEmpresa);

}


// ==========================================================
// MODALIDAD
// ==========================================================

function procesarModalidadEmpresa() {

    const modalidad = normalizarTextoEmpresa(empresaSeleccionada.modalidad);
    destinoServicioEmpresa = "";
    ocultarEmpresa(seccionModalidadMixta);
    ocultarEmpresa(seccionPacienteEmpresa);
    ocultarEmpresa(seccionDireccionEmpresa);
    limpiarBotonesDestino();
    actualizarDireccionAlternativaEmpresa();

    if (modalidad === "DIRECTO") {destinoServicioEmpresa = "EMPRESA";
        mostrarEmpresa(seccionDireccionEmpresa);
        actualizarDireccionAlternativaEmpresa();
        return;
    }

    if (modalidad === "INDIRECTO") {destinoServicioEmpresa = "PACIENTE";
        mostrarEmpresa(seccionPacienteEmpresa);
        actualizarDireccionAlternativaEmpresa();
        return;
    }

    if (modalidad === "MIXTO") {mostrarEmpresa(seccionModalidadMixta);}

}


// ==========================================================
// MIXTO
// ==========================================================

btnDestinoEmpresa.addEventListener("click",function () {
        destinoServicioEmpresa = "EMPRESA";
        btnDestinoEmpresa.classList.add("activo");
        btnDestinoPaciente.classList.remove("activo");
        ocultarEmpresa(seccionPacienteEmpresa);
        mostrarEmpresa(seccionDireccionEmpresa);
        actualizarDireccionAlternativaEmpresa();
    }
);


btnDestinoPaciente.addEventListener("click",function () {
        destinoServicioEmpresa = "PACIENTE";
        btnDestinoPaciente.classList.add("activo");
        btnDestinoEmpresa.classList.remove("activo");
        ocultarEmpresa(seccionDireccionEmpresa);
        mostrarEmpresa(seccionPacienteEmpresa);
        actualizarDireccionAlternativaEmpresa();
    }
);


// ==========================================================
// PRODUCTOS
// ==========================================================

function pintarDetalleServicioEmpresa() {

    contenedorProductosEmpresa.innerHTML = "";
    ocultarEmpresa(seccionTipoImplementacionEmpresa);
    const servicio = servicioEmpresaActual;

    // IMPLEMENTACIÓN
    // posteriormente TIPOS vendrá del catálogo real

    if (servicio.includes("IMPLEMENTACIÓN")) {
        mostrarEmpresa(seccionTipoImplementacionEmpresa);
        cargarTiposImplementacionPrueba();
        ocultarEmpresa(seccionDetalleEmpresa);
        return;
    }


    // RETIRO / VENTA / VISITA
    // La lógica específica se conectará después
    // según catálogo.

    if (servicio === "VENTA" || servicio === "VISITA TÉCNICA") {
        ocultarEmpresa(seccionDetalleEmpresa);
        return;
    }


    if (!servicio.includes("RECARGA") && servicio !== "RETIRO") {
        ocultarEmpresa(seccionDetalleEmpresa);
        return;
    }

    const productos = parsearProductosEmpresa(empresaSeleccionada.productos);
    const filtrados = filtrarProductosPorServicio(productos,servicio);

    if (!filtrados.length) {
        ocultarEmpresa(seccionDetalleEmpresa);
        mostrarMensajeGeneral(
            "La empresa no tiene productos habilitados para el servicio seleccionado.",
            "error"
        );
        return;
    }


    filtrados.forEach(
        function (producto) {

            crearGrupoProducto(
                producto
            );

        }
    );


    mostrarEmpresa(
        seccionDetalleEmpresa
    );

}


// ==========================================================
// PARSEAR PRODUCTOS
// ==========================================================

function parsearProductosEmpresa(texto) {

    return String(texto || "")
        .split("|")
        .map(function (bloque) {

            const partes =
                bloque.split(":");

            if (partes.length < 2) {
                return null;
            }

            const gas =
                normalizarTextoEmpresa(
                    partes.shift()
                );

            const medidas =
                partes
                    .join(":")
                    .split(",")
                    .map(function (medida) {

                        return normalizarTextoEmpresa(
                            medida
                        );

                    })
                    .filter(Boolean);

            if (
                !gas ||
                !medidas.length
            ) {
                return null;
            }

            return {
                gas,
                medidas
            };

        })
        .filter(Boolean);

}


// ==========================================================
// FILTRAR SEGÚN SERVICIO
// ==========================================================

function filtrarProductosPorServicio(
    productos,
    servicio
) {

    if (
        servicio === "RECARGA GASES"
    ) {

        return productos;

    }


    const gases = [
        "OXÍGENO",
        "NITRÓGENO",
        "AIRE"
    ];


    const gasServicio =
        gases.find(
            function (gas) {

                return servicio.includes(
                    gas
                );

            }
        );


    if (!gasServicio) {

        return productos;

    }


    return productos.filter(
        function (producto) {

            return (
                producto.gas ===
                gasServicio
            );

        }
    );

}


// ==========================================================
// CREAR CONTADORES
// ==========================================================

function crearGrupoProducto(producto) {

    const grupo = document.createElement("div");
    grupo.className = "grupo-producto-empresa";

    /*
     * NOMBRE DEL GAS
     * OXÍGENO / AIRE / NITRÓGENO / CO₂...
     */
    const titulo = document.createElement("h3");
    titulo.textContent = String(producto.gas || "").trim();

    /*
     * Dejamos el layout crítico directamente aquí.
     * Así no depende del CSS general de botones.
     */
    titulo.style.cssText = `
        display:block;
        width:100%;
        margin:0 0 10px 0;
        padding:0;
        color:#611e63;
        font-size:17px;
        font-weight:700;
        text-align:center;
    `;

    grupo.appendChild(titulo);

    /*
     * UNA FILA POR CADA MEDIDA
     *
     * 10M3     [-]   0   [+]
     * 0.7M3    [-]   0   [+]
     */
    producto.medidas.forEach(function (medida) {

        const fila = document.createElement("div");
        fila.className = "fila-producto-empresa";
        fila.dataset.gas = String(producto.gas || "").trim();
        fila.dataset.medida = String(medida || "").trim();

        /*
         * ESTE ES EL CAMBIO IMPORTANTE.
         *
         * La fila queda definida AQUÍ.
         * Ya no dependemos de que otro CSS
         * decida poner cada elemento debajo.
         */
        fila.style.cssText = `
            display:grid;
            grid-template-columns:minmax(80px, 1fr) 42px 42px 42px;
            grid-template-rows:42px;
            align-items:center;
            column-gap:8px;
            row-gap:0;
            width:100%;
            margin:0 0 10px 0;
            padding:0;
            box-sizing:border-box;
        `;


        // =====================================================
        // MEDIDA
        // =====================================================

        const nombre = document.createElement("span");
        nombre.className = "nombre-medida-empresa";
        nombre.textContent = String(medida || "").trim();
        nombre.style.cssText = `
            display:flex;
            align-items:center;
            width:auto;
            min-width:0;
            height:42px;
            margin:0;
            padding:0;
            font-size:16px;
            font-weight:700;
            color:#333333;
            text-align:left;
            box-sizing:border-box;
        `;


        // =====================================================
        // BOTÓN MENOS
        // =====================================================

        const menos = document.createElement("button");
        menos.type = "button";
        menos.className = "btn-contador-empresa";
        menos.textContent = "−";
        menos.style.cssText = `
            display:flex;
            align-items:center;
            justify-content:center;
            width:42px;
            min-width:42px;
            max-width:42px;
            height:42px;
            min-height:42px;
            max-height:42px;
            margin:0;
            padding:0;
            border:0;
            border-radius:8px;
            background:#611e63;
            color:#ffffff;
            font-size:22px;
            font-weight:700;
            line-height:1;
            cursor:pointer;
            box-sizing:border-box;
        `;

        // =====================================================
        // CONTADOR
        // =====================================================

        const cantidad = document.createElement("span");
        cantidad.className = "cantidad-producto-empresa";
        cantidad.textContent = "0";
        cantidad.dataset.cantidad = "0";
        cantidad.style.cssText = `
            display:flex;
            align-items:center;
            justify-content:center;
            width:42px;
            min-width:42px;
            max-width:42px;
            height:42px;
            min-height:42px;
            max-height:42px;
            margin:0;
            padding:0;
            color:#333333;
            font-size:18px;
            font-weight:700;
            text-align:center;
            box-sizing:border-box;
        `;

        // =====================================================
        // BOTÓN MÁS
        // =====================================================

        const mas = document.createElement("button");
        mas.type = "button";
        mas.className = "btn-contador-empresa";
        mas.textContent = "+";
        mas.style.cssText = `
            display:flex;
            align-items:center;
            justify-content:center;
            width:42px;
            min-width:42px;
            max-width:42px;
            height:42px;
            min-height:42px;
            max-height:42px;
            margin:0;
            padding:0;
            border:0;
            border-radius:8px;
            background:#611e63;
            color:#ffffff;
            font-size:22px;
            font-weight:700;
            line-height:1;
            cursor:pointer;
            box-sizing:border-box;
        `;

        // =====================================================
        // EVENTOS
        // =====================================================

        menos.addEventListener("click",function () {modificarCantidad(cantidad,-1);});
        mas.addEventListener("click",function () {modificarCantidad(cantidad,1);});

        /*
         * ORDEN EXACTO DE IZQUIERDA A DERECHA:
         *
         * MEDIDA | MENOS | CONTADOR | MÁS
         */
        fila.append(nombre,menos,cantidad,mas);

        if (servicioEmpresaActual === "RETIRO") {
            const eliminar = document.createElement("button");
            eliminar.type = "button";
            eliminar.title = "Quitar esta medida del retiro";
            eliminar.setAttribute("aria-label","Quitar " + producto.gas + " " + medida);
            eliminar.textContent = "🗑";
            eliminar.style.cssText =
                "width:34px;height:38px;border:0;" +
                "border-radius:8px;background:#963636;" +
                "color:white;cursor:pointer;font-size:17px;";
                        // Cinco columnas con dimensiones coherentes:
            // MEDIDA | MENOS | CANTIDAD | MÁS | PAPELERA
            fila.style.gridTemplateColumns =
                "minmax(0,1fr) 38px 32px 38px 34px";

            fila.style.columnGap = "8px";

            [menos, mas].forEach(function (boton) {
                boton.style.width = "38px";
                boton.style.minWidth = "38px";
                boton.style.maxWidth = "38px";
            });

            cantidad.style.width = "32px";
            cantidad.style.minWidth = "32px";
            cantidad.style.maxWidth = "32px";

            eliminar.style.width = "34px";
            eliminar.style.minWidth = "34px";
            eliminar.style.maxWidth = "34px";
            eliminar.style.padding = "0";
            eliminar.style.display = "flex";
            eliminar.style.alignItems = "center";
            eliminar.style.justifyContent = "center";
            eliminar.style.boxSizing = "border-box";
            eliminar.style.flexShrink = "0";

            eliminar.addEventListener("click", function () {
                fila.remove();
            });

            fila.appendChild(eliminar);
        }

        grupo.appendChild(fila);

    });
    contenedorProductosEmpresa.appendChild(grupo);
}

function modificarCantidad(elemento,cambio) {
    const actual =Number(elemento.dataset.cantidad || 0);
    const nuevo =Math.max( 0, actual + cambio);
    elemento.dataset.cantidad = String(nuevo);
    elemento.textContent = String(nuevo);
}


// ==========================================================
// DETALLE SOLICITADO
// SOLO INCLUYE CANTIDADES > 0
// ==========================================================

function obtenerDetalleSolicitado() {

    const filas =
        contenedorProductosEmpresa.querySelectorAll(
            ".fila-producto-empresa"
        );

    const detalle = [];


    filas.forEach(
        function (fila) {

            const cantidad =
                Number(
                    fila.querySelector(
                        ".cantidad-producto-empresa"
                    ).dataset.cantidad || 0
                );


            if (cantidad <= 0) {
                return;
            }


            detalle.push({

                gas:
                    fila.dataset.gas,

                medida:
                    fila.dataset.medida,

                cantidad:
                    cantidad

            });

        }
    );


    return detalle;

}


// ==========================================================
// FLETE
// ==========================================================

btnFleteSiEmpresa.addEventListener(
    "click",
    function () {

        llevaFleteEmpresa = "SI";

        btnFleteSiEmpresa.classList.add(
            "activo"
        );

        btnFleteNoEmpresa.classList.remove(
            "activo"
        );

    }
);


btnFleteNoEmpresa.addEventListener(
    "click",
    function () {

        llevaFleteEmpresa = "NO";

        btnFleteNoEmpresa.classList.add(
            "activo"
        );

        btnFleteSiEmpresa.classList.remove(
            "activo"
        );

    }
);


// ==========================================================
// OPERARIOS
// ENDPOINT REAL EXISTENTE
// ==========================================================

async function cargarOperariosEmpresa() {

    selectOperarioEmpresa.innerHTML =
        `<option value="">
            Seleccione un operario
        </option>`;


    try {

        const respuesta =
            await fetch(
                "/api/oxitrack/?modo=operariosRegistro",
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    },
                    cache: "no-store"
                }
            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            datos.ok !== true
        ) {

            throw new Error(
                datos.error ||
                "No fue posible obtener los operarios."
            );

        }


        const operarios =
            Array.isArray(datos.operarios)
                ? datos.operarios
                : [];


        operarios.forEach(
            function (operario) {

                const nombre =
                    String(
                        operario || ""
                    ).trim();

                if (!nombre) return;


                const opcion =
             document.createElement(
                        "option"
                    );

                opcion.value =
                    nombre;

                opcion.textContent =
                    nombre;

                selectOperarioEmpresa.appendChild(
                    opcion
                );

            }
        );


    } catch (error) {

        console.error(
            "Error operarios Empresa:",
            error
        );

        mostrarMensajeGeneral(
            "No fue posible cargar los operarios.",
            "error"
        );

    }

}

async function cargarComunasEmpresa() {
    selectComunaPacienteEmpresa.disabled = true;

    selectComunaPacienteEmpresa.innerHTML =
        '<option value="">Cargando comunas...</option>';

    try {
        const respuesta = await fetch(
            "/api/oxitrack/?modo=catalogoRegistro",
            {
                method: "GET",
                headers: { "Accept": "application/json" },
                cache: "no-store"
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok || datos.ok !== true ||
            !Array.isArray(datos.comunas)) {
            throw new Error(
                datos.error || "No fue posible cargar las comunas."
            );
        }

        selectComunaPacienteEmpresa.innerHTML =
            '<option value="">Seleccione una comuna</option>';

        datos.comunas.forEach(function (comuna) {
            const nombre = String(comuna || "").trim();
            if (!nombre) return;

            const opcion = document.createElement("option");
            opcion.value = nombre;
            opcion.textContent = nombre;

            selectComunaPacienteEmpresa.appendChild(opcion);
        });

        selectComunaPacienteEmpresa.disabled = false;

    } catch (error) {
        console.error("Error cargando comunas Empresa:", error);

        selectComunaPacienteEmpresa.innerHTML =
            '<option value="">No fue posible cargar las comunas</option>';

        mostrarMensajeGeneral(error.message, "error");
    }
}


// ==========================================================
// FECHA / OPERARIO
// ==========================================================

inputFechaEmpresa.addEventListener(
    "change",
    actualizarDisponibilidadEmpresa
);


selectOperarioEmpresa.addEventListener(
    "change",
    actualizarDisponibilidadEmpresa
);


// ==========================================================
// DISPONIBILIDAD
// ENDPOINT REAL EXISTENTE
// ==========================================================

async function actualizarDisponibilidadEmpresa() {

    const fecha =
        inputFechaEmpresa.value;

    const operario =
        selectOperarioEmpresa.value.trim();


    selectVentanaEmpresa.innerHTML =
        `<option value="">
            Seleccione un horario
        </option>`;


    if (
        !fecha ||
        !operario
    ) {

        selectVentanaEmpresa.disabled =
            true;

        return;

    }


    selectVentanaEmpresa.disabled =
        true;

    selectVentanaEmpresa.innerHTML =
        `<option value="">
            Consultando disponibilidad...
        </option>`;


    try {

        const respuesta =
            await fetch(

                "/api/oxitrack/" +
                "?modo=disponibilidadAgenda" +
                "&fechaProgramada=" +
                encodeURIComponent(fecha) +
                "&operarioAsignado=" +
                encodeURIComponent(operario),

                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    },
                    cache: "no-store"
                }

            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            datos.ok !== true
        ) {

            throw new Error(
                datos.error ||
                "No fue posible consultar la agenda."
            );

        }


        cargarVentanasEmpresa(
            datos.ventanasOcupadas
        );


        selectVentanaEmpresa.disabled =
            false;


    } catch (error) {

        console.error(
            "Error agenda Empresa:",
            error
        );


        selectVentanaEmpresa.innerHTML =
            `<option value="">
                No fue posible consultar
            </option>`;

    }

}


// ==========================================================
// VENTANAS
// ==========================================================

function cargarVentanasEmpresa( ventanasOcupadas = []) {

    selectVentanaEmpresa.innerHTML =
        `<option value="">
            Seleccione un horario
        </option>`;


    const ocupadas = new Set( Array.isArray(ventanasOcupadas) ? ventanasOcupadas : []);
    const hoy = obtenerFechaLocalEmpresa();
    const fecha = inputFechaEmpresa.value;
    const ahora = new Date();

    const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();

    for (let minutos = 0; minutos < 24 * 60; minutos += 30) {

        if (fecha === hoy && minutos < minutosActuales) {
            continue;
        }

        const inicio = convertirMinutosEmpresa(minutos);
        const fin = convertirMinutosEmpresa((minutos + 60) % (24 * 60));
        const ventana = `${inicio} - ${fin}`;
        const option = document.createElement("option");

        option.value = ventana;
        option.textContent = ventana;

        if (ocupadas.has(ventana)) {
            option.disabled = true;
        }

        selectVentanaEmpresa.appendChild(option);

    }

}

// ==========================================================
// SUBMIT
// ==========================================================

formRegistroEmpresa.addEventListener("submit", function (event) {

        event.preventDefault();
        ocultarMensajeGeneral();


        try {

            validarFormularioEmpresa();
            pintarResumenConfirmacion();
            mostrarEmpresa(modalConfirmacionEmpresa);

        } catch (error) {

            mostrarMensajeGeneral(error.message, "error");

        }

    }
);


// ==========================================================
// VALIDACIÓN
// ==========================================================

function validarFormularioEmpresa() {

    if (!servicioEmpresaActual) { throw new Error("Seleccione un servicio.");}
    if (!empresaSeleccionada) {throw new Error("Debe seleccionar una empresa.");}
    if (!destinoServicioEmpresa) {throw new Error("Debe indicar si el servicio corresponde a la empresa o a un paciente.");}
    if (destinoServicioEmpresa === "PACIENTE") {
        if (!inputPacienteEmpresa.value.trim()) throw new Error("Indique el paciente.");
        if (!checkOtraDireccionEmpresa.checked && (!inputDireccionPacienteEmpresa.value.trim() || !selectComunaPacienteEmpresa.value)) {
            throw new Error("Complete la dirección y comuna del paciente.");
        }
    }
    if ((servicioEmpresaActual.includes("RECARGA") || servicioEmpresaActual === "RETIRO") && !obtenerDetalleSolicitado().length) {
        throw new Error(servicioEmpresaActual === "RETIRO"
                ? "Debe seleccionar al menos un cilindro para retirar."
                : "Indique al menos una cantidad para la recarga."
        );
    }

    if (servicioEmpresaActual.includes("IMPLEMENTACIÓN") && !selectTipoImplementacionEmpresa.value) {throw new Error( "Seleccione el tipo de implementación.");}
    if (!inputFechaEmpresa.value || !selectOperarioEmpresa.value || !selectVentanaEmpresa.value) {throw new Error("Complete la programación del servicio.");}
        if (servicioEmpresaActual === "RETIRO") {
        llevaFleteEmpresa = "NO";
    } else if (!llevaFleteEmpresa) {throw new Error("Indique si el servicio contabiliza flete.");}
    obtenerDestinoFinalEmpresa();

}


// ==========================================================
// RESUMEN
// ==========================================================

function pintarResumenConfirmacion() {

    const detalle = obtenerDetalleSolicitado();
    const destinoFinal = obtenerDestinoFinalEmpresa();
    const direccion = destinoFinal.direccion;
    const comuna = destinoFinal.comuna;
    const paciente = destinoServicioEmpresa === "PACIENTE" ? inputPacienteEmpresa.value.trim() : "";
    let detalleTexto = detalle.map(function (item) {
            return (item.gas + " " + item.medida + " × " + item.cantidad);}).join("<br>");

    if (servicioEmpresaActual.includes("IMPLEMENTACIÓN")) {
        detalleTexto = selectTipoImplementacionEmpresa.value;
    }

    resumenConfirmacionEmpresa.innerHTML = `

        ${datoResumen("Servicio", servicioEmpresaActual)}
        ${datoResumen("Cliente", empresaSeleccionada.nombre)}
        ${paciente ? datoResumen( "Paciente", paciente) : ""}
        ${datoResumen( "Dirección", direccion)}
        ${datoResumen( "Comuna", comuna)}
        ${detalleTexto ? datoResumen( "Detalle", detalleTexto, true) : ""}
        ${datoResumen( "Fecha", inputFechaEmpresa.value)}
        ${datoResumen( "Ventana", selectVentanaEmpresa.value)}
        ${datoResumen( "Operario", selectOperarioEmpresa.value)}
        ${servicioEmpresaActual === "RETIRO" ? "" : datoResumen("Flete", llevaFleteEmpresa)}
    `;

}


// ==========================================================
// CONFIRMACIÓN
// ==========================================================

btnVolverConfirmacionEmpresa.addEventListener("click", function () {

        ocultarEmpresa(modalConfirmacionEmpresa);

    }
);


btnConfirmarEmpresa.addEventListener("click", async function () {

        if (btnConfirmarEmpresa.disabled) return;

        try { 
            
            validarFormularioEmpresa();

            if (!solicitudIdEmpresa) {solicitudIdEmpresa = generarIdSolicitudEmpresa();}
            const payload = construirPayloadEmpresa();
            btnConfirmarEmpresa.disabled = true;
            btnVolverConfirmacionEmpresa.disabled = true;
            btnConfirmarEmpresa.textContent = "Registrando...";
            const formData = new FormData();

            Object.entries(payload).forEach(function ([clave, valor]) {
                formData.append(clave, typeof valor === "object" ? JSON.stringify(valor) : String(valor ?? ""));
            });

            const respuesta = await fetch(
                "/api/oxitrack/",
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok || datos.ok !== true) {
                throw new Error(
                    datos.error ||
                    "No fue posible registrar el servicio."
                );
            }

            ocultarEmpresa(modalConfirmacionEmpresa);

            const titulo = modalExitoEmpresa.querySelector("h2");
            const parrafo = modalExitoEmpresa.querySelector("p");

            if (titulo) {
                titulo.textContent = "Servicio registrado";
            }

            if (parrafo) {
                parrafo.textContent =
                    "El servicio fue registrado exitosamente: " + datos.id;
            }

            mostrarEmpresa(modalExitoEmpresa);

        } catch (error) {

            console.error("Error registro Empresa:", error);

            mostrarMensajeGeneral(
                error.message || "Error al registrar el servicio.",
                "error"
            );

            ocultarEmpresa(modalConfirmacionEmpresa);

            // Se conserva solicitudIdEmpresa para un reintento seguro.

        } finally {

            btnConfirmarEmpresa.disabled = false;
            btnVolverConfirmacionEmpresa.disabled = false;
            btnConfirmarEmpresa.textContent = "Confirmar";
        }
    }
);


// ==========================================================
// CONSTRUIR PAYLOAD
// ==========================================================

function construirPayloadEmpresa() {

    const destinoFinal = obtenerDestinoFinalEmpresa();
    const esPaciente = destinoServicioEmpresa === "PACIENTE";

    return {

        tipoCliente: "REGISTRO_EMPRESA_OFICINA",
        solicitudId: solicitudIdEmpresa,
        clienteId: empresaSeleccionada.id,
        cliente: empresaSeleccionada.nombre,
        rut: empresaSeleccionada.rut,
        email: empresaSeleccionada.email,
        modalidadDestino: destinoServicioEmpresa,
        direccion: destinoFinal.direccion,
        comuna: destinoFinal.comuna,
        direccionAlternativa: destinoFinal.alternativa,
        paciente: esPaciente ? inputPacienteEmpresa.value.trim() : "",
        servicio: servicioEmpresaActual,
        tipo: servicioEmpresaActual.includes("IMPLEMENTACIÓN") ? selectTipoImplementacionEmpresa.value : "",
        detalleSolicitado: servicioEmpresaActual.includes("IMPLEMENTACIÓN") ? selectTipoImplementacionEmpresa.value : JSON.stringify(obtenerDetalleSolicitado()),
        estado: "PENDIENTE",
        fechaProgramada: inputFechaEmpresa.value,
        ventanaHoraria: selectVentanaEmpresa.value,
        operarioAsignado: selectOperarioEmpresa.value,
        observaciones: inputObservacionesEmpresa.value.trim(),
        llevaFlete: servicioEmpresaActual === "RETIRO" ? "NO" : llevaFleteEmpresa,
        sheet:"BLANCA"

    };

}


// ==========================================================
// NUEVO SERVICIO
// ==========================================================

btnNuevoServicioEmpresa.addEventListener("click", function () {

        ocultarEmpresa(modalExitoEmpresa);
        window.location.assign("./");

    }
);


// ==========================================================
// GESTIÓN DE SERVICIOS EMPRESA
// REAGENDAR / CANCELAR
// FUENTE MARCHA BLANCA: BLANCA
// ==========================================================

function abrirGestionServicioEmpresa(tipo) {

    tipoGestionActualEmpresa = tipo;

    servicioGestionSeleccionadoEmpresa = null;

    solicitudGestionIdEmpresa = "";

    inputBuscarGestionEmpresa.value = "";

    resultadosGestionServicioEmpresa.innerHTML = "";

    ocultarEmpresa(
        resultadosGestionServicioEmpresa
    );

    ocultarEmpresa(
        detalleGestionServicioEmpresa
    );

    ocultarEmpresa(
        nuevaProgramacionGestionEmpresa
    );

    mostrarEmpresa(
        accionesCerrarGestionEmpresa
    );


    tituloGestionServicioEmpresa.textContent =
        tipo === "REAGENDAR"
            ? "Reagendar servicio"
            : "Cancelar servicio";


    mostrarEmpresa(
        modalGestionServicioEmpresa
    );


    setTimeout(
        function () {

            inputBuscarGestionEmpresa.focus();

        },
        0
    );

}


// ==========================================================
// ABRIR REAGENDAR
// ==========================================================

btnReagendarEmpresa.addEventListener(
    "click",
    function () {

        abrirGestionServicioEmpresa(
            "REAGENDAR"
        );

    }
);


// ==========================================================
// ABRIR CANCELAR
// ==========================================================

btnCancelarEmpresa.addEventListener(
    "click",
    function () {

        abrirGestionServicioEmpresa(
            "CANCELAR"
        );

    }
);


// ==========================================================
// CERRAR MODAL
// ==========================================================

btnCerrarGestionServicioEmpresa.addEventListener(
    "click",
    function () {

        ocultarEmpresa(
            modalGestionServicioEmpresa
        );

    }
);


btnCerrarGestionSinSeleccionEmpresa.addEventListener(
    "click",
    function () {

        ocultarEmpresa(
            modalGestionServicioEmpresa
        );

    }
);


// ==========================================================
// BUSCADOR
// ==========================================================

inputBuscarGestionEmpresa.addEventListener(
    "input",
    function () {

        clearTimeout(
            temporizadorBusquedaGestionEmpresa
        );


        const buscar =
            inputBuscarGestionEmpresa
                .value
                .trim();


        if (
            buscar.length < 3
        ) {

            resultadosGestionServicioEmpresa.innerHTML =
                "";

            ocultarEmpresa(
                resultadosGestionServicioEmpresa
            );

            return;

        }


        temporizadorBusquedaGestionEmpresa =
            setTimeout(
                function () {

                    buscarServiciosGestionEmpresa(
                        buscar
                    );

                },
                350
            );

    }
);


// ==========================================================
// BUSCAR SERVICIOS PENDIENTES
// ==========================================================

async function buscarServiciosGestionEmpresa(buscar) {

    try {

        const respuesta = await fetch("/api/oxitrack/" +
                    "?modo=buscarServiciosPendientesOficina" +
                    "&ambito=EMPRESA" +
                    "&buscar=" +
                    encodeURIComponent(buscar),
                {
                    method: "GET",
                    headers: {"Accept": "application/json"},
                    cache: "no-store"
                }

            );

        const datos = await respuesta.json();
        if (!respuesta.ok || datos.ok !== true) {throw new Error(datos.error || "No fue posible buscar servicios.");}

        const servicios = Array.isArray(datos.servicios) ? datos.servicios : [];
        resultadosGestionServicioEmpresa.innerHTML ="";
        if (!servicios.length) {

            const item = document.createElement("div");
            item.className ="resultado-busqueda-item";
            item.textContent = "No se encontraron servicios pendientes.";
            resultadosGestionServicioEmpresa.appendChild(item);
            mostrarEmpresa(resultadosGestionServicioEmpresa);

            return;

        }


        servicios.forEach(function (servicio) {
                const item = document.createElement("div");
                item.className = "resultado-busqueda-item";
                const nombreMostrar = servicio.paciente || servicio.cliente || servicio.nombre || "";
                item.textContent = nombreMostrar + " | " + (servicio.servicio || "") + " | " +
                    formatearFechaGestionEmpresa(servicio.fechaProgramada) + " | " + (servicio.ventanaHoraria || "");
                item.addEventListener("click",function () {seleccionarServicioGestionEmpresa(servicio);});
                resultadosGestionServicioEmpresa.appendChild(item);
            }
        );


        mostrarEmpresa(resultadosGestionServicioEmpresa);

    } catch (error) {
        console.error("Error gestión Empresa:",error);
        mostrarMensajeGeneral(error.message || "No fue posible buscar servicios.","error");
    }

}


// ==========================================================
// SELECCIONAR SERVICIO
// ==========================================================

async function seleccionarServicioGestionEmpresa(servicio) {

    servicioGestionSeleccionadoEmpresa = servicio;
    solicitudGestionIdEmpresa = "";
    ocultarEmpresa(resultadosGestionServicioEmpresa);
    ocultarEmpresa(accionesCerrarGestionEmpresa);
    const cliente = servicio.cliente || servicio.nombre || "";
    const paciente = servicio.paciente || "";
    resumenGestionServicioEmpresa.innerHTML =

        datoResumen("ID",servicio.id || "") + datoResumen("Empresa",cliente) +
        (paciente ? datoResumen("Paciente", paciente) : "") +
        datoResumen("Servicio",servicio.servicio || "") +
        datoResumen("Dirección", servicio.direccion || "") +
        datoResumen("Comuna",servicio.comuna || "") +
        datoResumen("Fecha actual",formatearFechaGestionEmpresa(servicio.fechaProgramada)) +
        datoResumen("Programación actual",servicio.ventanaHoraria || "") +
        datoResumen("Operario actual", servicio.operarioAsignado || "");

    mostrarEmpresa(detalleGestionServicioEmpresa);
    panelPedidoGestionEmpresa.remove();

    // Mostrar programación y botones sin esperar el catálogo.
    if (tipoGestionActualEmpresa === "REAGENDAR") {
        mostrarEmpresa(nuevaProgramacionGestionEmpresa);

        inputAtencionInmediataGestionEmpresa.value = "NO";
        btnAtencionInmediataGestionEmpresa.classList.remove("activo");
        selectNuevaVentanaGestionEmpresa.disabled = false;
        const hoy = obtenerFechaLocalEmpresa();
        inputNuevaFechaGestionEmpresa.value = hoy;
        inputNuevaFechaGestionEmpresa.min = hoy;

        cargarOperariosGestionEmpresa(servicio.operarioAsignado);
        actualizarDisponibilidadGestionEmpresa();
        btnConfirmarGestionServicioEmpresa.textContent = "Confirmar reagendamiento";

        // Evitar confirmar mientras se comprueban productos.
        btnConfirmarGestionServicioEmpresa.disabled = true;
        btnConfirmarGestionServicioEmpresa.textContent = "Cargando pedido...";
        panelPedidoGestionEmpresa.replaceChildren();
        const aviso = document.createElement("p");
        aviso.textContent = "Consultando productos autorizados...";
        panelPedidoGestionEmpresa.appendChild(aviso);
    }

      if (tipoGestionActualEmpresa === "REAGENDAR") {

        const tipoServicio = String(servicio.servicio || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

        try {
            if (tipoServicio.includes("RECARGA")) {await cargarProductosGestionEmpresa(servicio);}
            if (tipoServicio.includes("IMPLEMENT")) {
                const respuestaCatalogo = await fetch("/api/oxitrack/?modo=catalogoRegistro",{ cache: "no-store" });
                const catalogo = await respuestaCatalogo.json();
                if (!respuestaCatalogo.ok || catalogo.ok !== true) {throw new Error("No se pudo cargar el catálogo de implementaciones.");}
                selectTipoImplementacionEmpresa.replaceChildren();
                const inicial = new Option("Seleccione un tipo", "");
                selectTipoImplementacionEmpresa.appendChild(inicial);
                (catalogo.tiposImplementacion || []).forEach(tipo => {
                    const valor = String(tipo || "").trim();
                    if (valor) {selectTipoImplementacionEmpresa.appendChild(new Option(valor, valor));}
                });
            }
            pintarPedidoGestionEmpresa(servicio);
        } catch (error) {mostrarMensajeGeneral(error.message || "No fue posible cargar los productos autorizados.","error");return;}
        prepararDestinoGestionEmpresa(servicio);
        
        // DIRECCIÓN → PEDIDO → OBSERVACIONES → FLETE

        nuevaProgramacionGestionEmpresa.insertAdjacentElement("afterend",panelDireccionGestionEmpresa);
        panelDireccionGestionEmpresa.insertAdjacentElement("afterend",panelPedidoGestionEmpresa);
        panelPedidoGestionEmpresa.insertAdjacentElement("afterend",observacionesReagendarEmpresa);
        observacionesReagendarEmpresa.insertAdjacentElement("afterend",panelDestinoGestionEmpresa);
        btnConfirmarGestionServicioEmpresa.disabled = false;
        btnConfirmarGestionServicioEmpresa.textContent = "Confirmar reagendamiento";

    } else {
        panelDireccionGestionEmpresa.remove();
        panelPedidoGestionEmpresa.remove();
        observacionesReagendarEmpresa.remove();
        panelDestinoGestionEmpresa.remove();
    }


    if (tipoGestionActualEmpresa ==="REAGENDAR") {

        mostrarEmpresa(nuevaProgramacionGestionEmpresa);
        inputAtencionInmediataGestionEmpresa.value ="NO";
        btnAtencionInmediataGestionEmpresa.classList.remove("activo");
        selectNuevaVentanaGestionEmpresa.disabled = false;
        const hoy = obtenerFechaLocalEmpresa();
        inputNuevaFechaGestionEmpresa.value =hoy;
        inputNuevaFechaGestionEmpresa.min = hoy;
        cargarOperariosGestionEmpresa(servicio.operarioAsignado);
        actualizarDisponibilidadGestionEmpresa();
        btnConfirmarGestionServicioEmpresa.textContent = "Confirmar reagendamiento";

    } else {

        ocultarEmpresa(nuevaProgramacionGestionEmpresa);
        btnConfirmarGestionServicioEmpresa.textContent ="Confirmar cancelación";

    }

}


// ==========================================================
// OPERARIOS DEL MODAL
// REUTILIZA LOS YA CARGADOS EN EMPRESA
// ==========================================================

function cargarOperariosGestionEmpresa(
    operarioActual
) {

    selectNuevoOperarioGestionEmpresa.innerHTML =
        selectOperarioEmpresa.innerHTML;


    selectNuevoOperarioGestionEmpresa.value =
        operarioActual || "";

}


// ==========================================================
// CAMBIOS DE PROGRAMACIÓN
// ==========================================================

inputNuevaFechaGestionEmpresa.addEventListener(
    "change",
    actualizarDisponibilidadGestionEmpresa
);


selectNuevoOperarioGestionEmpresa.addEventListener(
    "change",
    actualizarDisponibilidadGestionEmpresa
);


// ==========================================================
// ATENCIÓN INMEDIATA
// ==========================================================

btnAtencionInmediataGestionEmpresa.addEventListener(
    "click",
    function () {

        const activa =
            inputAtencionInmediataGestionEmpresa.value ===
            "SI";


        inputAtencionInmediataGestionEmpresa.value =
            activa
                ? "NO"
                : "SI";


        btnAtencionInmediataGestionEmpresa
            .classList
            .toggle(
                "activo",
                !activa
            );


        if (!activa) {

            inputNuevaFechaGestionEmpresa.value =
                obtenerFechaLocalEmpresa();


            selectNuevaVentanaGestionEmpresa.innerHTML =
                `
                <option value="ATENCIÓN INMEDIATA">
                    ATENCIÓN INMEDIATA
                </option>
                `;


            selectNuevaVentanaGestionEmpresa.value =
                "ATENCIÓN INMEDIATA";


            selectNuevaVentanaGestionEmpresa.disabled =
                true;


        } else {

            selectNuevaVentanaGestionEmpresa.disabled =
                false;


            actualizarDisponibilidadGestionEmpresa();

        }

    }
);


// ==========================================================
// DISPONIBILIDAD GLOBAL PARA REAGENDAMIENTO
// ==========================================================

async function actualizarDisponibilidadGestionEmpresa() {

    if (
        tipoGestionActualEmpresa !==
        "REAGENDAR"
    ) {
        return;
    }


    if (
        inputAtencionInmediataGestionEmpresa.value ===
        "SI"
    ) {

        inputNuevaFechaGestionEmpresa.value =
            obtenerFechaLocalEmpresa();


        selectNuevaVentanaGestionEmpresa.innerHTML =
            `
            <option value="ATENCIÓN INMEDIATA">
                ATENCIÓN INMEDIATA
            </option>
            `;


        selectNuevaVentanaGestionEmpresa.value =
            "ATENCIÓN INMEDIATA";


        selectNuevaVentanaGestionEmpresa.disabled =
            true;


        return;

    }


    const fecha =
        inputNuevaFechaGestionEmpresa.value;


    const operario =
        selectNuevoOperarioGestionEmpresa
            .value
            .trim();


    selectNuevaVentanaGestionEmpresa.innerHTML =
        `
        <option value="">
            Seleccione un horario
        </option>
        `;


    if (
        !fecha ||
        !operario
    ) {
        return;
    }


    try {

        const respuesta =
            await fetch(

                "/api/oxitrack/" +

                "?modo=disponibilidadAgenda" +

                "&fechaProgramada=" +
                encodeURIComponent(
                    fecha
                ) +

                "&operarioAsignado=" +
                encodeURIComponent(
                    operario
                ),

                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }

            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok ||
            datos.ok !== true
        ) {

            throw new Error(
                datos.error ||
                "No fue posible consultar la agenda."
            );

        }


        cargarVentanasGestionEmpresa(
            datos.ventanasOcupadas
        );


    } catch (error) {

        console.error(
            "Error disponibilidad gestión Empresa:",
            error
        );


        mostrarMensajeGeneral(
            error.message ||
            "No fue posible consultar la agenda.",
            "error"
        );

    }

}


// ==========================================================
// CONSTRUIR VENTANAS DEL MODAL
// ==========================================================

function cargarVentanasGestionEmpresa(
    ventanasOcupadas = []
) {

    selectNuevaVentanaGestionEmpresa.innerHTML =
        `
        <option value="">
            Seleccione un horario
        </option>
        `;


    const ocupadas =
        new Set(
            Array.isArray(
                ventanasOcupadas
            )
                ? ventanasOcupadas
                : []
        );


    const hoy =
        obtenerFechaLocalEmpresa();


    const fecha =
        inputNuevaFechaGestionEmpresa.value;


    const ahora =
        new Date();


    const minutosActuales =
        ahora.getHours() * 60 +
        ahora.getMinutes();


    for (
        let minutos = 0;
        minutos < 24 * 60;
        minutos += 30
    ) {

        if (
            fecha === hoy &&
            minutos < minutosActuales
        ) {
            continue;
        }


        const inicio =
            convertirMinutosEmpresa(
                minutos
            );


        const fin =
            convertirMinutosEmpresa(
                (minutos + 60) %
                (24 * 60)
            );


        const ventana =
            `${inicio} - ${fin}`;


        const option =
            document.createElement(
                "option"
            );


        option.value =
            ventana;

        option.textContent =
            ventana;


        if (
            ocupadas.has(
                ventana
            )
        ) {

            option.disabled =
                true;

        }


        selectNuevaVentanaGestionEmpresa.appendChild(
            option
        );

    }

}


// ==========================================================
// CONFIRMAR REAGENDAMIENTO / CANCELACIÓN
// ==========================================================

btnConfirmarGestionServicioEmpresa.addEventListener("click", async function () {

        if (!servicioGestionSeleccionadoEmpresa) {return;}
        if (tipoGestionActualEmpresa === "REAGENDAR" &&
            (
                !inputNuevaFechaGestionEmpresa.value ||
                !selectNuevoOperarioGestionEmpresa.value ||
                !selectNuevaVentanaGestionEmpresa.value
            )
        ) {
            mostrarMensajeGeneral("Debe seleccionar nueva fecha, operario y ventana horaria.","error");
            return;

        }


        if (!solicitudGestionIdEmpresa) {solicitudGestionIdEmpresa = generarIdSolicitudEmpresa();}
        btnConfirmarGestionServicioEmpresa.disabled = true;

        try {

            const payload = new FormData();

            payload.append("tipoCliente","GESTION_SERVICIO_OFICINA");
            // MUY IMPORTANTE:
            // DURANTE MARCHA BLANCA
            payload.append("ambito", "EMPRESA");
            payload.append("accion",tipoGestionActualEmpresa);
            payload.append("id",servicioGestionSeleccionadoEmpresa.id);
            payload.append("solicitudGestionId",solicitudGestionIdEmpresa);

            if (tipoGestionActualEmpresa === "REAGENDAR") {

                payload.append("fechaProgramada",inputNuevaFechaGestionEmpresa.value);
                payload.append("ventanaHoraria",inputAtencionInmediataGestionEmpresa.value === "SI" ? "ATENCIÓN INMEDIATA" : selectNuevaVentanaGestionEmpresa.value);
                payload.append("operarioAsignado",selectNuevoOperarioGestionEmpresa.value);
                payload.append("observacionesReagendamiento",document.getElementById("inputObservacionesReagendarEmpresa").value.trim());
                const pedidoReagendado = obtenerPedidoReagendadoEmpresa();
                payload.append("modificarDetalle",pedidoReagendado.modificar);
                if (pedidoReagendado.modificar === "SI") {
                    payload.append("detalleSolicitado",pedidoReagendado.detalle);
                }
                // ==========================================================
                // DIRECCIÓN Y FLETE - REAGENDAMIENTO EMPRESA
                // ==========================================================

                const cambiarDireccion = checkDireccionGestionEmpresa.checked;

            if (cambiarDireccion) {
                if (!direccionGestionEmpresa.value.trim() || !comunaGestionEmpresa.value
                ) {throw new Error("Debe ingresar la nueva dirección y comuna.");}
            }

            payload.append("cambiarDireccion",cambiarDireccion ? "SI" : "NO");
            payload.append("nuevaDireccion",cambiarDireccion ? direccionGestionEmpresa.value.trim().toUpperCase() : "");
            payload.append("nuevaComuna",cambiarDireccion ? comunaGestionEmpresa.value : "");
            payload.append("llevaNuevoFlete",fleteGestionEmpresa.value);
            payload.append("horarioFleteReagendar",fleteGestionEmpresa.value === "SI" ? "DIURNO" : "");
            payload.append("convenioReagendar",fleteGestionEmpresa.value === "SI" ? "NO" : "");
            }

            const respuesta = await fetch("/api/oxitrack/", {method: "POST",body: payload});
            const resultado = await respuesta.json();

            if (!respuesta.ok || resultado.ok !== true) {

                throw new Error(resultado.error || "No fue posible gestionar el servicio.");

            }

            ocultarEmpresa(modalGestionServicioEmpresa);
            mostrarMensajeGeneral(tipoGestionActualEmpresa === "REAGENDAR" ? "Servicio reagendado correctamente." : "Servicio cancelado correctamente.","exito");
            setTimeout(function () {window.location.assign("./index.html");}, 10000);
            servicioGestionSeleccionadoEmpresa = null;
            solicitudGestionIdEmpresa = "";

        } catch (error) {

            console.error( "Error gestión servicio Empresa:",error);
            mostrarMensajeGeneral(error.message || "No fue posible gestionar el servicio.", "error");

        } finally {

            btnConfirmarGestionServicioEmpresa.disabled = false;

        }

    }
);


// ==========================================================
// FORMATO FECHA PARA EL MODAL
// ==========================================================

function formatearFechaGestionEmpresa(
    valor
) {

    const texto =
        String(
            valor || ""
        ).trim();


    if (!texto) {
        return "";
    }


    const partes =
        texto.split("-");


    if (
        partes.length === 3
    ) {

        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
        );

    }


    return texto;

}


// ==========================================================
// TIPOS IMPLEMENTACIÓN - PRUEBA
// ==========================================================

function cargarTiposImplementacionPrueba() {

    selectTipoImplementacionEmpresa.innerHTML = `

        <option value="">
            Seleccione un tipo
        </option>

        <option value="CILINDRO TRANSPORTE D">
            CILINDRO TRANSPORTE D
        </option>

        <option value="CILINDRO TRANSPORTE E">
            CILINDRO TRANSPORTE E
        </option>

        <option value="CILINDRO 10M3">
            CILINDRO 10M3
        </option>

        <option value="CONCENTRADOR 5 LITROS">
            CONCENTRADOR 5 LITROS
        </option>

        <option value="CONCENTRADOR 10 LITROS">
            CONCENTRADOR 10 LITROS
        </option>

        <option value="KIT CILINDROS ADULTO">
            KIT CILINDROS ADULTO
        </option>

        <option value="KIT CILINDROS PEDIATRA">
            KIT CILINDROS PEDIATRA
        </option>

        <option value="KIT CONCENTRADOR 5 LITROS">
            KIT CONCENTRADOR 5 LITROS
        </option>

        <option value="KIT CONCENTRADOR 10 LITROS">
            KIT CONCENTRADOR 10 LITROS
        </option>

    `;

}


// ==========================================================
// REINICIO
// ==========================================================

function reiniciarEmpresaSeleccionada() {

    empresaSeleccionada = null;
    resultadosBusquedaEmpresa.replaceChildren();
    resultadosBusquedaEmpresa.hidden = true;
    destinoServicioEmpresa = "";
    llevaFleteEmpresa = "";
    inputRutEmpresa.value = "";
    inputPacienteEmpresa.value = "";
    inputDireccionPacienteEmpresa.value = "";
    selectComunaPacienteEmpresa.value = "";
    reiniciarDireccionAlternativaEmpresa();
    inputObservacionesEmpresa.value = "";
    contenedorProductosEmpresa.innerHTML = "";
    limpiarBotonesDestino();
    btnFleteSiEmpresa.classList.remove("activo");
    btnFleteNoEmpresa.classList.remove("activo");

    [
        seccionEmpresaSeleccionada,
        seccionModalidadMixta,
        seccionPacienteEmpresa,
        seccionDireccionEmpresa,
        seccionDetalleEmpresa,
        seccionTipoImplementacionEmpresa,
        seccionProgramacionEmpresa,
        seccionFleteEmpresa,
        seccionObservacionesEmpresa,
        seccionBotonEmpresa

    ].forEach(ocultarEmpresa);

}

// ==========================================================
// UTILIDADES
// ==========================================================

function mostrarEmpresa(elemento) {

    if (elemento) {elemento.hidden = false;}

}


function ocultarEmpresa(elemento) {

    if (elemento) {elemento.hidden = true;}

}


function limpiarBotonesDestino() {

    btnDestinoEmpresa.classList.remove("activo");
    btnDestinoPaciente.classList.remove("activo");

}


function normalizarTextoEmpresa(valor) {

    return String(valor || "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace("OXIGENO", "OXÍGENO")
        .replace("NITROGENO", "NITRÓGENO")
        .replace("IMPLEMENTACION", "IMPLEMENTACIÓN");

}


function obtenerFechaLocalEmpresa() {

    const ahora = new Date();
    const offset = ahora.getTimezoneOffset();
    const local = new Date( ahora.getTime() - offset * 60000);

    return local.toISOString().slice(0, 10);

}


function convertirMinutosEmpresa(total) {

    const minutosDia = ((total % 1440) + 1440) % 1440;
    const horas = Math.floor(minutosDia / 60);
    const minutos = minutosDia % 60;

    return (String(horas).padStart(2, "0") + ":" + String(minutos).padStart(2, "0"));

}

function generarIdSolicitudEmpresa() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID ===
        "function"
    ) {

        return crypto.randomUUID();

    }

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2)
    );

}


function ocultarRutEmpresa(rut) {

    const limpio =
        String(rut || "")
            .replace(
                /[^0-9kK]/g,
                ""
            );

    if (limpio.length <= 4) {
        return limpio;
    }

    return (
        limpio.slice(0, 4) +
        "****"
    );

}


function datoResumen(
    titulo,
    valor,
    html = false
) {

    return `
        <div class="dato-resumen">

            <span>
                ${titulo}
            </span>

            <strong>
                ${
                    html
                        ? valor
                        : escaparHtmlEmpresa(
                            valor
                        )
                }
            </strong>

        </div>
    `;

}


function escaparHtmlEmpresa(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function mostrarMensajeBusqueda(
    texto,
    tipo
) {

    mensajeBusquedaEmpresa.textContent =
        texto;

    mensajeBusquedaEmpresa.className =
        "mensaje-registro " + tipo;

    mensajeBusquedaEmpresa.hidden =
        false;

}


function ocultarMensajeBusqueda() {

    mensajeBusquedaEmpresa.hidden =
        true;

}


function mostrarMensajeGeneral(
    texto,
    tipo
) {

    mensajeEmpresa.textContent =
        texto;

    mensajeEmpresa.className =
        "mensaje-registro " + tipo;

    mensajeEmpresa.hidden =
        false;

}


function ocultarMensajeGeneral() {

    mensajeEmpresa.hidden =
        true;

}