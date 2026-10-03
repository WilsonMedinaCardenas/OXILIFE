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

const MARCHA_BLANCA_EMPRESA = true;


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

const formRegistroEmpresa =
    document.getElementById("formRegistroEmpresa");

const selectServicioEmpresa =
    document.getElementById("selectServicioEmpresa");

const seccionEmpresa =
    document.getElementById("seccionEmpresa");

const inputRutEmpresa =
    document.getElementById("inputRutEmpresa");

const btnBuscarEmpresa =
    document.getElementById("btnBuscarEmpresa");

const mensajeBusquedaEmpresa =
    document.getElementById("mensajeBusquedaEmpresa");

const seccionEmpresaSeleccionada =
    document.getElementById("seccionEmpresaSeleccionada");

const empresaNombre =
    document.getElementById("empresaNombre");

const empresaRut =
    document.getElementById("empresaRut");

const empresaModalidad =
    document.getElementById("empresaModalidad");

const seccionModalidadMixta =
    document.getElementById("seccionModalidadMixta");

const btnDestinoEmpresa =
    document.getElementById("btnDestinoEmpresa");

const btnDestinoPaciente =
    document.getElementById("btnDestinoPaciente");

const seccionPacienteEmpresa =
    document.getElementById("seccionPacienteEmpresa");

const inputPacienteEmpresa =
    document.getElementById("inputPacienteEmpresa");

const inputDireccionPacienteEmpresa =
    document.getElementById("inputDireccionPacienteEmpresa");

const selectComunaPacienteEmpresa =
    document.getElementById("selectComunaPacienteEmpresa");

const seccionDireccionEmpresa =
    document.getElementById("seccionDireccionEmpresa");

const empresaDireccion =
    document.getElementById("empresaDireccion");

const empresaComuna =
    document.getElementById("empresaComuna");

const seccionDetalleEmpresa =
    document.getElementById("seccionDetalleEmpresa");

const contenedorProductosEmpresa =
    document.getElementById("contenedorProductosEmpresa");

const seccionTipoImplementacionEmpresa =
    document.getElementById("seccionTipoImplementacionEmpresa");

const selectTipoImplementacionEmpresa =
    document.getElementById("selectTipoImplementacionEmpresa");

const seccionProgramacionEmpresa =
    document.getElementById("seccionProgramacionEmpresa");

const inputFechaEmpresa =
    document.getElementById("inputFechaEmpresa");

const selectOperarioEmpresa =
    document.getElementById("selectOperarioEmpresa");

const selectVentanaEmpresa =
    document.getElementById("selectVentanaEmpresa");

const seccionFleteEmpresa =
    document.getElementById("seccionFleteEmpresa");

const btnFleteSiEmpresa =
    document.getElementById("btnFleteSiEmpresa");

const btnFleteNoEmpresa =
    document.getElementById("btnFleteNoEmpresa");

const seccionObservacionesEmpresa =
    document.getElementById("seccionObservacionesEmpresa");

const inputObservacionesEmpresa =
    document.getElementById("inputObservacionesEmpresa");

const seccionBotonEmpresa =
    document.getElementById("seccionBotonEmpresa");

const mensajeEmpresa =
    document.getElementById("mensajeEmpresa");

const modalConfirmacionEmpresa =
    document.getElementById("modalConfirmacionEmpresa");

const resumenConfirmacionEmpresa =
    document.getElementById("resumenConfirmacionEmpresa");

const btnVolverConfirmacionEmpresa =
    document.getElementById("btnVolverConfirmacionEmpresa");

const btnConfirmarEmpresa =
    document.getElementById("btnConfirmarEmpresa");

const modalExitoEmpresa =
    document.getElementById("modalExitoEmpresa");

const btnNuevoServicioEmpresa =
    document.getElementById("btnNuevoServicioEmpresa");

const btnReagendarEmpresa =
    document.getElementById("btnReagendarEmpresa");

const btnCancelarEmpresa =
    document.getElementById("btnCancelarEmpresa");


// ==========================================================
// INICIO
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    inicializarRegistroEmpresa
);


async function inicializarRegistroEmpresa() {

    const hoy = obtenerFechaLocalEmpresa();

    inputFechaEmpresa.min = hoy;
    inputFechaEmpresa.value = hoy;

    await cargarOperariosEmpresa();

}


// ==========================================================
// SERVICIO
// ==========================================================

