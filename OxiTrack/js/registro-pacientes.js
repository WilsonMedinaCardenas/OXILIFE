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


// ==========================================================
// ELEMENTOS DOM
// ==========================================================

const formRegistroPaciente = document.getElementById("formRegistroPaciente");

const selectServicioRegistro = document.getElementById("selectServicioRegistro");


// PACIENTE NUEVO / REGISTRADO

const seccionTipoPaciente = document.getElementById("seccionTipoPaciente");

const btnPacienteNuevo = document.getElementById("btnPacienteNuevo");
const btnPacienteRegistrado = document.getElementById("btnPacienteRegistrado");


// BÚSQUEDA

const seccionBusquedaPaciente = document.getElementById("seccionBusquedaPaciente");

const inputBuscarPaciente = document.getElementById("inputBuscarPaciente");

const resultadosBusquedaPaciente = document.getElementById(
    "resultadosBusquedaPaciente"
);

const pacienteSeleccionadoId = document.getElementById(
    "pacienteSeleccionadoId"
);

const pacienteSeleccionadoCard = document.getElementById(
    "pacienteSeleccionadoCard"
);

const pacienteSeleccionadoNombre = document.getElementById(
    "pacienteSeleccionadoNombre"
);

const pacienteSeleccionadoDireccion = document.getElementById(
    "pacienteSeleccionadoDireccion"
);

const pacienteSeleccionadoComuna = document.getElementById(
    "pacienteSeleccionadoComuna"
);


// DATOS PACIENTE NUEVO

const seccionDatosPaciente = document.getElementById(
    "seccionDatosPaciente"
);

const inputNombrePaciente = document.getElementById(
    "inputNombrePaciente"
);

const inputRutPaciente = document.getElementById(
    "inputRutPaciente"
);

const inputTelefonoPaciente = document.getElementById(
    "inputTelefonoPaciente"
);

const inputEmailPaciente = document.getElementById(
    "inputEmailPaciente"
);

const inputDireccionPaciente = document.getElementById(
    "inputDireccionPaciente"
);

const inputComunaPaciente = document.getElementById(
    "inputComunaPaciente"
);

const resultadosComunas = document.getElementById(
    "resultadosComunas"
);

const comunaSeleccionada = document.getElementById(
    "comunaSeleccionada"
);


// IMPLEMENTACIÓN

const seccionImplementacion = document.getElementById(
    "seccionImplementacion"
);

const selectTipoImplementacion = document.getElementById(
    "selectTipoImplementacion"
);

const selectCicloImplementacion = document.getElementById(
    "selectCicloImplementacion"
);

const resumenTarifasImplementacion = document.getElementById(
    "resumenTarifasImplementacion"
);

const valorArriendo = document.getElementById("valorArriendo");
const valorInsumos = document.getElementById("valorInsumos");
const valorFleteDiurno = document.getElementById("valorFleteDiurno");
const valorFleteNocturno = document.getElementById("valorFleteNocturno");


// RECARGA

const seccionRecargaRegistrado = document.getElementById(
    "seccionRecargaRegistrado"
);

const listaCilindrosPaciente = document.getElementById(
    "listaCilindrosPaciente"
);

const seccionRecargaNuevo = document.getElementById(
    "seccionRecargaNuevo"
);

const selectCilindroRecargaNuevo = document.getElementById(
    "selectCilindroRecargaNuevo"
);


// RETIRO

const seccionRetiro = document.getElementById("seccionRetiro");

const retiroOrigenCard = document.getElementById(
    "retiroOrigenCard"
);

const retiroIdOrigen = document.getElementById(
    "retiroIdOrigen"
);

const retiroTipoOrigen = document.getElementById(
    "retiroTipoOrigen"
);

const retiroElementosOrigen = document.getElementById(
    "retiroElementosOrigen"
);

const inputRetiroIdOrigen = document.getElementById(
    "inputRetiroIdOrigen"
);


// VENTA

const seccionVenta = document.getElementById("seccionVenta");


// FLETE

const seccionFlete = document.getElementById("seccionFlete");

const btnFleteSi = document.getElementById("btnFleteSi");
const btnFleteNo = document.getElementById("btnFleteNo");

const inputLlevaFlete = document.getElementById(
    "inputLlevaFlete"
);

const seccionDetalleFlete = document.getElementById(
    "seccionDetalleFlete"
);

const btnFleteDiurno = document.getElementById(
    "btnFleteDiurno"
);

const btnFleteNocturno = document.getElementById(
    "btnFleteNocturno"
);

const inputHorarioFlete = document.getElementById(
    "inputHorarioFlete"
);

const btnConvenioSi = document.getElementById(
    "btnConvenioSi"
);

const btnConvenioNo = document.getElementById(
    "btnConvenioNo"
);

