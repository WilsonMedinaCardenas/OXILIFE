"use strict";

(() => {

    // ==========================================================
    // ESTADO
    // ==========================================================

    let empresaSeleccionada = null;
    let servicioEmpresaActual = "";
    let atencionInmediataEmpresa = false;


    // ==========================================================
    // SELECTOR EMPRESA / PARTICULAR
    // ==========================================================

    const selectorTipoGestion = document.getElementById("selectorTipoGestion");
    const btnGestionEmpresa = document.getElementById("btnGestionEmpresa");
    const btnGestionParticular = document.getElementById("btnGestionParticular");

    const moduloEmpresaOficina = document.getElementById("moduloEmpresaOficina");
    const moduloParticularOficina = document.getElementById("moduloParticularOficina");


    // ==========================================================
    // EMPRESA
    // ==========================================================

    const formRegistroEmpresa = document.getElementById("formRegistroEmpresa");

    const inputBuscarEmpresa = document.getElementById("inputBuscarEmpresa");
    const resultadosBusquedaEmpresa = document.getElementById("resultadosBusquedaEmpresa");

    const seccionEmpresaSeleccionada = document.getElementById("seccionEmpresaSeleccionada");

    const empresaSeleccionadaId = document.getElementById("empresaSeleccionadaId");
    const empresaSeleccionadaNombre = document.getElementById("empresaSeleccionadaNombre");
    const empresaSeleccionadaRut = document.getElementById("empresaSeleccionadaRut");
    const empresaSeleccionadaDireccion = document.getElementById("empresaSeleccionadaDireccion");
    const empresaSeleccionadaComuna = document.getElementById("empresaSeleccionadaComuna");


    // ==========================================================
    // SERVICIO
    // ==========================================================

    const seccionServicioEmpresa = document.getElementById("seccionServicioEmpresa");
    const selectServicioEmpresa = document.getElementById("selectServicioEmpresa");

    const seccionDatosServicioEmpresa = document.getElementById("seccionDatosServicioEmpresa");
    const selectGasEmpresa = document.getElementById("selectGasEmpresa");
    const selectCilindroEmpresa = document.getElementById("selectCilindroEmpresa");
    const inputCantidadEmpresa = document.getElementById("inputCantidadEmpresa");
    const selectModalidadEmpresa = document.getElementById("selectModalidadEmpresa");


    // ==========================================================
    // PROGRAMACIÓN
    // ==========================================================

    const seccionProgramacionEmpresa = document.getElementById("seccionProgramacionEmpresa");

    const inputFechaEmpresa = document.getElementById("inputFechaEmpresa");
    const selectOperarioEmpresa = document.getElementById("selectOperarioEmpresa");
    const selectVentanaEmpresa = document.getElementById("selectVentanaEmpresa");

    const btnAtencionInmediataEmpresa = document.getElementById("btnAtencionInmediataEmpresa");
    const inputAtencionInmediataEmpresa = document.getElementById("inputAtencionInmediataEmpresa");


    // ==========================================================
    // OBSERVACIONES / BOTÓN
    // ==========================================================

    const seccionObservacionesEmpresa = document.getElementById("seccionObservacionesEmpresa");
    const inputObservacionesEmpresa = document.getElementById("inputObservacionesEmpresa");

    const seccionBotonEmpresa = document.getElementById("seccionBotonEmpresa");
    const mensajeEmpresa = document.getElementById("mensajeEmpresa");


    // ==========================================================
    // SELECTOR PRINCIPAL
    // ==========================================================

    btnGestionEmpresa.addEventListener("click", function () {

        ocultarEmpresa(selectorTipoGestion);
        ocultarEmpresa(moduloParticularOficina);
        mostrarEmpresa(moduloEmpresaOficina);

        reiniciarEmpresa();

    });


    btnGestionParticular.addEventListener("click", function () {

        ocultarEmpresa(selectorTipoGestion);
        ocultarEmpresa(moduloEmpresaOficina);
        mostrarEmpresa(moduloParticularOficina);

    });


    // ==========================================================
    // CAMBIO SERVICIO EMPRESA
    // ==========================================================

    selectServicioEmpresa.addEventListener("change", function () {

        servicioEmpresaActual = String(
            selectServicioEmpresa.value || ""
        ).trim().toUpperCase();

        if (!servicioEmpresaActual) {

            ocultarEmpresa(seccionDatosServicioEmpresa);
            ocultarEmpresa(seccionProgramacionEmpresa);
            ocultarEmpresa(seccionObservacionesEmpresa);
            ocultarEmpresa(seccionBotonEmpresa);

            return;
        }

        mostrarEmpresa(seccionDatosServicioEmpresa);
        mostrarEmpresa(seccionProgramacionEmpresa);
        mostrarEmpresa(seccionObservacionesEmpresa);
        mostrarEmpresa(seccionBotonEmpresa);

    });


    // ==========================================================
    // ATENCIÓN INMEDIATA
    // ==========================================================

    btnAtencionInmediataEmpresa.addEventListener("click", function () {

        atencionInmediataEmpresa = !atencionInmediataEmpresa;

        inputAtencionInmediataEmpresa.value =
            atencionInmediataEmpresa ? "SI" : "NO";

        btnAtencionInmediataEmpresa.classList.toggle(
            "activo",
            atencionInmediataEmpresa
        );

        if (atencionInmediataEmpresa) {

            inputFechaEmpresa.value = obtenerFechaLocalEmpresa();

            selectVentanaEmpresa.value = "";
            selectVentanaEmpresa.disabled = true;

        } else {

            selectVentanaEmpresa.disabled = false;

        }

    });


    // ==========================================================
    // SUBMIT
    // POR AHORA SOLO FRONTEND
    // ==========================================================

    formRegistroEmpresa.addEventListener("submit", function (event) {

        event.preventDefault();

        ocultarMensajeEmpresa();

        try {

            validarEmpresaFrontend();

            mostrarMensajeEmpresa(
                "El formulario de Empresa está correcto. Falta conectar el backend.",
                "exito"
            );

        } catch (error) {

            mostrarMensajeEmpresa(
                error.message,
                "error"
            );

        }

    });


    // ==========================================================
    // VALIDACIÓN FRONTEND
    // ==========================================================

    function validarEmpresaFrontend() {

        if (!empresaSeleccionadaId.value) {
            throw new Error("Debe seleccionar una empresa.");
        }

        if (!servicioEmpresaActual) {
            throw new Error("Debe seleccionar un tipo de servicio.");
        }

        if (!selectGasEmpresa.value) {
            throw new Error("Debe seleccionar el gas.");
        }

        if (!selectCilindroEmpresa.value) {
            throw new Error("Debe seleccionar la medida del cilindro.");
        }

        const cantidad = Number(inputCantidadEmpresa.value);

        if (!Number.isInteger(cantidad) || cantidad < 1) {
            throw new Error("Debe ingresar una cantidad válida.");
        }

        if (!selectModalidadEmpresa.value) {
            throw new Error("Debe seleccionar la modalidad.");
        }

        if (!inputFechaEmpresa.value) {
            throw new Error("Debe seleccionar la fecha del servicio.");
        }

        if (!selectOperarioEmpresa.value) {
            throw new Error("Debe seleccionar el operario.");
        }

        if (
            !atencionInmediataEmpresa &&
            !selectVentanaEmpresa.value
        ) {
            throw new Error("Debe seleccionar una ventana horaria.");
        }

        return true;

    }


    // ==========================================================
    // REINICIAR EMPRESA
    // ==========================================================

    function reiniciarEmpresa() {

        formRegistroEmpresa.reset();

        empresaSeleccionada = null;
        servicioEmpresaActual = "";
        atencionInmediataEmpresa = false;

        empresaSeleccionadaId.value = "";

        empresaSeleccionadaNombre.textContent = "-";
        empresaSeleccionadaRut.textContent = "-";
        empresaSeleccionadaDireccion.textContent = "-";
        empresaSeleccionadaComuna.textContent = "-";

        inputAtencionInmediataEmpresa.value = "NO";

        btnAtencionInmediataEmpresa.classList.remove("activo");

        inputFechaEmpresa.value = obtenerFechaLocalEmpresa();

        ocultarEmpresa(resultadosBusquedaEmpresa);
        ocultarEmpresa(seccionEmpresaSeleccionada);
        ocultarEmpresa(seccionServicioEmpresa);
        ocultarEmpresa(seccionDatosServicioEmpresa);
        ocultarEmpresa(seccionProgramacionEmpresa);
        ocultarEmpresa(seccionObservacionesEmpresa);
        ocultarEmpresa(seccionBotonEmpresa);

        ocultarMensajeEmpresa();

    }


    // ==========================================================
    // FECHA LOCAL
    // ==========================================================

    function obtenerFechaLocalEmpresa() {

        const ahora = new Date();

        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;

    }


    // ==========================================================
    // HELPERS PROPIOS DE EMPRESA
    // NO DEPENDEN DEL JS PARTICULAR
    // ==========================================================

    function mostrarEmpresa(elemento) {

        if (elemento) {
            elemento.hidden = false;
        }

    }


    function ocultarEmpresa(elemento) {

        if (elemento) {
            elemento.hidden = true;
        }

    }


    function mostrarMensajeEmpresa(texto, tipo) {

        mensajeEmpresa.textContent = texto;

        mensajeEmpresa.className =
            "mensaje-registro " +
            (tipo === "error" ? "error" : "exito");

        mostrarEmpresa(mensajeEmpresa);

    }


    function ocultarMensajeEmpresa() {

        mensajeEmpresa.textContent = "";
        mensajeEmpresa.className = "mensaje-registro";

        ocultarEmpresa(mensajeEmpresa);

    }


    // ==========================================================
    // INICIALIZACIÓN
    // ==========================================================

    document.addEventListener("DOMContentLoaded", function () {

        ocultarEmpresa(moduloEmpresaOficina);
        ocultarEmpresa(moduloParticularOficina);

        mostrarEmpresa(selectorTipoGestion);

        reiniciarEmpresa();

    });

})();