selectServicioEmpresa.addEventListener(
    "change",
    function () {

        servicioEmpresaActual =
            normalizarTextoEmpresa(
                selectServicioEmpresa.value
            );

        reiniciarEmpresaSeleccionada();

        if (!servicioEmpresaActual) {

            ocultarEmpresa(seccionEmpresa);
            return;

        }

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

    const rut =
        inputRutEmpresa.value.trim();

    if (!rut) {

        mostrarMensajeBusqueda(
            "Ingrese el RUT de la empresa.",
            "error"
        );

        return;

    }


    // ======================================================
    // MARCHA BLANCA
    // SOLO PARA PROBAR EL FRONTEND
    // ======================================================

    if (MARCHA_BLANCA_EMPRESA) {

        empresaSeleccionada = {

            id: "PRUEBA-001",

            nombre:
                "EMPRESA MARCHA BLANCA",

            rut: rut,

            email:
                "prueba@empresa.cl",

            direccion:
                "DIRECCIÓN DE PRUEBA 123",

            comuna:
                "LAS CONDES",

            estado:
                "ACTIVO",

            productos:
                "OXÍGENO: 10M3, 0.7M3 | AIRE: 10M3",

            modalidad:
                "DIRECTO",

            sheet:
                "BLANCA"

        };

        pintarEmpresaSeleccionada();

        return;

    }


    // ======================================================
    // AQUÍ CONECTAREMOS EL GET REAL:
    //
    // modo=buscarEmpresaRegistro
    //
    // NO SE CREA TODAVÍA UNA RUTA FALSA.
    // ======================================================

}


// ==========================================================
// PINTAR EMPRESA
// ==========================================================

function pintarEmpresaSeleccionada() {

    if (!empresaSeleccionada) return;

    empresaNombre.textContent =
        empresaSeleccionada.nombre || "-";

    empresaRut.textContent =
        ocultarRutEmpresa(
            empresaSeleccionada.rut
        );

    empresaModalidad.textContent =
        empresaSeleccionada.modalidad || "-";

    empresaDireccion.textContent =
        empresaSeleccionada.direccion || "-";

    empresaComuna.textContent =
        empresaSeleccionada.comuna || "-";

    mostrarEmpresa(
        seccionEmpresaSeleccionada
    );

    procesarModalidadEmpresa();

    pintarDetalleServicioEmpresa();

    mostrarEmpresa(
        seccionProgramacionEmpresa
    );

    mostrarEmpresa(
        seccionFleteEmpresa
    );

    mostrarEmpresa(
        seccionObservacionesEmpresa
    );

    mostrarEmpresa(
        seccionBotonEmpresa
    );

}


// ==========================================================
// MODALIDAD
// ==========================================================

function procesarModalidadEmpresa() {

    const modalidad =
        normalizarTextoEmpresa(
            empresaSeleccionada.modalidad
        );

    destinoServicioEmpresa = "";

    ocultarEmpresa(
        seccionModalidadMixta
    );

    ocultarEmpresa(
        seccionPacienteEmpresa
    );

    ocultarEmpresa(
        seccionDireccionEmpresa
    );

    limpiarBotonesDestino();


    if (modalidad === "DIRECTO") {

        destinoServicioEmpresa =
            "EMPRESA";

        mostrarEmpresa(
            seccionDireccionEmpresa
        );

        return;

    }


    if (modalidad === "INDIRECTO") {

        destinoServicioEmpresa =
            "PACIENTE";

        mostrarEmpresa(
            seccionPacienteEmpresa
        );

        return;

    }


    if (modalidad === "MIXTO") {

        mostrarEmpresa(
            seccionModalidadMixta
        );

    }

}


// ==========================================================
// MIXTO
// ==========================================================

btnDestinoEmpresa.addEventListener(
    "click",
    function () {

        destinoServicioEmpresa =
            "EMPRESA";

        btnDestinoEmpresa.classList.add(
            "activo"
        );

        btnDestinoPaciente.classList.remove(
            "activo"
        );

        ocultarEmpresa(
            seccionPacienteEmpresa
        );

        mostrarEmpresa(
            seccionDireccionEmpresa
        );

    }
);


btnDestinoPaciente.addEventListener(
    "click",
    function () {

        destinoServicioEmpresa =
            "PACIENTE";

        btnDestinoPaciente.classList.add(
            "activo"
        );

        btnDestinoEmpresa.classList.remove(
            "activo"
        );

        ocultarEmpresa(
            seccionDireccionEmpresa
        );

        mostrarEmpresa(
            seccionPacienteEmpresa
        );

    }
);


// ==========================================================
// PRODUCTOS
// ==========================================================

function pintarDetalleServicioEmpresa() {

    contenedorProductosEmpresa.innerHTML =
        "";

    ocultarEmpresa(
        seccionTipoImplementacionEmpresa
    );

    const servicio =
        servicioEmpresaActual;


    // IMPLEMENTACIÓN
    // posteriormente TIPOS vendrá del catálogo real

    if (
        servicio.includes(
            "IMPLEMENTACIÓN"
        )
    ) {

        mostrarEmpresa(
            seccionTipoImplementacionEmpresa
        );

        cargarTiposImplementacionPrueba();

        ocultarEmpresa(
            seccionDetalleEmpresa
        );

        return;

    }


    // RETIRO / VENTA / VISITA
    // La lógica específica se conectará después
    // según catálogo.

    if (
        servicio === "RETIRO" ||
        servicio === "VENTA" ||
        servicio === "VISITA TÉCNICA"
    ) {

        ocultarEmpresa(
            seccionDetalleEmpresa
        );

        return;

    }


    if (
        !servicio.includes("RECARGA")
    ) {

        ocultarEmpresa(
            seccionDetalleEmpresa
        );

        return;

    }


    const productos =
        parsearProductosEmpresa(
            empresaSeleccionada.productos
        );


    const filtrados =
        filtrarProductosPorServicio(
            productos,
            servicio
        );


    if (!filtrados.length) {

        ocultarEmpresa(
            seccionDetalleEmpresa
        );

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

    const grupo =
        document.createElement("div");

    grupo.className =
        "grupo-producto-empresa";


    const titulo =
        document.createElement("h3");

    titulo.textContent =
        producto.gas;

    grupo.appendChild(titulo);


    producto.medidas.forEach(
        function (medida) {

            const fila =
                document.createElement("div");

            fila.className =
                "fila-producto-empresa";

            fila.dataset.gas =
                producto.gas;

            fila.dataset.medida =
                medida;


            const nombre =
                document.createElement("span");

            nombre.className =
                "nombre-medida-empresa";

            nombre.textContent =
                medida;


            const menos =
                document.createElement("button");

            menos.type = "button";
            menos.className =
                "btn-contador-empresa";

            menos.textContent = "−";


            const cantidad =
                document.createElement("span");

            cantidad.className =
                "cantidad-producto-empresa";

            cantidad.textContent = "0";

            cantidad.dataset.cantidad =
                "0";


            const mas =
                document.createElement("button");

            mas.type = "button";
            mas.className =
                "btn-contador-empresa";

            mas.textContent = "+";


            menos.addEventListener(
                "click",
                function () {

                    modificarCantidad(
                        cantidad,
                        -1
                    );

                }
            );


            mas.addEventListener(
                "click",
                function () {

                    modificarCantidad(
                        cantidad,
                        1
                    );

                }
            );


            fila.append(
                nombre,
                menos,
                cantidad,
                mas
            );

            grupo.appendChild(
                fila
            );

        }
    );


    contenedorProductosEmpresa.appendChild(
        grupo
    );

}


function modificarCantidad(
    elemento,
    cambio
) {

    const actual =
        Number(
            elemento.dataset.cantidad || 0
        );

    const nuevo =
        Math.max(
            0,
            actual + cambio
        );

    elemento.dataset.cantidad =
        String(nuevo);

    elemento.textContent =
        String(nuevo);

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

function cargarVentanasEmpresa(
    ventanasOcupadas = []
) {

    selectVentanaEmpresa.innerHTML =
        `<option value="">
            Seleccione un horario
        </option>`;


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
        inputFechaEmpresa.value;

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

            option.textContent +=
                " — OCUPADO";

        }


        selectVentanaEmpresa.appendChild(
            option
        );

    }

}


// ==========================================================
// SUBMIT
// ==========================================================

formRegistroEmpresa.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        ocultarMensajeGeneral();


        try {

            validarFormularioEmpresa();

            pintarResumenConfirmacion();

            mostrarEmpresa(
                modalConfirmacionEmpresa
            );

        } catch (error) {

            mostrarMensajeGeneral(
                error.message,
                "error"
            );

        }

    }
);