const inputConvenio = document.getElementById(
    "inputConvenio"
);


// OBSERVACIONES

const seccionObservacionesRegistro = document.getElementById(
    "seccionObservacionesRegistro"
);

const inputObservacionesRegistro = document.getElementById(
    "inputObservacionesRegistro"
);


// RESUMEN

const seccionResumenRegistro = document.getElementById(
    "seccionResumenRegistro"
);

const contenidoResumenRegistro = document.getElementById(
    "contenidoResumenRegistro"
);


// BOTÓN

const seccionBotonRegistro = document.getElementById(
    "seccionBotonRegistro"
);

const btnRegistrarPaciente = document.getElementById(
    "btnRegistrarPaciente"
);


// MENSAJE

const mensajeRegistro = document.getElementById(
    "mensajeRegistro"
);


// MODAL CONFIRMACIÓN

const modalConfirmacionRegistro = document.getElementById(
    "modalConfirmacionRegistro"
);

const modalResumenRegistro = document.getElementById(
    "modalResumenRegistro"
);

const btnCancelarRegistro = document.getElementById(
    "btnCancelarRegistro"
);

const btnConfirmarRegistro = document.getElementById(
    "btnConfirmarRegistro"
);


// MODAL ÉXITO

const modalRegistroExitoso = document.getElementById(
    "modalRegistroExitoso"
);

const idRegistroCreado = document.getElementById(
    "idRegistroCreado"
);

const btnNuevoRegistro = document.getElementById(
    "btnNuevoRegistro"
);


// ==========================================================
// INICIALIZACIÓN
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

    reiniciarFormularioCompleto();

});


// ==========================================================
// CAMBIO DE SERVICIO
// ==========================================================

selectServicioRegistro.addEventListener("change", function () {

    servicioActual = normalizarServicio(
        selectServicioRegistro.value
    );

    reiniciarFlujoServicio();

    if (!servicioActual) return;


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
    // IMPLEMENTACIÓN / RECARGA / VENTA
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

    activarBoton(
        btnPacienteNuevo,
        btnPacienteRegistrado
    );

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

        mostrar(seccionRecargaNuevo);

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

    activarBoton(
        btnPacienteRegistrado,
        btnPacienteNuevo
    );

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

        mostrar(seccionRecargaRegistrado);

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

    ocultar(resultadosComunas);

    resultadosComunas.innerHTML = "";

});


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

});


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

btnConfirmarRegistro.addEventListener("click", function () {

    ocultarModal(modalConfirmacionRegistro);

    mostrarMensaje(
        "La validación del formulario es correcta. Falta conectar el registro con el servidor.",
        "exito"
    );

});


// ==========================================================
// NUEVO REGISTRO
// ==========================================================

