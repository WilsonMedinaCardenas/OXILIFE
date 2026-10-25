"use strict";


// ==========================================================
// OXITRACK
// REGISTRO DE PACIENTES - OFICINA
// ==========================================================


// ==========================================================
// ESTADO GENERAL
// ==========================================================

let servicioActual = "";
let tipoPacienteActual = "";
let pacienteSeleccionado = null;
let llevaFleteActual = "";
let horarioFleteActual = "";
let convenioActual = "";
let comunasDisponibles = [];
let temporizadorBusquedaPaciente = null;
let idSolicitudRegistro = "";


// ==========================================================
// ELEMENTOS DOM
// ==========================================================

// SELECTOR OFICINA: EMPRESA / PARTICULAR

const moduloParticularOficina = document.getElementById("moduloParticularOficina");
const formRegistroPaciente = document.getElementById("formRegistroPaciente");
const selectServicioRegistro = document.getElementById("selectServicioRegistro");

// PROGRAMACIÓN DEL SERVICIO

const seccionFechaServicio = document.getElementById("seccionFechaServicio");
const inputFechaServicio = document.getElementById("inputFechaServicio");
const selectVentanaServicio = document.getElementById("selectVentanaServicio");
const selectOperarioAsignado = document.getElementById("selectOperarioAsignado");
const btnAtencionInmediata = document.getElementById("btnAtencionInmediata");
const inputAtencionInmediata = document.getElementById("inputAtencionInmediata");
const seccionGestionServicio = document.getElementById("seccionGestionServicio");
const btnAbrirReagendar = document.getElementById("btnAbrirReagendar");
const btnAbrirCancelarServicio = document.getElementById("btnAbrirCancelarServicio");
const modalGestionServicio = document.getElementById("modalGestionServicio");
const tituloGestionServicio = document.getElementById("tituloGestionServicio");
const inputBuscarGestion = document.getElementById("inputBuscarGestion");
const resultadosGestionServicio = document.getElementById("resultadosGestionServicio");
const detalleGestionServicio = document.getElementById("detalleGestionServicio");
const resumenGestionServicio = document.getElementById("resumenGestionServicio");
const nuevaProgramacionGestion = document.getElementById("nuevaProgramacionGestion");
const inputNuevaFechaGestion = document.getElementById("inputNuevaFechaGestion");
const selectNuevoOperarioGestion = document.getElementById("selectNuevoOperarioGestion");
const selectNuevaVentanaGestion = document.getElementById("selectNuevaVentanaGestion");
const btnAtencionInmediataGestion = document.getElementById("btnAtencionInmediataGestion");
const inputAtencionInmediataGestion = document.getElementById("inputAtencionInmediataGestion");
const btnCerrarGestionServicio = document.getElementById("btnCerrarGestionServicio");
const btnCerrarGestionSinSeleccion = document.getElementById("btnCerrarGestionSinSeleccion");
const btnConfirmarGestionServicio = document.getElementById("btnConfirmarGestionServicio");
const checkOtraDireccionReagendar = document.getElementById("checkOtraDireccionReagendar");
const camposOtraDireccionReagendar = document.getElementById("camposOtraDireccionReagendar");
const direccionReagendar = document.getElementById("direccionReagendar");
const comunaReagendar = document.getElementById("comunaReagendar");
const fleteReagendar = document.getElementById("fleteReagendar");
const detalleFleteReagendar = document.getElementById("detalleFleteReagendar");
const horarioFleteReagendar = document.getElementById("horarioFleteReagendar");
const convenioReagendar = document.getElementById("convenioReagendar");
const errorReagendamiento = document.getElementById("errorReagendamiento");
const btnFleteSiReagendar = document.getElementById("btnFleteSiReagendar");
const btnFleteNoReagendar = document.getElementById("btnFleteNoReagendar");
const btnDiurnoReagendar = document.getElementById("btnDiurnoReagendar");
const btnNocturnoReagendar = document.getElementById("btnNocturnoReagendar");
const btnConvenioSiReagendar = document.getElementById("btnConvenioSiReagendar");
const btnConvenioNoReagendar = document.getElementById("btnConvenioNoReagendar");

function seleccionarFleteReagendar(valor) {
    fleteReagendar.value = valor;
    detalleFleteReagendar.hidden = valor !== "SI";

    btnFleteSiReagendar.classList.toggle("activo", valor === "SI");
    btnFleteNoReagendar.classList.toggle("activo", valor === "NO");

    if (valor === "NO") {
        horarioFleteReagendar.value = "";
        convenioReagendar.value = "";

        [
            btnDiurnoReagendar,
            btnNocturnoReagendar,
            btnConvenioSiReagendar,
            btnConvenioNoReagendar
        ].forEach(btn => btn.classList.remove("activo"));
    }
}

btnFleteSiReagendar.addEventListener("click", () => {seleccionarFleteReagendar("SI");});
btnFleteNoReagendar.addEventListener("click", () => {seleccionarFleteReagendar("NO");});
btnDiurnoReagendar.addEventListener("click", () => {horarioFleteReagendar.value = "DIURNO";activarBoton(btnDiurnoReagendar, btnNocturnoReagendar);});
btnNocturnoReagendar.addEventListener("click", () => {horarioFleteReagendar.value = "NOCTURNO";activarBoton(btnNocturnoReagendar, btnDiurnoReagendar);});
btnConvenioSiReagendar.addEventListener("click", () => {convenioReagendar.value = "SI";activarBoton(btnConvenioSiReagendar, btnConvenioNoReagendar);});
btnConvenioNoReagendar.addEventListener("click", () => {convenioReagendar.value = "NO";activarBoton(btnConvenioNoReagendar, btnConvenioSiReagendar);});

function reiniciarOpcionesReagendamiento() {
    checkOtraDireccionReagendar.checked = false;
    camposOtraDireccionReagendar.hidden = true;
    direccionReagendar.value = "";
    comunaReagendar.value = "";
    errorReagendamiento.hidden = true;
    errorReagendamiento.textContent = "";
    seleccionarFleteReagendar("NO");
}

function cargarComunasReagendamiento() {
    comunaReagendar.innerHTML = '<option value="">Seleccione una comuna</option>';

    [...new Set(comunasDisponibles)].forEach(comuna => {
        const opcion = document.createElement("option");
        opcion.value = comuna;
        opcion.textContent = comuna;
        comunaReagendar.appendChild(opcion);
    });
}

checkOtraDireccionReagendar.addEventListener("change", function () {
    if (this.checked) {
        cargarComunasReagendamiento();
        direccionReagendar.focus();
    }
});
fleteReagendar.addEventListener("change", function () {
    const llevaFlete = this.value === "SI";
    detalleFleteReagendar.hidden = !llevaFlete;
    if (!llevaFlete) {horarioFleteReagendar.value = "";convenioReagendar.value = "";}
});

direccionReagendar.addEventListener("input", function () {
    this.value = this.value.toUpperCase();
});
checkOtraDireccionReagendar.addEventListener("change", () => {
    camposOtraDireccionReagendar.hidden = !checkOtraDireccionReagendar.checked;
    if (!checkOtraDireccionReagendar.checked) {direccionReagendar.value = ""; comunaReagendar.value = "";}
});
const accionesCerrarGestion = document.getElementById("accionesCerrarGestion");

let tipoGestionActual = "";
let servicioGestionSeleccionado = null;
let solicitudGestionId = "";
// ==========================================================
// PEDIDO EDITABLE - REAGENDAMIENTO PARTICULAR
// ==========================================================

const panelPedidoGestionParticular =
    document.getElementById("panelPedidoGestionParticular");

let detalleEditableGestionParticular = [];
let detalleOriginalGestionParticular = "";
let detalleGestionModificadoParticular = false;
let pedidoEditableGestionParticular = false;