// ==========================================================
// VALIDACIÓN
// ==========================================================

function validarFormularioEmpresa() {

    if (!servicioEmpresaActual) {

        throw new Error(
            "Seleccione un servicio."
        );

    }


    if (!empresaSeleccionada) {

        throw new Error(
            "Debe seleccionar una empresa."
        );

    }


    if (!destinoServicioEmpresa) {

        throw new Error(
            "Debe indicar si el servicio corresponde a la empresa o a un paciente."
        );

    }


    if (
        destinoServicioEmpresa ===
        "PACIENTE"
    ) {

        if (
            !inputPacienteEmpresa.value.trim() ||
            !inputDireccionPacienteEmpresa.value.trim() ||
            !selectComunaPacienteEmpresa.value
        ) {

            throw new Error(
                "Complete los datos del paciente."
            );

        }

    }


    if (
        servicioEmpresaActual.includes(
            "RECARGA"
        ) &&
        !obtenerDetalleSolicitado().length
    ) {

        throw new Error(
            "Indique al menos una cantidad para la recarga."
        );

    }


    if (
        servicioEmpresaActual.includes(
            "IMPLEMENTACIÓN"
        ) &&
        !selectTipoImplementacionEmpresa.value
    ) {

        throw new Error(
            "Seleccione el tipo de implementación."
        );

    }


    if (
        !inputFechaEmpresa.value ||
        !selectOperarioEmpresa.value ||
        !selectVentanaEmpresa.value
    ) {

        throw new Error(
            "Complete la programación del servicio."
        );

    }


    if (!llevaFleteEmpresa) {

        throw new Error(
            "Indique si el servicio contabiliza flete."
        );

    }

}