btnNuevoRegistro.addEventListener("click", function () {

    ocultarModal(modalRegistroExitoso);

    reiniciarFormularioCompleto();

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
        tipoPacienteActual !== "NUEVO" &&
        tipoPacienteActual !== "REGISTRADO"
    ) {

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

        if (!pacienteSeleccionadoId.value) {

            throw new Error(
                "Debe buscar y seleccionar un paciente registrado."
            );

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

    if (
        servicioActual === "RECARGA" &&
        tipoPacienteActual === "NUEVO"
    ) {

        if (!selectCilindroRecargaNuevo.value) {

            throw new Error(
                "Debe seleccionar el cilindro que se va a recargar."
            );

        }

    }


    // ------------------------------------------------------
    // RECARGA REGISTRADO
    // ------------------------------------------------------

    if (
        servicioActual === "RECARGA" &&
        tipoPacienteActual === "REGISTRADO"
    ) {

        const cilindro = obtenerCilindroRegistradoSeleccionado();

        if (!cilindro) {

            throw new Error(
                "Debe seleccionar el cilindro que se va a recargar."
            );

        }

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
        servicioActual !== "VENTA"
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


    html += crearFilaResumen(
        "Servicio",
        servicioActual
    );


    // ------------------------------------------------------
    // PACIENTE
    // ------------------------------------------------------

    if (servicioActual === "RETIRO") {

        html += crearFilaResumen(
            "Paciente",
            pacienteSeleccionadoNombre.textContent.trim()
        );

    } else {

        html += crearFilaResumen(
            "Paciente",
            tipoPacienteActual === "NUEVO"
                ? inputNombrePaciente.value.trim()
                : pacienteSeleccionadoNombre.textContent.trim()
        );

        html += crearFilaResumen(
            "Tipo paciente",
            tipoPacienteActual
        );

    }


    // ------------------------------------------------------
    // PACIENTE NUEVO
    // ------------------------------------------------------

    if (tipoPacienteActual === "NUEVO") {

        html += crearFilaResumen(
            "RUT",
            inputRutPaciente.value.trim()
        );

        html += crearFilaResumen(
            "Teléfono",
            inputTelefonoPaciente.value.trim()
        );

        html += crearFilaResumen(
            "Email",
            inputEmailPaciente.value.trim()
        );

        html += crearFilaResumen(
            "Dirección",
            inputDireccionPaciente.value.trim()
        );

        html += crearFilaResumen(
            "Comuna",
            comunaSeleccionada.value.trim()
        );

    }


    // ------------------------------------------------------
    // PACIENTE REGISTRADO
    // ------------------------------------------------------

    if (
        tipoPacienteActual === "REGISTRADO" ||
        servicioActual === "RETIRO"
    ) {

        html += crearFilaResumen(
            "Dirección",
            pacienteSeleccionadoDireccion.textContent.trim()
        );

        html += crearFilaResumen(
            "Comuna",
            pacienteSeleccionadoComuna.textContent.trim()
        );

    }


    // ------------------------------------------------------
    // IMPLEMENTACIÓN
    // ------------------------------------------------------

    if (servicioActual === "IMPLEMENTACIÓN") {

        html += crearFilaResumen(
            "Tipo implementación",
            textoOpcionSeleccionada(
                selectTipoImplementacion
            )
        );

        html += crearFilaResumen(
            "Ciclo",
            textoOpcionSeleccionada(
                selectCicloImplementacion
            )
        );

    }


    // ------------------------------------------------------
    // RECARGA
    // ------------------------------------------------------

    if (servicioActual === "RECARGA") {

        const cilindro =
            tipoPacienteActual === "NUEVO"
                ? textoOpcionSeleccionada(
                    selectCilindroRecargaNuevo
                )
                : obtenerCilindroRegistradoSeleccionado();

        html += crearFilaResumen(
            "Cilindro",
            cilindro
        );

    }


    // ------------------------------------------------------
    // RETIRO
    // ------------------------------------------------------

    if (servicioActual === "RETIRO") {

        html += crearFilaResumen(
            "ID implementación origen",
            inputRetiroIdOrigen.value
        );

        html += crearFilaResumen(
            "Tipo implementación",
            retiroTipoOrigen.textContent.trim()
        );

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

    servicioActual = "";

    tipoPacienteActual = "";

    pacienteSeleccionado = null;

    llevaFleteActual = "";

    horarioFleteActual = "";

    convenioActual = "";


    ocultar(seccionTipoPaciente);

    ocultar(seccionBusquedaPaciente);

    ocultar(seccionDatosPaciente);

    ocultar(seccionImplementacion);

    ocultar(seccionRecargaRegistrado);

    ocultar(seccionRecargaNuevo);

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

}


// ==========================================================
// REINICIAR AL CAMBIAR SERVICIO
// ==========================================================

function reiniciarFlujoServicio() {

    tipoPacienteActual = "";

    pacienteSeleccionado = null;

    llevaFleteActual = "";

    horarioFleteActual = "";

    convenioActual = "";


    ocultar(seccionTipoPaciente);

    ocultar(seccionBusquedaPaciente);

    ocultar(seccionDatosPaciente);

    ocultar(seccionImplementacion);

    ocultar(seccionRecargaRegistrado);

    ocultar(seccionRecargaNuevo);

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


    pacienteSeleccionadoId.value =
        String(paciente.id || "").trim();


    pacienteSeleccionadoNombre.textContent =
        paciente.nombreMostrar ||
        paciente.nombre ||
        "-";


    pacienteSeleccionadoDireccion.textContent =
        paciente.direccion ||
        "-";


    pacienteSeleccionadoComuna.textContent =
        paciente.comuna ||
        "-";


    mostrar(pacienteSeleccionadoCard);


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

        cargarCilindrosPacienteRegistrado(
            paciente.cilindros || []
        );

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


// ==========================================================
// CARGAR CILINDROS RECARGA REGISTRADO
// ==========================================================

function cargarCilindrosPacienteRegistrado(cilindros) {

    listaCilindrosPaciente.innerHTML = "";


    cilindros.forEach(function (cilindro, index) {

        const nombre =
            typeof cilindro === "string"
                ? cilindro
                : cilindro.elemento;


        if (!nombre) return;


        const contenedor =
            document.createElement("div");

        contenedor.className = "opcion-servicio";


        const label =
            document.createElement("label");


        const radio =
            document.createElement("input");

        radio.type = "radio";

        radio.name = "cilindroPaciente";

        radio.value = nombre;

        radio.id =
            "cilindroPaciente_" + index;


        const texto =
            document.createElement("span");

        texto.textContent = nombre;


        label.appendChild(radio);

        label.appendChild(texto);

        contenedor.appendChild(label);

        listaCilindrosPaciente.appendChild(
            contenedor
        );

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