function pintarPedidoGestionParticular(servicio) {

    panelPedidoGestionParticular.replaceChildren();

    detalleEditableGestionParticular = [];
    detalleOriginalGestionParticular =
        String(servicio.detalleSolicitado || "").trim();

    detalleGestionModificadoParticular = false;
    pedidoEditableGestionParticular = false;

    const tipoServicio = String(servicio.servicio || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

    // Solo estos servicios tienen un pedido de elementos
    // que corresponde editar mediante cantidades.
    if (
        !tipoServicio.includes("IMPLEMENT") &&
        !tipoServicio.includes("RECARGA")
    ) {
        panelPedidoGestionParticular.hidden = true;
        return;
    }

    panelPedidoGestionParticular.hidden = false;

    const titulo = document.createElement("h2");
    titulo.className = "ox-pedido-titulo";
    titulo.textContent = "Pedido agendado";
    panelPedidoGestionParticular.appendChild(titulo);

    if (!detalleOriginalGestionParticular) {
        const aviso = document.createElement("p");
        aviso.textContent =
            "Este servicio no tiene un pedido de elementos registrado.";
        panelPedidoGestionParticular.appendChild(aviso);
        return;
    }

    let datos;

    try {
        datos = JSON.parse(detalleOriginalGestionParticular);
    } catch (error) {
        const aviso = document.createElement("p");
        aviso.textContent =
            "El pedido original tiene un formato antiguo. " +
            "No se pueden editar sus cantidades desde esta pantalla.";
        panelPedidoGestionParticular.appendChild(aviso);
        return;
    }

    if (
        !Array.isArray(datos) ||
        !datos.length ||
        datos.some(item =>
            !item ||
            typeof item !== "object" ||
            !String(item.elemento || "").trim() ||
            !Number.isSafeInteger(Number(item.cantidad)) ||
            Number(item.cantidad) < 0
        )
    ) {
        const aviso = document.createElement("p");
        aviso.textContent =
            "El pedido original no tiene un formato válido para edición.";
        panelPedidoGestionParticular.appendChild(aviso);
        return;
    }

    pedidoEditableGestionParticular = true;

    detalleEditableGestionParticular = datos.map(item => ({
        ...item,
        cantidad: Number(item.cantidad)
    }));

    detalleEditableGestionParticular.forEach(function(item, indice) {

        const fila = document.createElement("div");
        fila.className = "ox-pedido-fila";

        const descripcion = document.createElement("span");
        descripcion.className = "ox-pedido-descripcion";
        descripcion.textContent = String(item.elemento);

        const controles = document.createElement("div");
        controles.className = "ox-pedido-controles";

        const menos = document.createElement("button");
        menos.type = "button";
        menos.className = "ox-pedido-boton";
        menos.textContent = "−";

        const cantidad = document.createElement("strong");
        cantidad.className = "ox-pedido-cantidad";
        cantidad.textContent = String(item.cantidad);

        const mas = document.createElement("button");
        mas.type = "button";
        mas.className = "ox-pedido-boton";
        mas.textContent = "+";

        function modificarCantidad(diferencia) {

            const nueva =
                detalleEditableGestionParticular[indice].cantidad +
                diferencia;

            if (nueva < 0 || nueva > 1000) return;

            detalleEditableGestionParticular[indice].cantidad = nueva;
            cantidad.textContent = String(nueva);

            detalleGestionModificadoParticular = true;
        }

        menos.addEventListener("click", function() {
            modificarCantidad(-1);
        });

        mas.addEventListener("click", function() {
            modificarCantidad(1);
        });

        controles.append(menos, cantidad, mas);
        fila.append(descripcion, controles);

        panelPedidoGestionParticular.appendChild(fila);
    });
}

function obtenerPedidoReagendadoParticular() {

    if (!detalleGestionModificadoParticular) {return {modificar: "NO",detalle: ""};}
    if (!pedidoEditableGestionParticular) {throw new Error("El pedido de este servicio no admite edición.");}
    if (!detalleEditableGestionParticular.some(item => item.cantidad > 0)) {throw new Error("El pedido debe conservar al menos un elemento.");}
    return {modificar: "SI",detalle: JSON.stringify(detalleEditableGestionParticular)};
}

let temporizadorBusquedaGestion = null;

// PACIENTE NUEVO / REGISTRADO

const seccionTipoPaciente = document.getElementById("seccionTipoPaciente");
const btnPacienteNuevo = document.getElementById("btnPacienteNuevo");
const btnPacienteRegistrado = document.getElementById("btnPacienteRegistrado");


// BÚSQUEDA

const seccionBusquedaPaciente = document.getElementById("seccionBusquedaPaciente");
const inputBuscarPaciente = document.getElementById("inputBuscarPaciente");
const resultadosBusquedaPaciente = document.getElementById("resultadosBusquedaPaciente");
const pacienteSeleccionadoId = document.getElementById("pacienteSeleccionadoId");
const pacienteSeleccionadoCard = document.getElementById("pacienteSeleccionadoCard");
const pacienteSeleccionadoNombre = document.getElementById("pacienteSeleccionadoNombre");
const pacienteSeleccionadoDireccion = document.getElementById("pacienteSeleccionadoDireccion");
const pacienteSeleccionadoComuna = document.getElementById("pacienteSeleccionadoComuna");

const seccionDireccionAlternativa = document.getElementById("seccionDireccionAlternativa");
const checkOtraDireccion = document.getElementById("checkOtraDireccion");
const camposOtraDireccion = document.getElementById("camposOtraDireccion");
const inputOtraDireccion = document.getElementById("inputOtraDireccion");
const selectOtraComuna = document.getElementById("selectOtraComuna");

function reiniciarDireccionAlternativa() {
    checkOtraDireccion.checked = false;
    inputOtraDireccion.value = "";
    selectOtraComuna.value = "";
    camposOtraDireccion.hidden = true;
    seccionDireccionAlternativa.hidden = true;
}

function cargarComunasDireccionAlternativa() {
    selectOtraComuna.innerHTML =
        '<option value="">Seleccione una comuna</option>';

    [...new Set(comunasDisponibles)].forEach(function(comuna) {
        const opcion = document.createElement("option");
        opcion.value = comuna;
        opcion.textContent = comuna;
        selectOtraComuna.appendChild(opcion);
    });
}

function obtenerDireccionServicioParticular() {
    if (
        tipoPacienteActual === "REGISTRADO" &&
        checkOtraDireccion.checked &&
        servicioActual !== "RETIRO"
    ) {
        return {
            direccion: inputOtraDireccion.value.trim().toUpperCase(),
            comuna: selectOtraComuna.value.trim().toUpperCase(),
            alternativa: true
        };
    }

    return {
        direccion: pacienteSeleccionado?.direccion || "",
        comuna: pacienteSeleccionado?.comuna || "",
        alternativa: false
    };
}

checkOtraDireccion.addEventListener("change", function() {
    camposOtraDireccion.hidden = !this.checked;

    if (this.checked) {
        cargarComunasDireccionAlternativa();
        inputOtraDireccion.focus();
    } else {
        inputOtraDireccion.value = "";
        selectOtraComuna.value = "";
    }
});

inputOtraDireccion.addEventListener("input", function() {
    this.value = this.value.toUpperCase();
});


// DATOS PACIENTE NUEVO

const seccionDatosPaciente = document.getElementById("seccionDatosPaciente");
const inputNombrePaciente = document.getElementById("inputNombrePaciente");
const inputRutPaciente = document.getElementById("inputRutPaciente");
const inputTelefonoPaciente = document.getElementById("inputTelefonoPaciente");
const inputEmailPaciente = document.getElementById("inputEmailPaciente");
inputEmailPaciente.addEventListener("input",()=>{inputEmailPaciente.value=inputEmailPaciente.value.toLowerCase();});
const inputDireccionPaciente = document.getElementById("inputDireccionPaciente");
const inputComunaPaciente = document.getElementById("inputComunaPaciente");
const resultadosComunas = document.getElementById("resultadosComunas");
const comunaSeleccionada = document.getElementById("comunaSeleccionada");

// IMPLEMENTACIÓN

const seccionImplementacion = document.getElementById("seccionImplementacion");
const selectTipoImplementacion = document.getElementById("selectTipoImplementacion");
const selectCicloImplementacion = document.getElementById("selectCicloImplementacion");
const cantidadImplementacion = document.getElementById("cantidadImplementacion");
document.getElementById("btnImplementacionMenos").addEventListener("click", () => {
    cantidadImplementacion.value = String(Math.max(1, Number(cantidadImplementacion.value) - 1));});
document.getElementById("btnImplementacionMas").addEventListener("click", () => {
    cantidadImplementacion.value = String(Math.min(20, Number(cantidadImplementacion.value) + 1));});
const resumenTarifasImplementacion = document.getElementById("resumenTarifasImplementacion");
const valorArriendo = document.getElementById("valorArriendo");
const valorInsumos = document.getElementById("valorInsumos");
const valorFleteDiurno = document.getElementById("valorFleteDiurno");
const valorFleteNocturno = document.getElementById("valorFleteNocturno");


// RECARGA

const seccionRecargaRegistrado = document.getElementById("seccionRecargaRegistrado");
const listaCilindrosPaciente = document.getElementById("listaCilindrosPaciente");
const seccionRecargaNuevo = document.getElementById("seccionRecargaNuevo");
const selectCilindroRecargaNuevo = document.getElementById("selectCilindroRecargaNuevo");
const seccionDetalleRecargaMultiple = document.getElementById("seccionDetalleRecargaMultiple");
const filasRecargaMultiple = document.getElementById("filasRecargaMultiple");
const btnAgregarMedidaRecarga = document.getElementById("btnAgregarMedidaRecarga");
let catalogoCilindrosRecarga = [];
let cilindrosPacienteRecarga = [];

// RETIRO

const seccionRetiro = document.getElementById("seccionRetiro");
const retiroOrigenCard = document.getElementById("retiroOrigenCard");
const retiroIdOrigen = document.getElementById("retiroIdOrigen");
const retiroTipoOrigen = document.getElementById("retiroTipoOrigen");
const retiroElementosOrigen = document.getElementById("retiroElementosOrigen");
const inputRetiroIdOrigen = document.getElementById("inputRetiroIdOrigen");

// VENTA

const seccionVenta = document.getElementById("seccionVenta");

// FLETE

const seccionFlete = document.getElementById("seccionFlete");
const btnFleteSi = document.getElementById("btnFleteSi");
const btnFleteNo = document.getElementById("btnFleteNo");
const inputLlevaFlete = document.getElementById("inputLlevaFlete");
const seccionDetalleFlete = document.getElementById("seccionDetalleFlete");
const btnFleteDiurno = document.getElementById("btnFleteDiurno");
const btnFleteNocturno = document.getElementById("btnFleteNocturno");
const inputHorarioFlete = document.getElementById("inputHorarioFlete");
const btnConvenioSi = document.getElementById("btnConvenioSi");
const btnConvenioNo = document.getElementById("btnConvenioNo");
const inputConvenio = document.getElementById("inputConvenio");

// OBSERVACIONES

const seccionObservacionesRegistro = document.getElementById("seccionObservacionesRegistro");
const inputObservacionesRegistro = document.getElementById("inputObservacionesRegistro");

// RESUMEN

const seccionResumenRegistro = document.getElementById("seccionResumenRegistro");
const contenidoResumenRegistro = document.getElementById("contenidoResumenRegistro");

// BOTÓN

const seccionBotonRegistro = document.getElementById("seccionBotonRegistro");
const btnRegistrarPaciente = document.getElementById("btnRegistrarPaciente");

// MENSAJE

const mensajeRegistro = document.getElementById("mensajeRegistro");

// MODAL CONFIRMACIÓN

const modalConfirmacionRegistro = document.getElementById("modalConfirmacionRegistro");
const modalResumenRegistro = document.getElementById("modalResumenRegistro");
const btnCancelarRegistro = document.getElementById("btnCancelarRegistro");
const btnConfirmarRegistro = document.getElementById("btnConfirmarRegistro");

// MODAL ÉXITO

const modalRegistroExitoso = document.getElementById("modalRegistroExitoso");
const idRegistroCreado = document.getElementById("idRegistroCreado");
const btnNuevoRegistro = document.getElementById("btnNuevoRegistro");


// ==========================================================
// TEXTO EN MAYÚSCULAS - REGISTRO OFICINA
// ==========================================================

[
    inputNombrePaciente,
    inputDireccionPaciente,
    inputObservacionesRegistro
].forEach(function (campo) {

    campo.addEventListener("input", function () {

        const inicio = campo.selectionStart;
        const fin = campo.selectionEnd;

        campo.value =
            campo.value.toUpperCase();

        if (
            typeof inicio === "number" &&
            typeof fin === "number"
        ) {

            campo.setSelectionRange(
                inicio,
                fin
            );

        }

    });

});

// ==========================================================
// INICIALIZACIÓN
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

    reiniciarFormularioCompleto();
    configurarFechaServicio();
    cargarVentanasHorarias();
    cargarCatalogoRegistro();
    cargarOperariosRegistro();
    selectVentanaServicio.disabled = true;

});

// ==========================================================
// FECHA DEL SERVICIO
// ==========================================================

function configurarFechaServicio() {

    const hoy = obtenerFechaLocal();

    inputFechaServicio.value = hoy;
    inputFechaServicio.min = hoy;

}


function obtenerFechaLocal() {

    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;

}

// ==========================================================
// CAMBIO DE FECHA PROGRAMADA
// ==========================================================

inputFechaServicio.addEventListener(
    "change",
    function () {

        const hoy =
            obtenerFechaLocal();


        if (
            inputFechaServicio.value &&
            inputFechaServicio.value < hoy
        ) {

            inputFechaServicio.value = hoy;

        }


        actualizarDisponibilidadAgenda();

    }
);

