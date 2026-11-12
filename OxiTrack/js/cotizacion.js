"use strict";

const cot = id => document.getElementById(id);
const estadoCot = {servicio:"",ciclo:"",comuna:"",flete:false,horario:"DIURNO",insumos:false,garantia:0};
let catalogoCotizaciones = null;
let borradorRevisadoCotizacion = false;

function invalidarBorradorCotizacion() {
    borradorRevisadoCotizacion = false;
    cot("cotCrear").disabled = true;
    cot("cotCompartir").hidden = true;
}

function mensajeCotizacion(texto) {
    cot("cotMensaje").textContent = texto;
    cot("cotMensaje").hidden = !texto;
}

function seleccionarCotizacion(si,no,activo) {
    cot(si).classList.toggle("activo",activo);
    cot(no).classList.toggle("activo",!activo);
}

function llenarSelectCotizacion(id,valores,placeholder) {
    const select = cot(id);
    select.replaceChildren(new Option(placeholder,""));
    valores.forEach(valor => select.add(new Option(valor,valor)));
    select.disabled = false;
}

async function consultarCotizacion(modo) {
    const respuesta = await fetch("/api/oxitrack/?modo=" + encodeURIComponent(modo),{
        method:"GET",headers:{Accept:"application/json"},cache:"no-store"
    });
    const datos = await respuesta.json();
    if (!respuesta.ok || datos.ok !== true) throw new Error(datos.error || "No fue posible consultar " + modo);
    return datos;
}

async function iniciarCotizacion() {
    try {
        const perfil = await consultarCotizacion("perfilUsuario");
        if (!Array.isArray(perfil.permisos) || !perfil.permisos.includes("OFICINA")) {
            location.replace("./");
            return;
        }
        document.documentElement.classList.add("oficina-autorizada");

        catalogoCotizaciones = await consultarCotizacion("catalogoCotizaciones");
        if (!Array.isArray(catalogoCotizaciones.comunas) || !Array.isArray(catalogoCotizaciones.servicios) || !Array.isArray(catalogoCotizaciones.tarifas)) throw new Error("Catálogo de cotizaciones no válido.");
        llenarSelectCotizacion("cotComuna",catalogoCotizaciones.comunas.map(c => c.nombre),"Seleccione una comuna");
        llenarSelectCotizacion("cotServicio",catalogoCotizaciones.servicios.map(s => s.tipo),"Seleccione un servicio");
    } catch (error) {
        document.documentElement.classList.add("oficina-autorizada");
        mensajeCotizacion(error.message);
    }
}
cot("cotServicio").addEventListener("change",e => {
    estadoCot.servicio = e.target.value;
    estadoCot.ciclo = "";
    const servicio = catalogoCotizaciones.servicios.find(s => s.tipo === estadoCot.servicio);
    const ciclos = [...new Set(catalogoCotizaciones.tarifas.filter(t => t.concepto === "ARRIENDO" && t.tipo === estadoCot.servicio.toUpperCase()).map(t => t.ciclo))];
    llenarSelectCotizacion("cotCiclo",ciclos.sort((a,b) => Number(b)-Number(a)),"Seleccione un ciclo");
    estadoCot.garantia = servicio ? servicio.valorGarantia : 0;
    cot("cotGarantia").textContent = servicio && servicio.garantia ? "GARANTÍA REEMBOLSABLE: " + new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(servicio.valorGarantia) : "ESTE SERVICIO NO REQUIERE GARANTÍA";
});
cot("cotCiclo").addEventListener("change",e => estadoCot.ciclo = e.target.value);
cot("cotComuna").addEventListener("change",e => estadoCot.comuna = e.target.value);
cot("cotFleteSi").addEventListener("click",() => {estadoCot.flete = true;seleccionarCotizacion("cotFleteSi","cotFleteNo",true);
    cot("cotHorarioGrupo").hidden = false;});
cot("cotFleteNo").addEventListener("click",() => {estadoCot.flete = false;
    seleccionarCotizacion("cotFleteSi","cotFleteNo",false);cot("cotHorarioGrupo").hidden = true;});