// ==========================================================
// RESUMEN
// ==========================================================

function pintarResumenConfirmacion() {

    const detalle =
        obtenerDetalleSolicitado();


    const direccion =
        destinoServicioEmpresa ===
        "PACIENTE"
            ? inputDireccionPacienteEmpresa.value.trim()
            : empresaSeleccionada.direccion;


    const comuna =
        destinoServicioEmpresa ===
        "PACIENTE"
            ? selectComunaPacienteEmpresa.value
            : empresaSeleccionada.comuna;


    const paciente =
        destinoServicioEmpresa ===
        "PACIENTE"
            ? inputPacienteEmpresa.value.trim()
            : "";


    let detalleTexto =
        detalle
            .map(function (item) {

                return (
                    item.gas +
                    " " +
                    item.medida +
                    " × " +
                    item.cantidad
                );

            })
            .join("<br>");


    if (
        servicioEmpresaActual.includes(
            "IMPLEMENTACIÓN"
        )
    ) {

        detalleTexto =
            selectTipoImplementacionEmpresa.value;

    }


    resumenConfirmacionEmpresa.innerHTML = `

        ${datoResumen(
            "Servicio",
            servicioEmpresaActual
        )}

        ${datoResumen(
            "Cliente",
            empresaSeleccionada.nombre
        )}

        ${paciente
            ? datoResumen(
                "Paciente",
                paciente
            )
            : ""
        }

        ${datoResumen(
            "Dirección",
            direccion
        )}

        ${datoResumen(
            "Comuna",
            comuna
        )}

        ${detalleTexto
            ? datoResumen(
                "Detalle",
                detalleTexto,
                true
            )
            : ""
        }

        ${datoResumen(
            "Fecha",
            inputFechaEmpresa.value
        )}

        ${datoResumen(
            "Ventana",
            selectVentanaEmpresa.value
        )}

        ${datoResumen(
            "Operario",
            selectOperarioEmpresa.value
        )}

        ${datoResumen(
            "Flete",
            llevaFleteEmpresa
        )}

    `;

}


// ==========================================================
// CONFIRMACIÓN
// ==========================================================

btnVolverConfirmacionEmpresa.addEventListener(
    "click",
    function () {

        ocultarEmpresa(
            modalConfirmacionEmpresa
        );

    }
);


btnConfirmarEmpresa.addEventListener(
    "click",
    function () {

        if (!solicitudIdEmpresa) {

            solicitudIdEmpresa =
                generarIdSolicitudEmpresa();

        }


        const payload =
            construirPayloadEmpresa();


        console.log(
            "PAYLOAD EMPRESA - MARCHA BLANCA",
            payload
        );


        ocultarEmpresa(
            modalConfirmacionEmpresa
        );


        mostrarEmpresa(
            modalExitoEmpresa
        );


        // ==================================================
        // EN LA SIGUIENTE ETAPA:
        //
        // ESTE payload SE ENVIARÁ AL WORKER
        // Y SE GUARDARÁ EN BLANCA.
        // ==================================================

    }
);


// ==========================================================
// CONSTRUIR PAYLOAD
// ==========================================================