// ==========================================================
// VENTANAS HORARIAS
// 1 HORA DE DURACIÓN
// INICIO CADA 30 MINUTOS
// ==========================================================

function cargarVentanasHorarias(ventanasOcupadas = []) {

    selectVentanaServicio.innerHTML = `
        <option value="">
            Seleccione un horario
        </option>
    `;

    const ocupadas = new Set(
        Array.isArray(ventanasOcupadas)
            ? ventanasOcupadas
            : []
    );


    const hoy =
        obtenerFechaLocal();

    const fechaSeleccionada =
        inputFechaServicio.value;

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

        // SI LA FECHA ES HOY,
        // NO MOSTRAR HORARIOS QUE YA COMENZARON

        if (
            fechaSeleccionada === hoy &&
            minutos < minutosActuales
        ) {
            continue;
        }


        const inicio =
            convertirMinutosAHora(minutos);

        const fin =
            convertirMinutosAHora(
                (minutos + 60) % (24 * 60)
            );

        const ventana =
            `${inicio} - ${fin}`;

        const option =
            document.createElement("option");

        option.value = ventana;
        option.textContent = ventana;


        if (ocupadas.has(ventana)) {

            option.disabled = true;

        }


        selectVentanaServicio.appendChild(
            option
        );

    }

}

function convertirMinutosAHora(totalMinutos) {

    const minutosDia =
        ((totalMinutos % (24 * 60)) + (24 * 60)) %
        (24 * 60);

    const horas =
        Math.floor(minutosDia / 60);

    const minutos =
        minutosDia % 60;

    return (
        String(horas).padStart(2, "0") +
        ":" +
        String(minutos).padStart(2, "0")
    );

}

// ==========================================================
// DISPONIBILIDAD DE AGENDA
// FECHA + OPERARIO
// ==========================================================

async function actualizarDisponibilidadAgenda() {

    const fecha =
        inputFechaServicio.value;

    const operario =
        selectOperarioAsignado.value.trim();


    selectVentanaServicio.value = "";


    if (!fecha || !operario) {

        cargarVentanasHorarias();

        selectVentanaServicio.disabled = true;

        return;

    }


    selectVentanaServicio.disabled = true;

    selectVentanaServicio.innerHTML = `
        <option value="">
            Consultando disponibilidad...
        </option>
    `;


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
                        "Accept": "application/json"
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
                "No fue posible consultar la disponibilidad."
            );

        }


        const ventanasOcupadas =
            Array.isArray(datos.ventanasOcupadas)
                ? datos.ventanasOcupadas
                : [];


        cargarVentanasHorarias(
            ventanasOcupadas
        );


        selectVentanaServicio.disabled = false;


    } catch (error) {

        console.error(
            "Error al consultar disponibilidad de agenda:",
            error
        );


        selectVentanaServicio.innerHTML = `
            <option value="">
                No fue posible cargar horarios
            </option>
        `;


        selectVentanaServicio.disabled = true;


        mostrarError(
            "No fue posible consultar la disponibilidad del operario."
        );

    }

}

// ==========================================================
// CATÁLOGO REGISTRO OFICINA
// COMUNAS + TIPOS IMPLEMENTACIÓN + CILINDROS RECARGA
// ==========================================================

async function cargarCatalogoRegistro() {

    try {

        const respuesta = await fetch("/api/oxitrack/?modo=catalogoRegistro", {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );

        const datos = await respuesta.json();

        if (!respuesta.ok || datos.ok !== true) {
            throw new Error(datos.error || "No fue posible obtener el catálogo de registro.");
        }

        // -----------------------------------------------------
        // COMUNAS
        // ------------------------------------------------------

        comunasDisponibles = Array.isArray(datos.comunas) ? [...new Set(datos.comunas.map(function (comuna) {return String(comuna || "").trim();}).filter(Boolean))] : [];

        // ------------------------------------------------------
        // TIPOS IMPLEMENTACIÓN
        // ------------------------------------------------------

        selectTipoImplementacion.innerHTML =
            `<option value="">
                Seleccione un tipo
            </option>`;


        const tiposImplementacion = Array.isArray(datos.tiposImplementacion) ? [...new Set(datos.tiposImplementacion)] : [];


        tiposImplementacion.forEach(function (tipo) {
            const valor = String(tipo || "").trim();
            if (!valor) return;
            const opcion = document.createElement("option");
            opcion.value = valor;
            opcion.textContent = valor;
            selectTipoImplementacion.appendChild(opcion);

        });


        // ------------------------------------------------------
        // CILINDROS RECARGA
        // ------------------------------------------------------

        selectCilindroRecargaNuevo.innerHTML =
            `<option value="">
                Seleccione un cilindro
            </option>`;

        const cilindrosRecarga = Array.isArray(datos.cilindrosRecarga) ? [...new Set(datos.cilindrosRecarga)] : [];
        catalogoCilindrosRecarga = cilindrosRecarga.map(x => String(x || "").trim()).filter(Boolean);
        cilindrosRecarga.forEach(function (cilindro) {
            const valor = String(cilindro || "").trim();
            if (!valor) return;
            const opcion = document.createElement("option");
            opcion.value = valor;
            opcion.textContent = valor;
            selectCilindroRecargaNuevo.appendChild(opcion);

        });


    } catch (error) {

        console.error("Error al cargar catálogo de registro:",error);
        mostrarError("No fue posible cargar los datos necesarios para registrar servicios.");
    }

}

// ==========================================================
// OPERARIOS ASIGNABLES
// ==========================================================

async function cargarOperariosRegistro() {

    try {

        selectOperarioAsignado.innerHTML =
            `<option value="">
                Seleccione un operario
            </option>`;


        const respuesta =
            await fetch(
                "/api/oxitrack/?modo=operariosRegistro",
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
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


        operarios.forEach(function (operario) {

            const nombre =
                String(operario || "").trim();

            if (!nombre) return;


            const opcion =
                document.createElement("option");

            opcion.value = nombre;

            opcion.textContent = nombre;

            selectOperarioAsignado.appendChild(
                opcion
            );

        });


    } catch (error) {

        console.error(
            "Error al cargar operarios:",
            error
        );


        mostrarError(
            "No fue posible cargar los operarios disponibles."
        );

    }

}

// ==========================================================
// CAMBIO DE OPERARIO
// ==========================================================

selectOperarioAsignado.addEventListener(
    "change",
    function () {

        actualizarDisponibilidadAgenda();

    }
);

// ==========================================================
// ATENCIÓN INMEDIATA
// ==========================================================

btnAtencionInmediata.addEventListener(
    "click",
    function () {

        const activa =
            inputAtencionInmediata.value ===
            "SI";


        inputAtencionInmediata.value =
            activa
                ? "NO"
                : "SI";


        btnAtencionInmediata.classList.toggle(
            "activo",
            !activa
        );


        if (!activa) {

            inputFechaServicio.value =
                obtenerFechaLocal();

            selectVentanaServicio.value = "";

            selectVentanaServicio.disabled =
                true;

        } else {

            selectVentanaServicio.disabled =
                !selectOperarioAsignado.value;

            actualizarDisponibilidadAgenda();

        }

    }
);

// ==========================================================
// CAMBIO DE SERVICIO
// ==========================================================

selectServicioRegistro.addEventListener("change", function () {

    servicioActual = normalizarServicio(
        selectServicioRegistro.value
    );

    reiniciarFlujoServicio();

    if (!servicioActual) {
        mostrar(seccionGestionServicio);
        return;
    }

    ocultar(seccionGestionServicio);
    mostrar(seccionFechaServicio);


    // ------------------------------------------------------
    // RETIRO
    // ------------------------------------------------------

    if (servicioActual === "RETIRO") {

        tipoPacienteActual = "REGISTRADO";

        mostrar(seccionBusquedaPaciente);

        mostrar(seccionRetiro);

        mostrar(seccionObservacionesRegistro);

        mostrar(seccionBotonRegistro);

        ocultar(seccionFlete);

        return;
    }

    // ------------------------------------------------------
    // IMPLEMENTACIÓN / RECARGA / VENTA / VISITA TÉCNICA
    // ------------------------------------------------------

    mostrar(seccionTipoPaciente);

    mostrar(seccionObservacionesRegistro);

    mostrar(seccionBotonRegistro);

});


// ==========================================================
// PACIENTE NUEVO
// ==========================================================

btnPacienteNuevo.addEventListener("click", function () {

    tipoPacienteActual = "NUEVO";
    activarBoton(btnPacienteNuevo,btnPacienteRegistrado);
    limpiarPacienteRegistrado();
    ocultar(seccionBusquedaPaciente);
    mostrar(seccionDatosPaciente);


    // ------------------------------------------------------
    // IMPLEMENTACIÓN
    // ------------------------------------------------------

    if (servicioActual === "IMPLEMENTACIÓN") {

        mostrar(seccionImplementacion);
        ocultar(seccionRecargaNuevo);
        ocultar(seccionRecargaRegistrado);
        ocultar(seccionVenta);
        mostrar(seccionFlete);
        return;
    }


    // ------------------------------------------------------
    // RECARGA
    // ------------------------------------------------------

    if (servicioActual === "RECARGA") {

        ocultar(seccionImplementacion);
        iniciarDetalleRecargaMultiple();
        ocultar(seccionRecargaRegistrado);
        ocultar(seccionVenta);
        mostrar(seccionFlete);
        return;
    }


    // ------------------------------------------------------
    // VENTA
    // ------------------------------------------------------

    if (servicioActual === "VENTA") {

        ocultar(seccionImplementacion);
        ocultar(seccionRecargaNuevo);
        ocultar(seccionRecargaRegistrado);
        mostrar(seccionVenta);
        mostrar(seccionFlete);

    }

});


// ==========================================================
// PACIENTE REGISTRADO
// ==========================================================

btnPacienteRegistrado.addEventListener("click", function () {

    tipoPacienteActual = "REGISTRADO";
    activarBoton(btnPacienteRegistrado,btnPacienteNuevo);
    limpiarPacienteNuevo();
    ocultar(seccionDatosPaciente);
    mostrar(seccionBusquedaPaciente);

    // ------------------------------------------------------
    // IMPLEMENTACIÓN
    // ------------------------------------------------------

    if (servicioActual === "IMPLEMENTACIÓN") {

        mostrar(seccionImplementacion);
        ocultar(seccionRecargaNuevo);
        ocultar(seccionRecargaRegistrado);
        ocultar(seccionVenta);
        mostrar(seccionFlete);
        return;
    }


    // ------------------------------------------------------
    // RECARGA
    // ------------------------------------------------------

    if (servicioActual === "RECARGA") {

        ocultar(seccionImplementacion);
        ocultar(seccionRecargaNuevo);
        iniciarDetalleRecargaMultiple();
        ocultar(seccionVenta);
        mostrar(seccionFlete);
        return;
    }

    // ------------------------------------------------------
    // VISITA TÉCNICA
    // ------------------------------------------------------

    if (servicioActual === "VISITA TÉCNICA") {

        ocultar(seccionImplementacion);
        ocultar(seccionRecargaNuevo);
        ocultar(seccionRecargaRegistrado);
        ocultar(seccionVenta);
        mostrar(seccionFlete);
        return;
    }

    // ------------------------------------------------------
    // VENTA
    // ------------------------------------------------------

    if (servicioActual === "VENTA") {

        ocultar(seccionImplementacion);
        ocultar(seccionRecargaNuevo);
        ocultar(seccionRecargaRegistrado);
        mostrar(seccionVenta);
        mostrar(seccionFlete);

    }

});


// ==========================================================
// FLETE SÍ
// ==========================================================

btnFleteSi.addEventListener("click", function () {

    llevaFleteActual = "SI";

    inputLlevaFlete.value = "SI";

    activarBoton(
        btnFleteSi,
        btnFleteNo
    );

    mostrar(seccionDetalleFlete);

});


// ==========================================================
// FLETE NO
// ==========================================================

btnFleteNo.addEventListener("click", function () {

    llevaFleteActual = "NO";

    inputLlevaFlete.value = "NO";

    activarBoton(
        btnFleteNo,
        btnFleteSi
    );

    limpiarDetalleFlete();

    ocultar(seccionDetalleFlete);

});


// ==========================================================
// FLETE DIURNO
// ==========================================================

btnFleteDiurno.addEventListener("click", function () {

    horarioFleteActual = "DIURNO";

    inputHorarioFlete.value = "DIURNO";

    activarBoton(
        btnFleteDiurno,
        btnFleteNocturno
    );

});


// ==========================================================
// FLETE NOCTURNO
// ==========================================================

btnFleteNocturno.addEventListener("click", function () {

    horarioFleteActual = "NOCTURNO";

    inputHorarioFlete.value = "NOCTURNO";

    activarBoton(
        btnFleteNocturno,
        btnFleteDiurno
    );

});


// ==========================================================
// CONVENIO SÍ
// ==========================================================

btnConvenioSi.addEventListener("click", function () {

    convenioActual = "SI";

    inputConvenio.value = "SI";

    activarBoton(
        btnConvenioSi,
        btnConvenioNo
    );

});


// ==========================================================
// CONVENIO NO
// ==========================================================

btnConvenioNo.addEventListener("click", function () {

    convenioActual = "NO";

    inputConvenio.value = "NO";

    activarBoton(
        btnConvenioNo,
        btnConvenioSi
    );

});


// ==========================================================
// COMUNA
//
// POR AHORA SOLO PREPARAMOS EL INPUT.
// EN EL SIGUIENTE PASO SE CONECTARÁ AL WORKER.
// ==========================================================

inputComunaPaciente.addEventListener("input", function () {

    comunaSeleccionada.value = "";

    resultadosComunas.innerHTML = "";

    ocultar(resultadosComunas);

    inputComunaPaciente.value =
    inputComunaPaciente.value.toUpperCase();

    const busqueda =
        inputComunaPaciente.value
            .trim()
            .toUpperCase();


    if (busqueda.length < 2) return;


    const coincidencias =
        comunasDisponibles
            .filter(function (comuna) {

                return String(comuna)
                    .toUpperCase()
                    .includes(busqueda);

            })
            .slice(0, 10);


    if (coincidencias.length === 0) return;


    coincidencias.forEach(function (comuna) {

        const resultado =
            document.createElement("div");

        resultado.className =
            "resultado-busqueda-item";

        resultado.textContent =
            comuna;


        resultado.addEventListener(
            "click",
            function () {

                seleccionarComuna(comuna);

            }
        );


        resultadosComunas.appendChild(
            resultado
        );

    });


    mostrar(resultadosComunas);

});

// ==========================================================
// COMUNA - SELECCIONAR PRIMER RESULTADO CON ENTER
// ==========================================================

inputComunaPaciente.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Enter") return;


        const primerResultado =
            resultadosComunas.querySelector(
                ".resultado-busqueda-item"
            );


        if (!primerResultado) return;


        event.preventDefault();


        seleccionarComuna(
            primerResultado.textContent.trim()
        );

    }
);