cot("cotDiurno").addEventListener("click",() => {estadoCot.horario = "DIURNO";seleccionarCotizacion("cotDiurno","cotNocturno",true);});
cot("cotNocturno").addEventListener("click",() => {estadoCot.horario = "NOCTURNO";seleccionarCotizacion("cotDiurno","cotNocturno",false);});
cot("cotInsumosSi").addEventListener("click",() => {estadoCot.insumos = true;seleccionarCotizacion("cotInsumosSi","cotInsumosNo",true);});
cot("cotInsumosNo").addEventListener("click",() => {estadoCot.insumos = false;seleccionarCotizacion("cotInsumosSi","cotInsumosNo",false);});

async function ejecutarCotizacion(crear) {
    const servicio = catalogoCotizaciones?.servicios.find(s => s.tipo === estadoCot.servicio);
    if (!servicio || !estadoCot.ciclo || !estadoCot.comuna) {
        mensajeCotizacion("Seleccione servicio, ciclo y comuna.");
        return;
    }

    if (crear && !borradorRevisadoCotizacion) {
        mensajeCotizacion("Primero genere y revise el borrador.");
        return;
    }

    const boton = cot(crear ? "cotCrear" : "cotBorrador");
    boton.disabled = true;
    mensajeCotizacion("");

    const ventanaBorrador = crear ? null : window.open("about:blank", "_blank");

    if (ventanaBorrador) {
        ventanaBorrador.document.title = "Preparando borrador Oxilife";
        ventanaBorrador.document.body.textContent = "Generando vista previa...";
    }

    try {
        const datos = new FormData();
        datos.set("tipoCliente","COTIZACION_OFICINA");
        datos.set("servicio",estadoCot.servicio);
        datos.set("ciclo",estadoCot.ciclo);
        datos.set("comuna",estadoCot.comuna);
        datos.set("horario",estadoCot.horario);
        datos.set("flete",String(estadoCot.flete));
        datos.set("insumos",String(estadoCot.insumos));
        datos.set("crear",String(crear));

        const respuesta = await fetch("/api/oxitrack/",{method:"POST",body:datos});
        const resultado = await respuesta.json();

        if (!respuesta.ok || resultado.ok !== true) {
            throw new Error(resultado.error || "No fue posible generar la cotización.");
        }

        const bytes = Uint8Array.from(atob(resultado.pdfBase64),c => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));

                if (crear) {
            const enlace = document.createElement("a");
            enlace.href = url;
            enlace.download = resultado.nombre;
            enlace.click();

            invalidarBorradorCotizacion();
        } else {
            borradorRevisadoCotizacion = true;
            cot("cotCrear").disabled = false;

            if (ventanaBorrador && !ventanaBorrador.closed) {
                ventanaBorrador.location.replace(url);
            } else {
                mensajeCotizacion(
                    "Borrador generado. Utilice Compartir / Descargar PDF para revisarlo."
                );
            }
        }
    } catch (error) {
        if (ventanaBorrador && !ventanaBorrador.closed) {
            ventanaBorrador.close();
        }
        mensajeCotizacion(error.message);
    } finally {
        boton.disabled = crear ? !borradorRevisadoCotizacion : false;
    }
}

cot("cotBorrador").disabled = false;
cot("cotCrear").disabled = true;

[
    "cotServicio", "cotCiclo", "cotComuna",
    "cotFleteSi", "cotFleteNo",
    "cotDiurno", "cotNocturno",
    "cotInsumosSi", "cotInsumosNo"
].forEach(id => {
    cot(id).addEventListener(
        ["cotServicio", "cotCiclo", "cotComuna"].includes(id) ? "change" : "click",
        invalidarBorradorCotizacion
    );
});
cot("cotBorrador").addEventListener("click",() => ejecutarCotizacion(false));
cot("cotCrear").addEventListener("click",() => ejecutarCotizacion(true));

iniciarCotizacion();