function construirPayloadEmpresa() {

    const esPaciente =
        destinoServicioEmpresa ===
        "PACIENTE";


    return {

        tipoCliente:
            "REGISTRO_EMPRESA_OFICINA",

        solicitudId:
            solicitudIdEmpresa,

        clienteId:
            empresaSeleccionada.id,

        cliente:
            empresaSeleccionada.nombre,

        rut:
            empresaSeleccionada.rut,

        email:
            empresaSeleccionada.email,

        modalidadServicio:
            destinoServicioEmpresa,

        paciente:
            esPaciente
                ? inputPacienteEmpresa.value.trim()
                : "",

        direccion:
            esPaciente
                ? inputDireccionPacienteEmpresa.value.trim()
                : empresaSeleccionada.direccion,

        comuna:
            esPaciente
                ? selectComunaPacienteEmpresa.value
                : empresaSeleccionada.comuna,

        servicio:
            servicioEmpresaActual,

        tipo:
            servicioEmpresaActual.includes(
                "IMPLEMENTACIÓN"
            )
                ? selectTipoImplementacionEmpresa.value
                : "",

        detalleSolicitado:
            obtenerDetalleSolicitado(),

        estado:
            "PENDIENTE",

        fechaProgramada:
            inputFechaEmpresa.value,

        ventanaHoraria:
            selectVentanaEmpresa.value,

        operarioAsignado:
            selectOperarioEmpresa.value,

        observaciones:
            inputObservacionesEmpresa.value.trim(),

        llevaFlete:
            llevaFleteEmpresa,

        sheet:
            "BLANCA"

    };

}


// ==========================================================
// NUEVO SERVICIO
// ==========================================================

btnNuevoServicioEmpresa.addEventListener(
    "click",
    function () {

        ocultarEmpresa(
            modalExitoEmpresa
        );

        formRegistroEmpresa.reset();

        reiniciarEmpresaSeleccionada();

        solicitudIdEmpresa = "";

        servicioEmpresaActual = "";

        llevaFleteEmpresa = "";

        inputFechaEmpresa.value =
            obtenerFechaLocalEmpresa();

    }
);


// ==========================================================
// GESTIONES
// TODAVÍA NO CONECTADAS
// ==========================================================

btnReagendarEmpresa.addEventListener(
    "click",
    function () {

        mostrarMensajeGeneral(
            "Reagendamiento Empresa se conectará después de crear el registro Empresa en BLANCA.",
            "error"
        );

    }
);


btnCancelarEmpresa.addEventListener(
    "click",
    function () {

        mostrarMensajeGeneral(
            "Cancelación Empresa se conectará después de crear el registro Empresa en BLANCA.",
            "error"
        );

    }
);


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
    destinoServicioEmpresa = "";
    llevaFleteEmpresa = "";

    inputRutEmpresa.value = "";

    inputPacienteEmpresa.value = "";

    inputDireccionPacienteEmpresa.value = "";

    selectComunaPacienteEmpresa.value = "";

    inputObservacionesEmpresa.value = "";

    contenedorProductosEmpresa.innerHTML =
        "";

    limpiarBotonesDestino();

    btnFleteSiEmpresa.classList.remove(
        "activo"
    );

    btnFleteNoEmpresa.classList.remove(
        "activo"
    );


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

    ].forEach(
        ocultarEmpresa
    );

}


// ==========================================================
// UTILIDADES
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


function limpiarBotonesDestino() {

    btnDestinoEmpresa.classList.remove(
        "activo"
    );

    btnDestinoPaciente.classList.remove(
        "activo"
    );

}


function normalizarTextoEmpresa(valor) {

    return String(valor || "")
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace("OXIGENO", "OXÍGENO")
        .replace("NITROGENO", "NITRÓGENO")
        .replace("IMPLEMENTACION", "IMPLEMENTACIÓN");

}


function obtenerFechaLocalEmpresa() {

    const ahora =
        new Date();

    const offset =
        ahora.getTimezoneOffset();

    const local =
        new Date(
            ahora.getTime() -
            offset * 60000
        );

    return local
        .toISOString()
        .slice(0, 10);

}


function convertirMinutosEmpresa(
    total
) {

    const minutosDia =
        ((total % 1440) + 1440) %
        1440;

    const horas =
        Math.floor(
            minutosDia / 60
        );

    const minutos =
        minutosDia % 60;

    return (
        String(horas).padStart(
            2,
            "0"
        ) +
        ":" +
        String(minutos).padStart(
            2,
            "0"
        )
    );

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