// ==========================================================
// BÚSQUEDA PACIENTE
//
// POR AHORA PREPARAMOS EL CAMPO.
// EL WORKER SERÁ QUIEN REALICE LA BÚSQUEDA.
// ==========================================================

inputBuscarPaciente.addEventListener("input", function () {

    pacienteSeleccionado = null;

    pacienteSeleccionadoId.value = "";

    ocultar(pacienteSeleccionadoCard);

    resultadosBusquedaPaciente.innerHTML = "";

    ocultar(resultadosBusquedaPaciente);


    const buscar =
        inputBuscarPaciente.value.trim();


    if (temporizadorBusquedaPaciente) {

        clearTimeout(
            temporizadorBusquedaPaciente
        );

    }


    if (buscar.length < 4) return;


    temporizadorBusquedaPaciente =
        setTimeout(
            function () {

                buscarPacienteRegistrado(
                    buscar
                );

            },
            350
        );

});

// ==========================================================
// BUSCAR PACIENTE REGISTRADO
// ==========================================================

async function buscarPacienteRegistrado(buscar) {

    try {

        resultadosBusquedaPaciente.innerHTML = "";

        ocultar(resultadosBusquedaPaciente);


        const respuesta =
            await fetch(
                "/api/oxitrack/" +
                "?modo=buscarPacienteRegistro" +
                "&buscar=" +
                encodeURIComponent(buscar),
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
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
                "No fue posible buscar el paciente."
            );

        }


        const pacientes =
            Array.isArray(datos.pacientes)
                ? datos.pacientes
                : [];


        resultadosBusquedaPaciente.innerHTML = "";


        if (pacientes.length === 0) {

            const sinResultados =
                document.createElement("div");

            sinResultados.className =
                "resultado-busqueda-item";

            sinResultados.textContent =
                "No se encontraron pacientes.";

            resultadosBusquedaPaciente.appendChild(
                sinResultados
            );

            mostrar(
                resultadosBusquedaPaciente
            );

            return;

        }


        pacientes.forEach(function (paciente) {

            const resultado =
                document.createElement("div");

            resultado.className =
                "resultado-busqueda-item";

            resultado.textContent =
                paciente.nombreMostrar ||
                paciente.nombre ||
                "Paciente";


            resultado.addEventListener(
                "click",
                function () {

                    seleccionarPacienteRegistrado(
                        paciente
                    );

                }
            );


            resultadosBusquedaPaciente.appendChild(
                resultado
            );

        });


        mostrar(
            resultadosBusquedaPaciente
        );


    } catch (error) {

        console.error(
            "Error al buscar paciente:",
            error
        );


        mostrarError(
            "No fue posible buscar el paciente registrado."
        );

    }

}

// ==========================================================
// GESTIÓN DE SERVICIOS
// REAGENDAR / CANCELAR
// ==========================================================

function abrirGestionServicio(tipo) {

    tipoGestionActual = tipo;
    servicioGestionSeleccionado = null;
    solicitudGestionId = "";
    reiniciarOpcionesReagendamiento();

    inputBuscarGestion.value = "";
    resultadosGestionServicio.innerHTML = "";

    ocultar(resultadosGestionServicio);
    ocultar(detalleGestionServicio);
    ocultar(nuevaProgramacionGestion);

    mostrar(accionesCerrarGestion);

    tituloGestionServicio.textContent =
        tipo === "REAGENDAR"
            ? "Reagendar servicio"
            : "Cancelar servicio";

    mostrarModal(modalGestionServicio);

    inputBuscarGestion.focus();

}


btnAbrirReagendar.addEventListener(
    "click",
    function () {
        abrirGestionServicio(
            "REAGENDAR"
        );
    }
);


btnAbrirCancelarServicio.addEventListener(
    "click",
    function () {
        abrirGestionServicio(
            "CANCELAR"
        );
    }
);


btnCerrarGestionServicio.addEventListener(
    "click",
    function () {
        ocultarModal(
            modalGestionServicio
        );
    }
);


btnCerrarGestionSinSeleccion.addEventListener(
    "click",
    function () {
        ocultarModal(
            modalGestionServicio
        );
    }
);


inputBuscarGestion.addEventListener(
    "input",
    function () {

        clearTimeout(
            temporizadorBusquedaGestion
        );

        const buscar =
            inputBuscarGestion.value.trim();


        if (
            buscar.replace(
                /[^0-9kK]/g,
                ""
            ).length < 4
        ) {

            resultadosGestionServicio.innerHTML = "";

            ocultar(
                resultadosGestionServicio
            );

            return;

        }


        temporizadorBusquedaGestion =
            setTimeout(
                function () {
                    buscarServiciosGestion(
                        buscar
                    );
                },
                350
            );

    }
);


async function buscarServiciosGestion(
    buscar
) {

    try {

        const respuesta =
            await fetch(
                "/api/oxitrack/" +
                "?modo=buscarServiciosPendientesOficina" +
                "&buscar=" +
                encodeURIComponent(buscar),
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
                "No fue posible buscar servicios."
            );

        }


        const normalizarEstadoGestion = valor => String(valor || "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const serviciosRecibidos = Array.isArray(datos.servicios) ? datos.servicios : [];
        const servicios = serviciosRecibidos.filter(servicio => {const estado = normalizarEstadoGestion(servicio.estado);
            if (tipoGestionActual === "REAGENDAR") {
                return estado === "PENDIENTE" ||
                    estado === "AGENDADO" ||
                    estado === "REAGENDADO" ||
                    estado === "NO REALIZADO";
            }

            return estado === "PENDIENTE" || estado === "AGENDADO" || estado === "REAGENDADO";
        });
        resultadosGestionServicio.innerHTML = "";
        if (!servicios.length) {

            const item = document.createElement("div");
            item.className = "resultado-busqueda-item";
            item.textContent = "No se encontraron servicios pendientes.";
            resultadosGestionServicio.appendChild(item);
            mostrar(resultadosGestionServicio);
            return;

        }


        servicios.forEach(function (servicio) {

                const item = document.createElement( "div");
                item.className ="resultado-busqueda-item";
                item.textContent = servicio.nombre + " | " + servicio.servicio + " | " + servicio.estado + " | " + servicio.fechaProgramada + " | " + servicio.ventanaHoraria;

                item.addEventListener("click",function () {seleccionarServicioGestion(servicio);});
                resultadosGestionServicio.appendChild(item);

            }
        );


        mostrar(
            resultadosGestionServicio
        );


    } catch (error) {

        console.error(
            "Error gestión:",
            error
        );

        mostrarError(
            error.message ||
            "No fue posible buscar servicios."
        );

    }

}


