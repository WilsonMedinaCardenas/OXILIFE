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

    empresaNombre.textContent =
        empresaSeleccionada.nombre || "-";

    empresaRut.textContent =
        ocultarRutEmpresa(
            empresaSeleccionada.rut
        );

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

    const grupo = document.createElement("div");
    grupo.className = "grupo-producto-empresa";

    /*
     * NOMBRE DEL GAS
     * OXÍGENO / AIRE / NITRÓGENO / CO₂...
     */
    const titulo = document.createElement("h3");

    titulo.textContent =
        String(producto.gas || "").trim();

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

        fila.dataset.gas =
            String(producto.gas || "").trim();

        fila.dataset.medida =
            String(medida || "").trim();


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

        nombre.className =
            "nombre-medida-empresa";

        nombre.textContent =
            String(medida || "").trim();

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

        const menos =
            document.createElement("button");

        menos.type = "button";

        menos.className =
            "btn-contador-empresa";

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

        const cantidad =
            document.createElement("span");

        cantidad.className =
            "cantidad-producto-empresa";

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

        const mas =
            document.createElement("button");

        mas.type = "button";

        mas.className =
            "btn-contador-empresa";

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


        /*
         * ORDEN EXACTO DE IZQUIERDA A DERECHA:
         *
         * MEDIDA | MENOS | CONTADOR | MÁS
         */
        fila.append(
            nombre,
            menos,
            cantidad,
            mas
        );


        grupo.appendChild(fila);

    });


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
    if (servicioEmpresaActual.includes("RECARGA") && !obtenerDetalleSolicitado().length) {
        throw new Error("Indique al menos una cantidad para la recarga.");
    }

    if (servicioEmpresaActual.includes("IMPLEMENTACIÓN") && !selectTipoImplementacionEmpresa.value) {
        throw new Error( "Seleccione el tipo de implementación.");
    }
    if (
        !inputFechaEmpresa.value ||
        !selectOperarioEmpresa.value ||
        !selectVentanaEmpresa.value
    ) {throw new Error("Complete la programación del servicio.");}

    if (!llevaFleteEmpresa) {throw new Error( "Indique si el servicio contabiliza flete.");}

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
        ${datoResumen( "Flete", llevaFleteEmpresa)}
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
        llevaFlete: llevaFleteEmpresa,
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

async function buscarServiciosGestionEmpresa(
    buscar
) {

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

function seleccionarServicioGestionEmpresa(
    servicio
) {

    servicioGestionSeleccionadoEmpresa =
        servicio;

    solicitudGestionIdEmpresa = "";


    ocultarEmpresa(
        resultadosGestionServicioEmpresa
    );

    ocultarEmpresa(
        accionesCerrarGestionEmpresa
    );


    const cliente =
        servicio.cliente ||
        servicio.nombre ||
        "";

    const paciente =
        servicio.paciente ||
        "";


    resumenGestionServicioEmpresa.innerHTML =

        datoResumen(
            "ID",
            servicio.id || ""
        ) +

        datoResumen(
            "Empresa",
            cliente
        ) +

        (
            paciente
                ? datoResumen(
                    "Paciente",
                    paciente
                )
                : ""
        ) +

        datoResumen(
            "Servicio",
            servicio.servicio || ""
        ) +

        datoResumen(
            "Dirección",
            servicio.direccion || ""
        ) +

        datoResumen(
            "Comuna",
            servicio.comuna || ""
        ) +

        datoResumen(
            "Fecha actual",
            formatearFechaGestionEmpresa(
                servicio.fechaProgramada
            )
        ) +

        datoResumen(
            "Programación actual",
            servicio.ventanaHoraria || ""
        ) +

        datoResumen(
            "Operario actual",
            servicio.operarioAsignado || ""
        );


    mostrarEmpresa(
        detalleGestionServicioEmpresa
    );


    if (
        tipoGestionActualEmpresa ===
        "REAGENDAR"
    ) {

        mostrarEmpresa(
            nuevaProgramacionGestionEmpresa
        );


        inputAtencionInmediataGestionEmpresa.value =
            "NO";

        btnAtencionInmediataGestionEmpresa
            .classList
            .remove(
                "activo"
            );


        selectNuevaVentanaGestionEmpresa.disabled =
            false;


        const hoy =
            obtenerFechaLocalEmpresa();


        inputNuevaFechaGestionEmpresa.value =
            hoy;

        inputNuevaFechaGestionEmpresa.min =
            hoy;


        cargarOperariosGestionEmpresa(
            servicio.operarioAsignado
        );


        actualizarDisponibilidadGestionEmpresa();


        btnConfirmarGestionServicioEmpresa.textContent =
            "Confirmar reagendamiento";


    } else {

        ocultarEmpresa(
            nuevaProgramacionGestionEmpresa
        );


        btnConfirmarGestionServicioEmpresa.textContent =
            "Confirmar cancelación";

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

        if (!servicioGestionSeleccionadoEmpresa) {
            return;
        }


        if (tipoGestionActualEmpresa === "REAGENDAR" &&
            (
                !inputNuevaFechaGestionEmpresa.value ||
                !selectNuevoOperarioGestionEmpresa.value ||
                !selectNuevaVentanaGestionEmpresa.value
            )
        ) {

            mostrarMensajeGeneral(
                "Debe seleccionar nueva fecha, operario y ventana horaria.",
                "error"
            );

            return;

        }


        if (!solicitudGestionIdEmpresa) {

            solicitudGestionIdEmpresa = generarIdSolicitudEmpresa();

        }


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

            }

            const respuesta = await fetch("/api/oxitrack/", {method: "POST",body: payload});
            const resultado = await respuesta.json();

            if (!respuesta.ok || resultado.ok !== true) {

                throw new Error(resultado.error || "No fue posible gestionar el servicio.");

            }

            ocultarEmpresa(modalGestionServicioEmpresa);
            mostrarMensajeGeneral(tipoGestionActualEmpresa === "REAGENDAR" ? "Servicio reagendado correctamente." : "Servicio cancelado correctamente.", "exito");

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