function seleccionarServicioGestion(servicio) {

    servicioGestionSeleccionado = servicio;
    solicitudGestionId = "";
    ocultar(resultadosGestionServicio);
    ocultar(accionesCerrarGestion);

    resumenGestionServicio.innerHTML = crearFilaResumen("ID",servicio.id) + crearFilaResumen(
        "Paciente",servicio.nombre) + crearFilaResumen("Servicio",servicio.servicio) +
        crearFilaResumen("Dirección",servicio.direccion) + crearFilaResumen(
        "Comuna",servicio.comuna) + crearFilaResumen("Fecha actual",formatearFechaVisual(servicio.fechaProgramada)) +
        crearFilaResumen("Programación actual",servicio.ventanaHoraria) + crearFilaResumen("Operario actual",servicio.operarioAsignado);
    mostrar(detalleGestionServicio);


    if (tipoGestionActual ==="REAGENDAR") {mostrar(nuevaProgramacionGestion);

        pintarPedidoGestionParticular(servicio);
        inputAtencionInmediataGestion.value = "NO";
        btnAtencionInmediataGestion.classList.remove("activo");
        selectNuevaVentanaGestion.disabled = false;
        inputNuevaFechaGestion.value =obtenerFechaLocal();
        inputNuevaFechaGestion.min =obtenerFechaLocal();
        cargarOperariosGestion(servicio.operarioAsignado);
        actualizarDisponibilidadGestion();
        btnConfirmarGestionServicio.textContent = "Confirmar reagendamiento";

    } else {ocultar(nuevaProgramacionGestion);
        panelPedidoGestionParticular.hidden = true;
        btnConfirmarGestionServicio.textContent ="Confirmar cancelación";}

}


function cargarOperariosGestion(
    operarioActual
) {

    selectNuevoOperarioGestion.innerHTML =
        selectOperarioAsignado.innerHTML;

    selectNuevoOperarioGestion.value =
        operarioActual || "";

}


inputNuevaFechaGestion.addEventListener(
    "change",
    actualizarDisponibilidadGestion
);

btnAtencionInmediataGestion.addEventListener(
    "click",
    function () {

        const activa = inputAtencionInmediataGestion.value === "SI";

        inputAtencionInmediataGestion.value = activa ? "NO" : "SI";
        btnAtencionInmediataGestion.classList.toggle("activo", !activa);

        if (!activa) {

            inputNuevaFechaGestion.value = obtenerFechaLocal();

            selectNuevaVentanaGestion.innerHTML =
                `<option value="ATENCIÓN INMEDIATA">
                    ATENCIÓN INMEDIATA
                </option>`;

            selectNuevaVentanaGestion.value = "ATENCIÓN INMEDIATA";
            selectNuevaVentanaGestion.disabled = true;

        } else {

            selectNuevaVentanaGestion.disabled = false;
            actualizarDisponibilidadGestion();

        }

    }
);


selectNuevoOperarioGestion.addEventListener(
    "change",
    actualizarDisponibilidadGestion
);


async function actualizarDisponibilidadGestion() {

    if (
        tipoGestionActual !==
        "REAGENDAR"
    ) {
        return;
    }

        if (inputAtencionInmediataGestion.value === "SI") {

        inputNuevaFechaGestion.value = obtenerFechaLocal();

        selectNuevaVentanaGestion.innerHTML =
            `<option value="ATENCIÓN INMEDIATA">
                ATENCIÓN INMEDIATA
            </option>`;

        selectNuevaVentanaGestion.value = "ATENCIÓN INMEDIATA";
        selectNuevaVentanaGestion.disabled = true;

        return;
    }


    const fecha =
        inputNuevaFechaGestion.value;

    const operario =
        selectNuevoOperarioGestion.value;


    selectNuevaVentanaGestion.innerHTML =
        `<option value="">
            Seleccione un horario
        </option>`;


    if (!fecha || !operario) {
        return;
    }


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


        const ocupadas =
            new Set(
                Array.isArray(
                    datos.ventanasOcupadas
                )
                    ? datos.ventanasOcupadas
                    : []
            );


        const hoy =
            obtenerFechaLocal();

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
                convertirMinutosAHora(
                    minutos
                );

            const fin =
                convertirMinutosAHora(
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


            selectNuevaVentanaGestion.appendChild(
                option
            );

        }


    } catch (error) {

        console.error(
            "Error disponibilidad gestión:",
            error
        );

        mostrarError(
            "No fue posible consultar la agenda."
        );

    }

}


btnConfirmarGestionServicio.addEventListener("click", async function () {

        if (!servicioGestionSeleccionado) {return;}
        if (tipoGestionActual === "REAGENDAR" &&
            (
                !inputNuevaFechaGestion.value ||
                !selectNuevoOperarioGestion.value ||
                !selectNuevaVentanaGestion.value
            )
        ) {

            mostrarError("Debe seleccionar nueva fecha, operario y ventana horaria.");
            return;
        }
        if (!solicitudGestionId) {
            solicitudGestionId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : (
                        Date.now().toString(36) + "-" + Math.random().toString(36).slice(2));
        }
        btnConfirmarGestionServicio.disabled = true;
        try {
            const payload = new FormData();
            payload.append("tipoCliente","GESTION_SERVICIO_OFICINA");
            payload.append("accion",tipoGestionActual);
            payload.append("id",servicioGestionSeleccionado.id);
            payload.append("solicitudGestionId",solicitudGestionId);
            if (tipoGestionActual ==="REAGENDAR") {
                payload.append("fechaProgramada",inputNuevaFechaGestion.value);
                payload.append("ventanaHoraria",inputAtencionInmediataGestion.value === "SI" ? "ATENCIÓN INMEDIATA" : selectNuevaVentanaGestion.value);
                payload.append("operarioAsignado",selectNuevoOperarioGestion.value);
                const pedidoReagendado = obtenerPedidoReagendadoParticular();
                payload.append("modificarDetalle",pedidoReagendado.modificar);
                if (pedidoReagendado.modificar === "SI") {payload.append("detalleSolicitado",pedidoReagendado.detalle);}
                if (checkOtraDireccionReagendar.checked) {
                    if (!direccionReagendar.value.trim() || !comunaReagendar.value) {throw new Error("Debe ingresar la nueva dirección y seleccionar la comuna.");}}
                payload.append("cambiarDireccion",checkOtraDireccionReagendar.checked ? "SI" : "NO");
                payload.append("nuevaDireccion",checkOtraDireccionReagendar.checked ? direccionReagendar.value.trim() : "");
                payload.append("nuevaComuna",checkOtraDireccionReagendar.checked ? comunaReagendar.value : "");
                payload.append("llevaNuevoFlete",fleteReagendar.value);
                if (fleteReagendar.value === "SI") {
                    if (!horarioFleteReagendar.value || !convenioReagendar.value) {
                        throw new Error("Debe seleccionar el horario y el convenio del nuevo flete.");}
                }
                payload.append("horarioFleteReagendar",fleteReagendar.value === "SI" ? horarioFleteReagendar.value : "");
                payload.append("convenioReagendar",fleteReagendar.value === "SI"? convenioReagendar.value: "");

            }

            const respuesta = await fetch("/api/oxitrack/",{method: "POST",body: payload});
            const resultado = await respuesta.json();
            if (!respuesta.ok || resultado.ok !== true) {
                throw new Error(resultado.error || "No fue posible gestionar el servicio.");
            }

            
            const gestionRealizada = tipoGestionActual;
            ocultarModal(modalGestionServicio);
            mostrarMensaje(gestionRealizada === "REAGENDAR" ? "Servicio reagendado correctamente." : "Servicio cancelado correctamente.","exito");
            setTimeout(function () {window.location.assign("./index.html");}, 10000);
            servicioGestionSeleccionado = null;
            solicitudGestionId = "";
            resultadosGestionServicio.innerHTML = "";
            ocultar(resultadosGestionServicio);
            ocultar(detalleGestionServicio);
            ocultar(nuevaProgramacionGestion);
            mostrar(accionesCerrarGestion);

            // La próxima búsqueda consultará nuevamente al backend.
        } catch (error) {
            console.error("Error gestión servicio:", error);

            const mensaje =
                error.message || "No fue posible gestionar el servicio.";

            if (tipoGestionActual === "REAGENDAR") {
                errorReagendamiento.textContent = mensaje;
                errorReagendamiento.hidden = false;
                errorReagendamiento.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            } else {
                mostrarError(mensaje);
            }

        } finally {
            btnConfirmarGestionServicio.disabled = false;
        }

    }
);

// ==========================================================
// FORMATO RUT
// ==========================================================

inputRutPaciente.addEventListener("input", function () {

    inputRutPaciente.value = formatearRut(
        inputRutPaciente.value
    );

});


// ==========================================================
// FORMATO TELÉFONO
// ==========================================================

inputTelefonoPaciente.addEventListener("input", function () {

    let valor = inputTelefonoPaciente.value;

    valor = valor.replace(/[^\d+ ]/g, "");

    inputTelefonoPaciente.value = valor;

});


// ==========================================================
// SUBMIT
// ==========================================================

formRegistroPaciente.addEventListener("submit", function (event) {

    event.preventDefault();

    ocultarMensaje();


    try {

        validarFormulario();

        const resumen = construirResumen();

        contenidoResumenRegistro.innerHTML = resumen;

        modalResumenRegistro.innerHTML = resumen;

        mostrar(seccionResumenRegistro);

        mostrarModal(modalConfirmacionRegistro);

    } catch (error) {

        mostrarError(error.message);

    }

});


// ==========================================================
// CANCELAR CONFIRMACIÓN
// ==========================================================

btnCancelarRegistro.addEventListener("click", function () {

    ocultarModal(modalConfirmacionRegistro);

});


// ==========================================================
// CONFIRMAR REGISTRO
//
// IMPORTANTE:
// TODAVÍA NO SE ENVÍA AL BACKEND.
// ==========================================================

btnConfirmarRegistro.addEventListener("click", async function () {

        ocultarMensaje();


        if (!idSolicitudRegistro) { idSolicitudRegistro = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : (
            Date.now().toString(36) + "-" + Math.random().toString(36).slice(2));
        }

        btnConfirmarRegistro.disabled = true;
        btnConfirmarRegistro.textContent = "Registrando...";

        try {

            validarFormulario();

            const payload = new FormData();
            payload.append("tipoCliente","REGISTRO_OFICINA");
            payload.append("solicitudId", idSolicitudRegistro);
            payload.append("tipoPaciente", servicioActual === "RETIRO" ? "REGISTRADO" : tipoPacienteActual);
            payload.append("servicio", servicioActual);
            payload.append("pacienteId", pacienteSeleccionadoId.value.trim());
            payload.append("fechaProgramada", inputFechaServicio.value);
            payload.append("ventanaHoraria", inputAtencionInmediata.value === "SI" ? "ATENCIÓN INMEDIATA" : selectVentanaServicio.value);
            payload.append("atencionInmediata", inputAtencionInmediata.value);
            payload.append("operarioAsignado", selectOperarioAsignado.value);

            // DIRECCIÓN EFECTIVA DEL SERVICIO - PACIENTE REGISTRADO
            if (tipoPacienteActual === "REGISTRADO" && servicioActual !== "RETIRO") {
                const destino = obtenerDireccionServicioParticular();
                payload.append("direccionServicio", destino.direccion);
                payload.append("comunaServicio", destino.comuna);
                payload.append("usarOtraDireccion", destino.alternativa ? "SI" : "NO");
                if (destino.alternativa) {
                    payload.append("direccionAlternativa", destino.direccion);
                    payload.append("comunaAlternativa", destino.comuna);
                }
            }


            // ==================================================
            // PACIENTE NUEVO
            // ==================================================

            if (
                tipoPacienteActual === "NUEVO"
            ) {

                payload.append("nombre", inputNombrePaciente.value.trim());
                payload.append("rut", inputRutPaciente.value.trim());
                payload.append("telefono", inputTelefonoPaciente.value.trim());
                payload.append("email",inputEmailPaciente.value.trim().toLowerCase());
                payload.append("direccion", inputDireccionPaciente.value.trim());
                payload.append("comuna", comunaSeleccionada.value.trim());

            }


            // ==================================================
            // IMPLEMENTACIÓN
            // ==================================================

            if (servicioActual === "IMPLEMENTACIÓN") {
                payload.append("tipo",selectTipoImplementacion.value);
                payload.append("ciclo",selectCicloImplementacion.value);
                payload.append("cantidadImplementacion", cantidadImplementacion.value);
            }

            // ==================================================
            // RECARGA
            // ==================================================

            if (servicioActual === "RECARGA") {

                const detalleRecarga = obtenerDetalleRecargaMultiple();
                payload.append("tipo", detalleRecarga[0].elemento);
                payload.append("detalleRecarga", JSON.stringify(detalleRecarga));

            }

            // ==================================================
            // RETIRO
            // ==================================================

            if (servicioActual === "RETIRO") {payload.append("idOrigen",inputRetiroIdOrigen.value);}


            // ==================================================
            // FLETE
            // ==================================================

            if (
                servicioActual === "IMPLEMENTACIÓN" ||
                servicioActual === "RECARGA" ||
                servicioActual === "VENTA" ||
                servicioActual === "VISITA TÉCNICA"
            ) {

                payload.append("llevaFlete",llevaFleteActual);

                if (llevaFleteActual === "SI") {
                    payload.append("horarioFlete",horarioFleteActual);
                    payload.append("convenio",convenioActual);
                }

            }
            payload.append("observaciones",inputObservacionesRegistro.value.trim());

            // ==================================================
            // ENVÍO
            // ==================================================

            const respuesta = await fetch("/api/oxitrack/",{method: "POST",body: payload});
            const textoRespuesta = await respuesta.text();
            let resultado;
            try {resultado = JSON.parse(textoRespuesta);
            } catch (error) {
                console.error("RESPUESTA NO JSON DEL WORKER", {
                    status: respuesta.status,
                    url: respuesta.url,
                    contentType: respuesta.headers.get("content-type"),
                    respuesta: textoRespuesta.slice(0, 1500)
                });

                throw new Error(
                    "El servidor devolvió una página HTML en vez de JSON. " +
                    "Código HTTP: " + respuesta.status +
                    ". Revisa la consola F12 para ver el origen."
                );
            }

            if (!respuesta.ok || resultado.ok !== true) {throw new Error(resultado.error || "El servidor rechazó el registro.");}

            // ==================================================
            // ÉXITO
            // ==================================================

            ocultarModal(modalConfirmacionRegistro);
            idRegistroCreado.textContent = resultado.id;
            mostrarModal(modalRegistroExitoso);

        } catch (error) {

            console.error("Error al registrar servicio:",error);
            ocultarModal(modalConfirmacionRegistro);
            mostrarError(error.message ||"No fue posible registrar el servicio.");
            mensajeRegistro.scrollIntoView({behavior: "smooth",block: "center"});
        } finally {

            btnConfirmarRegistro.disabled = false;
            btnConfirmarRegistro.textContent = "Confirmar";

        }

    }
);


// ==========================================================
// NUEVO REGISTRO
// ==========================================================

btnNuevoRegistro.addEventListener("click", function () {

    ocultarModal(modalRegistroExitoso);

    // El formulario queda limpio para una próxima entrada.
    reiniciarFormularioCompleto();

    // Regresar a la pantalla principal de Gestión de Servicios.
    window.location.assign("./");

});

// ==========================================================
// VALIDAR FORMULARIO
// ==========================================================

function validarFormulario() {

    if (!servicioActual) {

        throw new Error(
            "Debe seleccionar un tipo de servicio."
        );

    }


    if (!inputFechaServicio.value) {

        throw new Error(
            "Debe seleccionar la fecha del servicio."
        );

    }


    const hoy = obtenerFechaLocal();

    if (inputFechaServicio.value < hoy) {

        throw new Error(
            "La fecha del servicio no puede ser anterior a hoy."
        );

    }


    if (inputAtencionInmediata.value !== "SI" && !selectVentanaServicio.value) {

        throw new Error(
            "Debe seleccionar la ventana horaria del servicio."
        );

    }

    const opcionHorarioSeleccionada = selectVentanaServicio.options[
        selectVentanaServicio.selectedIndex
    ];


    if (
        opcionHorarioSeleccionada &&
        opcionHorarioSeleccionada.disabled
    ) {

        throw new Error(
            "La ventana horaria seleccionada ya no está disponible."
        );

    }


    if (!selectOperarioAsignado.value) {

        throw new Error(
            "Debe seleccionar el operario asignado."
        );

    }


    // ------------------------------------------------------
    // RETIRO
    // ------------------------------------------------------

    if (servicioActual === "RETIRO") {

        if (!pacienteSeleccionadoId.value) {

            throw new Error(
                "Debe seleccionar un paciente registrado."
            );

        }

        if (!inputRetiroIdOrigen.value) {

            throw new Error(
                "No se encontró la implementación original del paciente."
            );

        }

        return true;

    }

    // ------------------------------------------------------
    // NUEVO / REGISTRADO
    // ------------------------------------------------------

    if (
        tipoPacienteActual !== "NUEVO" && tipoPacienteActual !== "REGISTRADO") {

        throw new Error(
            "Debe indicar si el paciente es nuevo o registrado."
        );

    }


    // ------------------------------------------------------
    // PACIENTE NUEVO
    // ------------------------------------------------------

    if (tipoPacienteActual === "NUEVO") {

        validarPacienteNuevo();

    }


    // ------------------------------------------------------
    // PACIENTE REGISTRADO
    // ------------------------------------------------------

    if (tipoPacienteActual === "REGISTRADO") {

        if (!pacienteSeleccionadoId.value) { throw new Error("Debe buscar y seleccionar un paciente registrado.");}
        if (servicioActual !== "RETIRO" && checkOtraDireccion.checked) {
            if (!inputOtraDireccion.value.trim()) {throw new Error("Debe ingresar la nueva dirección de entrega.");}
            if (!selectOtraComuna.value.trim()) {throw new Error("Debe seleccionar la comuna de la nueva dirección.");}
        }

    }


    // ------------------------------------------------------
    // IMPLEMENTACIÓN
    // ------------------------------------------------------

    if (servicioActual === "IMPLEMENTACIÓN") {

        if (!selectTipoImplementacion.value) {

            throw new Error(
                "Debe seleccionar el tipo de implementación."
            );

        }

        if (!selectCicloImplementacion.value) {

            throw new Error(
                "Debe seleccionar el ciclo de arriendo."
            );

        }

    }


    // ------------------------------------------------------
    // RECARGA NUEVO
    // ------------------------------------------------------

    if (servicioActual === "RECARGA" && tipoPacienteActual === "NUEVO") {obtenerDetalleRecargaMultiple();}

    // ------------------------------------------------------
    // RECARGA REGISTRADO
    // ------------------------------------------------------

    if (servicioActual === "RECARGA" && tipoPacienteActual === "REGISTRADO") {
        const cilindro = obtenerDetalleRecargaMultiple();
        if (!cilindro) {throw new Error("Debe seleccionar el cilindro que se va a recargar.");}
    }

    // ------------------------------------------------------
    // FLETE
    // ------------------------------------------------------

    validarFlete();

    return true;

}


// ==========================================================
// VALIDAR PACIENTE NUEVO
// ==========================================================

function validarPacienteNuevo() {

    const nombre = inputNombrePaciente.value.trim();

    const rut = inputRutPaciente.value.trim();

    const telefono = inputTelefonoPaciente.value.trim();

    const email = inputEmailPaciente.value.trim();

    const direccion = inputDireccionPaciente.value.trim();

    const comuna = comunaSeleccionada.value.trim();


    if (!nombre) {

        throw new Error(
            "Debe ingresar el nombre del paciente."
        );

    }


    if (!rut) {

        throw new Error(
            "Debe ingresar el RUT del paciente."
        );

    }


    if (!telefono) {

        throw new Error(
            "Debe ingresar el teléfono del paciente."
        );

    }


    if (!email) {

        throw new Error(
            "Debe ingresar el email del paciente."
        );

    }


    if (!direccion) {

        throw new Error(
            "Debe ingresar la dirección del paciente."
        );

    }


    if (!comuna) {

        throw new Error(
            "Debe seleccionar una comuna válida."
        );

    }

}


// ==========================================================
// VALIDAR FLETE
// ==========================================================

function validarFlete() {

    if (
        servicioActual !== "IMPLEMENTACIÓN" &&
        servicioActual !== "RECARGA" &&
        servicioActual !== "VENTA" &&
        servicioActual !== "VISITA TÉCNICA"
    ) {

        return;

    }


    if (
        llevaFleteActual !== "SI" &&
        llevaFleteActual !== "NO"
    ) {

        throw new Error(
            "Debe indicar si el servicio lleva flete."
        );

    }


    if (llevaFleteActual === "NO") return;


    if (
        horarioFleteActual !== "DIURNO" &&
        horarioFleteActual !== "NOCTURNO"
    ) {

        throw new Error(
            "Debe indicar si el flete es diurno o nocturno."
        );

    }


    if (
        convenioActual !== "SI" &&
        convenioActual !== "NO"
    ) {

        throw new Error(
            "Debe indicar si el flete corresponde a convenio."
        );

    }

}


// ==========================================================
// OBTENER CILINDRO SELECCIONADO
// PACIENTE REGISTRADO
// ==========================================================

function obtenerCilindroRegistradoSeleccionado() {

    const seleccionado = listaCilindrosPaciente.querySelector(
        'input[name="cilindroPaciente"]:checked'
    );

    return seleccionado
        ? seleccionado.value
        : "";

}


// ==========================================================
// CONSTRUIR RESUMEN
// ==========================================================

function construirResumen() {

    let html = "";


    html += crearFilaResumen("Servicio",servicioActual);
    html += crearFilaResumen("Fecha del servicio",formatearFechaVisual(inputFechaServicio.value));
    html += crearFilaResumen("Programación", inputAtencionInmediata.value === "SI" ? "ATENCIÓN INMEDIATA" : selectVentanaServicio.value);
    html += crearFilaResumen("Operario asignado",textoOpcionSeleccionada(selectOperarioAsignado));

    // ------------------------------------------------------
    // PACIENTE
    // ------------------------------------------------------

    if (servicioActual === "RETIRO") {html += crearFilaResumen("Paciente", pacienteSeleccionadoNombre.textContent.trim());
    } else {
        html += crearFilaResumen("Paciente", tipoPacienteActual === "NUEVO" ? inputNombrePaciente.value.trim() : pacienteSeleccionadoNombre.textContent.trim());
        html += crearFilaResumen( "Tipo paciente", tipoPacienteActual);
    }


    // ------------------------------------------------------
    // PACIENTE NUEVO
    // ------------------------------------------------------

    if (tipoPacienteActual === "NUEVO") {

        html += crearFilaResumen("RUT", inputRutPaciente.value.trim());
        html += crearFilaResumen("Teléfono", inputTelefonoPaciente.value.trim());
        html += crearFilaResumen( "Email", inputEmailPaciente.value.trim());
        html += crearFilaResumen( "Dirección", inputDireccionPaciente.value.trim());
        html += crearFilaResumen( "Comuna", comunaSeleccionada.value.trim());

    }


    // ------------------------------------------------------
    // PACIENTE REGISTRADO
    // ------------------------------------------------------

    if (tipoPacienteActual === "REGISTRADO" || servicioActual === "RETIRO") {

        const destino = obtenerDireccionServicioParticular();
        html += crearFilaResumen("Dirección del servicio", destino.direccion);
        html += crearFilaResumen("Comuna del servicio", destino.comuna);

    }

    // ------------------------------------------------------
    // IMPLEMENTACIÓN
    // ------------------------------------------------------

    if (servicioActual === "IMPLEMENTACIÓN") {html += crearFilaResumen("Tipo implementación", textoOpcionSeleccionada(selectTipoImplementacion));
        html += crearFilaResumen("Ciclo", textoOpcionSeleccionada(selectCicloImplementacion));
        html += crearFilaResumen("Cantidad", cantidadImplementacion.value);
    }

    // ------------------------------------------------------
    // RECARGA
    // ------------------------------------------------------

    if (servicioActual === "RECARGA") {
        const detalle = obtenerDetalleRecargaMultiple();
        html += crearFilaResumen("Cilindros", detalle.map(x => `${x.cantidad} × ${x.elemento}`).join("; "));
    }

    // ------------------------------------------------------
    // RETIRO
    // ------------------------------------------------------

    if (servicioActual === "RETIRO") {html += crearFilaResumen( "ID implementación origen", inputRetiroIdOrigen.value);

        html += crearFilaResumen( "Tipo implementación", retiroTipoOrigen.textContent.trim());

    }

    // ------------------------------------------------------
    // FLETE
    // ------------------------------------------------------

    if (
        servicioActual === "IMPLEMENTACIÓN" ||
        servicioActual === "RECARGA" ||
        servicioActual === "VENTA"
    ) {

        html += crearFilaResumen(
            "Lleva flete",
            llevaFleteActual
        );

        if (llevaFleteActual === "SI") {

            html += crearFilaResumen(
                "Horario flete",
                horarioFleteActual
            );

            html += crearFilaResumen(
                "Convenio",
                convenioActual
            );

        }

    }


    // ------------------------------------------------------
    // OBSERVACIONES
    // ------------------------------------------------------

    const observaciones =
        inputObservacionesRegistro.value.trim();

    if (observaciones) {

        html += crearFilaResumen(
            "Observaciones",
            observaciones
        );

    }


    return html;

}


// ==========================================================
// FILA RESUMEN
// ==========================================================

function crearFilaResumen(titulo, valor) {

    return `
        <div class="dato-resumen">
            <span>${escaparHtml(titulo)}</span>
            <strong>${escaparHtml(valor || "-")}</strong>
        </div>
    `;

}


// ==========================================================
// REINICIAR FORMULARIO COMPLETO
// ==========================================================

function reiniciarFormularioCompleto() {

    formRegistroPaciente.reset();
    cantidadImplementacion.value = "1";
    configurarFechaServicio();
    servicioActual = "";
    tipoPacienteActual = "";
    pacienteSeleccionado = null;
    idSolicitudRegistro = "";
    llevaFleteActual = "";
    horarioFleteActual = "";
    convenioActual = "";

    ocultar(seccionFechaServicio);
    ocultar(seccionTipoPaciente);
    ocultar(seccionBusquedaPaciente);
    ocultar(seccionDatosPaciente);
    ocultar(seccionImplementacion);
    ocultar(seccionRecargaRegistrado);
    ocultar(seccionRecargaNuevo);
    ocultar(seccionDetalleRecargaMultiple);
    filasRecargaMultiple.innerHTML = "";
    ocultar(seccionRetiro);
    ocultar(seccionVenta);
    ocultar(seccionFlete);
    ocultar(seccionDetalleFlete);
    ocultar(seccionObservacionesRegistro);
    ocultar(seccionResumenRegistro);
    ocultar(seccionBotonRegistro);
    ocultar(pacienteSeleccionadoCard);
    ocultar(retiroOrigenCard);
    ocultar(resultadosBusquedaPaciente);
    ocultar(resultadosComunas);
    ocultar(resumenTarifasImplementacion);
    ocultarMensaje();
    limpiarBotones();
    limpiarValoresInternos();
    reiniciarDireccionAlternativa();
    inputAtencionInmediata.value = "NO";
    btnAtencionInmediata.classList.remove("activo");

}


// ==========================================================
// REINICIAR AL CAMBIAR SERVICIO
// ==========================================================

function reiniciarFlujoServicio() {

    cantidadImplementacion.value = "1";
    tipoPacienteActual = "";
    pacienteSeleccionado = null;
    idSolicitudRegistro = "";
    llevaFleteActual = "";
    horarioFleteActual = "";
    convenioActual = "";
    ocultar(seccionFechaServicio);
    ocultar(seccionTipoPaciente);
    ocultar(seccionBusquedaPaciente);
    ocultar(seccionDatosPaciente);
    ocultar(seccionImplementacion);
    ocultar(seccionRecargaRegistrado);
    ocultar(seccionRecargaNuevo);
    ocultar(seccionDetalleRecargaMultiple);
    filasRecargaMultiple.innerHTML = "";
    ocultar(seccionRetiro);
    ocultar(seccionVenta);
    ocultar(seccionFlete);
    ocultar(seccionDetalleFlete);
    ocultar(seccionObservacionesRegistro);
    ocultar(seccionResumenRegistro);
    ocultar(seccionBotonRegistro);
    ocultar(pacienteSeleccionadoCard);
    ocultar(retiroOrigenCard);
    ocultar(resultadosBusquedaPaciente);
    ocultar(resultadosComunas);
    limpiarPacienteNuevo();
    limpiarPacienteRegistrado();
    limpiarDetalleFlete();
    limpiarBotones();
    reiniciarDireccionAlternativa();
    inputAtencionInmediata.value = "NO";
    btnAtencionInmediata.classList.remove("activo");

}


// ==========================================================
// LIMPIAR PACIENTE NUEVO
// ==========================================================

function limpiarPacienteNuevo() {

    inputNombrePaciente.value = "";

    inputRutPaciente.value = "";

    inputTelefonoPaciente.value = "";

    inputEmailPaciente.value = "";

    inputDireccionPaciente.value = "";

    inputComunaPaciente.value = "";

    comunaSeleccionada.value = "";

    resultadosComunas.innerHTML = "";

    ocultar(resultadosComunas);

}


// ==========================================================
// LIMPIAR PACIENTE REGISTRADO
// ==========================================================

function limpiarPacienteRegistrado() {

    pacienteSeleccionado = null;

    pacienteSeleccionadoId.value = "";

    inputBuscarPaciente.value = "";

    resultadosBusquedaPaciente.innerHTML = "";

    ocultar(resultadosBusquedaPaciente);

    ocultar(pacienteSeleccionadoCard);

    pacienteSeleccionadoNombre.textContent = "-";

    pacienteSeleccionadoDireccion.textContent = "-";

    pacienteSeleccionadoComuna.textContent = "-";


    inputRetiroIdOrigen.value = "";

    retiroIdOrigen.textContent = "-";

    retiroTipoOrigen.textContent = "-";

    retiroElementosOrigen.innerHTML = "";

    ocultar(retiroOrigenCard);

}


// ==========================================================
// LIMPIAR DETALLE FLETE
// ==========================================================

function limpiarDetalleFlete() {

    horarioFleteActual = "";

    convenioActual = "";

    inputHorarioFlete.value = "";

    inputConvenio.value = "";

    btnFleteDiurno.classList.remove("activo");

    btnFleteNocturno.classList.remove("activo");

    btnConvenioSi.classList.remove("activo");

    btnConvenioNo.classList.remove("activo");

}


// ==========================================================
// LIMPIAR BOTONES
// ==========================================================

function limpiarBotones() {

    const botones = document.querySelectorAll(
        ".btn-selector"
    );

    botones.forEach(function (boton) {

        boton.classList.remove("activo");

    });

}


// ==========================================================
// LIMPIAR VALORES INTERNOS
// ==========================================================

function limpiarValoresInternos() {

    pacienteSeleccionadoId.value = "";

    comunaSeleccionada.value = "";

    inputRetiroIdOrigen.value = "";

    inputLlevaFlete.value = "";

    inputHorarioFlete.value = "";

    inputConvenio.value = "";

}


// ==========================================================
// ACTIVAR BOTÓN
// ==========================================================

function activarBoton(activo, inactivo) {

    activo.classList.add("activo");

    inactivo.classList.remove("activo");

}


// ==========================================================
// MOSTRAR / OCULTAR
// ==========================================================

function mostrar(elemento) {

    if (!elemento) return;

    elemento.hidden = false;

}


function ocultar(elemento) {

    if (!elemento) return;

    elemento.hidden = true;

}


// ==========================================================
// MODALES
// ==========================================================

function mostrarModal(modal) {

    if (!modal) return;

    modal.hidden = false;

}


function ocultarModal(modal) {

    if (!modal) return;

    modal.hidden = true;

}


// ==========================================================
// MENSAJES
// ==========================================================

function mostrarMensaje(texto, tipo) {

    mensajeRegistro.textContent = texto;

    mensajeRegistro.classList.remove(
        "exito",
        "error"
    );

    mensajeRegistro.classList.add(tipo);

    mensajeRegistro.hidden = false;

}


function mostrarError(texto) {

    mostrarMensaje(
        texto,
        "error"
    );

}


function ocultarMensaje() {

    mensajeRegistro.textContent = "";

    mensajeRegistro.classList.remove(
        "exito",
        "error"
    );

    mensajeRegistro.hidden = true;

}


// ==========================================================
// TEXTO OPCIÓN SELECT
// ==========================================================

function textoOpcionSeleccionada(select) {

    if (!select || !select.value) return "";

    return select.options[
        select.selectedIndex
    ].text.trim();

}


// ==========================================================
// NORMALIZAR SERVICIO
// ==========================================================

function normalizarServicio(valor) {

    const texto = String(valor || "")
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");


    if (texto.includes("IMPLEMENT")) {
        return "IMPLEMENTACIÓN";
    }

    if (texto.includes("RECARGA")) {
        return "RECARGA";
    }

    if (texto.includes("RETIRO")) {
        return "RETIRO";
    }

    if (texto.includes("VENTA")) {
        return "VENTA";
    }

    if (texto.includes("VISITA") && texto.includes("TECNICA")) {
        return "VISITA TÉCNICA";
    }

    return "";

}


// ==========================================================
// FORMATEAR RUT
// VISUAL SOLAMENTE
//
// LA VALIDACIÓN REAL DEL RUT SE HARÁ TAMBIÉN EN SERVIDOR.
// ==========================================================

function formatearRut(valor) {

    let rut = String(valor || "")
        .replace(/[^0-9kK]/g, "")
        .toUpperCase();


    if (rut.length <= 1) {
        return rut;
    }


    const dv = rut.slice(-1);

    let cuerpo = rut.slice(0, -1);


    cuerpo = cuerpo.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        "."
    );


    return cuerpo + "-" + dv;

}

// ==========================================================
// FORMATEAR FECHA VISUAL
// ==========================================================

function formatearFechaVisual(fecha) {

    if (!fecha) return "";

    const partes = fecha.split("-");

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// ==========================================================
// ESCAPAR HTML
// ==========================================================

function escaparHtml(valor) {

    return String(valor || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================================
// ==========================================================
// FUNCIONES PREPARADAS PARA LA SIGUIENTE ETAPA
// BACKEND / WORKER
// ==========================================================
// ==========================================================


// ==========================================================
// SELECCIONAR PACIENTE REGISTRADO
//
// ESTA FUNCIÓN YA QUEDA PREPARADA.
// EL SIGUIENTE PASO SERÁ LLAMARLA DESDE LOS RESULTADOS
// QUE DEVUELVA EL WORKER.
// ==========================================================

function seleccionarPacienteRegistrado(paciente) {

    pacienteSeleccionado = paciente;
    pacienteSeleccionadoId.value = String(paciente.id || "").trim();
    pacienteSeleccionadoNombre.textContent = paciente.nombreMostrar || paciente.nombre || "-";
    pacienteSeleccionadoDireccion.textContent = paciente.direccion || "-";
    pacienteSeleccionadoComuna.textContent = paciente.comuna || "-";

    mostrar(pacienteSeleccionadoCard);
    reiniciarDireccionAlternativa();
    if (servicioActual !== "RETIRO") {seccionDireccionAlternativa.hidden = false;}
    resultadosBusquedaPaciente.innerHTML = "";
    ocultar(resultadosBusquedaPaciente);


    // ------------------------------------------------------
    // RETIRO
    // ------------------------------------------------------

    if (servicioActual === "RETIRO") {

        cargarOrigenRetiroPaciente(paciente);

    }


    // ------------------------------------------------------
    // RECARGA REGISTRADO
    // ------------------------------------------------------

    if (servicioActual === "RECARGA") {
        cargarCilindrosPacienteRegistrado(paciente.cilindros || []);
    }

}


// ==========================================================
// CARGAR ORIGEN RETIRO
// ==========================================================

function cargarOrigenRetiroPaciente(paciente) {

    const idOrigen =
        String(paciente.idOrigen || "").trim();

    const tipoOrigen =
        String(paciente.tipoOrigen || "").trim();

    const elementosOrigen =
        Array.isArray(paciente.elementosOrigen)
            ? paciente.elementosOrigen
            : [];


    inputRetiroIdOrigen.value = idOrigen;

    retiroIdOrigen.textContent =
        idOrigen || "-";

    retiroTipoOrigen.textContent =
        tipoOrigen || "-";

    retiroElementosOrigen.innerHTML = "";


    elementosOrigen.forEach(function (item) {

        const fila = document.createElement("div");

        fila.className = "retiro-elemento";


        const nombre = document.createElement("span");

        nombre.textContent =
            item.elemento || "-";


        const cantidad = document.createElement("strong");

        cantidad.textContent =
            "× " + Number(item.cantidad || 0);


        fila.appendChild(nombre);

        fila.appendChild(cantidad);

        retiroElementosOrigen.appendChild(fila);

    });


    if (idOrigen) {

        mostrar(retiroOrigenCard);

    } else {

        ocultar(retiroOrigenCard);

    }

}

function opcionesMedidasRecarga() {
    return [...new Set([...cilindrosPacienteRecarga, ...catalogoCilindrosRecarga].map(x => String(x || "").trim()).filter(Boolean))];
}

function agregarFilaMedidaRecarga(medida = "", cantidad = 1) {
    const fila = document.createElement("div");
    fila.className = "fila-medida-recarga";

    const select = document.createElement("select");
    select.className = "medida-recarga";
    select.appendChild(new Option("Seleccione una medida", ""));
    opcionesMedidasRecarga().forEach(x => select.appendChild(new Option(x, x)));
    if (medida && !opcionesMedidasRecarga().includes(medida)) select.appendChild(new Option(medida, medida));
    select.value = medida;
    select.setAttribute("aria-label", "Medida del cilindro");

    const contador = document.createElement("div");
    contador.className = "contador-recarga";

    const menos = document.createElement("button");
    menos.type = "button";
    menos.className = "btn-contador-recarga";
    menos.textContent = "−";
    menos.setAttribute("aria-label", "Restar cilindro");

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = "999";
    input.step = "1";
    input.inputMode = "numeric";
    input.className = "cantidad-recarga";
    input.value = String(cantidad);
    input.setAttribute("aria-label", "Cantidad de cilindros");

    const mas = document.createElement("button");
    mas.type = "button";
    mas.className = "btn-contador-recarga";
    mas.textContent = "+";
    mas.setAttribute("aria-label", "Sumar cilindro");

    menos.addEventListener("click", () => {
        const actual = Number(input.value) || 1;
        input.value = String(Math.max(1, actual - 1));
    });

    mas.addEventListener("click", () => {
        const actual = Number(input.value) || 0;
        input.value = String(Math.min(999, actual + 1));
    });

    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.className = "btn-quitar-recarga";
    eliminar.textContent = "×";
    eliminar.title = "Eliminar esta medida";
    eliminar.setAttribute("aria-label", "Eliminar esta medida");
    eliminar.addEventListener("click", () => {
        fila.remove();
        if (!filasRecargaMultiple.children.length) agregarFilaMedidaRecarga();
    });

    contador.append(menos, input, mas);
    fila.append(select, contador, eliminar);
    filasRecargaMultiple.appendChild(fila);
}

function iniciarDetalleRecargaMultiple() {
    filasRecargaMultiple.innerHTML = "";
    const primera = tipoPacienteActual === "REGISTRADO" ? (cilindrosPacienteRecarga[0] || "") : "";
    agregarFilaMedidaRecarga(primera, 1);
    mostrar(seccionDetalleRecargaMultiple);
    ocultar(seccionRecargaNuevo);
    ocultar(seccionRecargaRegistrado);
}

function obtenerDetalleRecargaMultiple() {
    const filas = [...filasRecargaMultiple.querySelectorAll(".fila-medida-recarga")];
    if (!filas.length) throw new Error("Agregue al menos una medida de cilindro.");

    const totales = new Map();

    for (const fila of filas) {
        const elemento = fila.querySelector(".medida-recarga").value.trim();
        const valor = fila.querySelector(".cantidad-recarga").value.trim();
        const cantidad = Number(valor);

        if (!elemento) throw new Error("Seleccione la medida de todos los cilindros.");
        if (!/^\d+$/.test(valor) || !Number.isSafeInteger(cantidad) || cantidad < 1 || cantidad > 999) {
            throw new Error("La cantidad debe ser un número entero entre 1 y 999.");
        }

        totales.set(elemento, (totales.get(elemento) || 0) + cantidad);
        if (totales.get(elemento) > 999) throw new Error("Cantidad excesiva para " + elemento);
    }

    return [...totales].map(([elemento, cantidad]) => ({elemento, cantidad, recarga:true}));
}

btnAgregarMedidaRecarga.addEventListener("click", () => agregarFilaMedidaRecarga());

// ==========================================================
// CARGAR CILINDROS RECARGA REGISTRADO
// ==========================================================

function cargarCilindrosPacienteRegistrado(cilindros) {

    listaCilindrosPaciente.innerHTML = "";
    cilindrosPacienteRecarga = [...new Set(cilindros.map(c => typeof c === "string" ? c : c.elemento).filter(Boolean))];
    if (servicioActual === "RECARGA" && tipoPacienteActual === "REGISTRADO") iniciarDetalleRecargaMultiple();
    cilindros.forEach(function (cilindro, index) {

        const nombre = typeof cilindro === "string" ? cilindro : cilindro.elemento;
        if (!nombre) return;
        const contenedor = document.createElement("div");
        contenedor.className = "opcion-servicio";
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "cilindroPaciente";
        radio.value = nombre;
        radio.id = "cilindroPaciente_" + index;
        const texto = document.createElement("span");
        texto.textContent = nombre;
        label.appendChild(radio);
        label.appendChild(texto);
        contenedor.appendChild(label);
        listaCilindrosPaciente.appendChild(contenedor);

    });

}


// ==========================================================
// SELECCIONAR COMUNA
//
// TAMBIÉN QUEDA PREPARADA PARA EL AUTOCOMPLETE.
// ==========================================================

function seleccionarComuna(comuna) {

    const valor =
        String(comuna || "").trim();


    inputComunaPaciente.value = valor;

    comunaSeleccionada.value = valor;


    resultadosComunas.innerHTML = "";

    ocultar(resultadosComunas);

}