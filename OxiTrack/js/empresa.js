
"use strict";

const WORKER_URL = "https://oxilife.cl/api/oxitrack/";
const $ = id => document.getElementById(id);
const normalizar = valor => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();

let emailOperario = "", nombreOperario = "", asignaciones = [], asignacionActual = null;
let firmaPad = null, ubicacion = "No disponible", enviando = false, sincronizando = false;
let solicitudConsulta = 0;

const claveLocal = nombre => `oxitrack_empresa_v2_${emailOperario}_${nombre}`;

function leerLocal(clave, defecto) {
  try { return JSON.parse(localStorage.getItem(clave)) ?? defecto; }
  catch (_) { return defecto; }
}

function guardarLocal(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function informar(texto) {
  $("resultado").textContent = texto;
}

function actualizarEstado() {
  $("estadoConexion").textContent = navigator.onLine ? "Conexión disponible" : "Sin conexión. Trabajando con datos guardados.";
  $("cola").textContent = `Envíos pendientes: ${leerLocal(claveLocal("cola"), []).length}`;
}

async function consultar(modo, parametros = {}) {
  const url = new URL(WORKER_URL);
  url.searchParams.set("modo", modo);
  Object.entries(parametros).forEach(([nombre, valor]) => url.searchParams.set(nombre, valor));
  const respuesta = await fetch(url, { credentials: "same-origin", cache: "no-store" });
  const datos = await respuesta.json();
  if (!respuesta.ok || datos.ok !== true) throw new Error(datos.error || "Error de consulta.");
  return datos;
}

function agregarOpcion(select, valor, texto) {
  const opcion = document.createElement("option");
  opcion.value = valor;
  opcion.textContent = texto;
  select.appendChild(opcion);
}

function obtenerPendientesLocales() {
  return new Set(leerLocal(claveLocal("cola"), []).map(item => String(item.id)));
}

async function iniciar() {
  try {
    const perfil = await consultar("perfilUsuario");
    emailOperario = String(perfil.email || "").trim().toLowerCase();
    nombreOperario = String(perfil.operario || "").trim();
    if (!emailOperario || !nombreOperario) throw new Error("El perfil no devolvió correo y operario.");
    $("operarioVisible").textContent = `Operario: ${nombreOperario}`;
  } catch (error) {
    informar(`No se pudo identificar al operador: ${error.message}`);
    $("servicio").disabled = true;
    return;
  }

  if (typeof SignaturePad === "undefined") {
    informar("No se pudo cargar la biblioteca de firma. Conéctese a internet y vuelva a cargar.");
    return;
  }

  firmaPad = new SignaturePad($("firma"));

  $("servicio").addEventListener("change", cargarAsignaciones);
  $("asignacion").addEventListener("change", mostrarAsignacion);
  $("limpiarFirma").addEventListener("click", () => firmaPad.clear());
  $("formulario").addEventListener("submit", evento => {
    evento.preventDefault();
    registrarServicio("ATENDIDO");
  });
  $("noRealizado").addEventListener("click", () => registrarServicio("NO REALIZADO"));
  $("sincronizar").addEventListener("click", sincronizarPendientes);

  window.addEventListener("online", () => {
    actualizarEstado();
    sincronizarPendientes();
  });
  window.addEventListener("offline", actualizarEstado);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && navigator.onLine) sincronizarPendientes();
  });

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      posicion => { ubicacion = `${posicion.coords.latitude},${posicion.coords.longitude}`; },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 12000 }
    );
  }

  try {
    const datos = await consultar("serviciosEmpresa");
    if (!Array.isArray(datos.servicios)) throw new Error("Catálogo de servicios inválido.");
    guardarLocal(claveLocal("servicios"), datos.servicios);
  } catch (error) {
    informar(`Se utilizará el catálogo local: ${error.message}`);
  }

  const servicios = leerLocal(claveLocal("servicios"), []);
  $("servicio").replaceChildren();
  agregarOpcion($("servicio"), "", "Seleccione un servicio");
  servicios.forEach(servicio => agregarOpcion($("servicio"), servicio, servicio));

  actualizarEstado();
  if (navigator.onLine) sincronizarPendientes();
}

async function cargarAsignaciones() {
  const consultaActual = ++solicitudConsulta;
  const servicio = $("servicio").value;

  asignacionActual = null;
  asignaciones = [];
  $("detalleServicio").hidden = true;
  $("asignacion").disabled = true;
  $("asignacion").replaceChildren();

  if (!servicio) {
    agregarOpcion($("asignacion"), "", "Seleccione primero un servicio");
    return;
  }

  agregarOpcion($("asignacion"), "", "Cargando asignaciones...");
  const clave = claveLocal(`asignaciones_${normalizar(servicio)}`);

  try {
    const datos = await consultar("asignacionesEmpresaTerreno", { servicio });
    if (!Array.isArray(datos.servicios)) throw new Error("Asignaciones inválidas.");
    if (consultaActual !== solicitudConsulta) return;
    guardarLocal(clave, datos.servicios);
    asignaciones = datos.servicios;
    $("mensajeAsignaciones").textContent = `${asignaciones.length} asignación(es) pendiente(s).`;
  } catch (error) {
    if (consultaActual !== solicitudConsulta) return;
    asignaciones = leerLocal(clave, []);
    $("mensajeAsignaciones").textContent = `Datos guardados: ${asignaciones.length}. ${error.message}`;
  }

  const enCola = obtenerPendientesLocales();
  asignaciones = asignaciones.filter(item => !enCola.has(String(item.id)));

  $("asignacion").replaceChildren();
  agregarOpcion($("asignacion"), "", "Seleccione una asignación");

  asignaciones.forEach(item => {
    const destino = item.paciente ? `${item.paciente} | ${item.empresa}` : item.empresa;
    const fecha = [item.fechaProgramada, item.ventanaHoraria].filter(Boolean).join(" · ");
    agregarOpcion($("asignacion"), item.id, `${destino} · ${fecha}`);
  });

  $("asignacion").disabled = asignaciones.length === 0;
}

function obtenerElementos(detalle) {
  let datos = detalle;

  if (typeof datos === "string") {
    try { datos = JSON.parse(datos); }
    catch (_) { return []; }
  }

  if (datos && !Array.isArray(datos) && typeof datos === "object") {
    if (Array.isArray(datos.elementos)) datos = datos.elementos;
    else if (Array.isArray(datos.entregados)) datos = datos.entregados;
    else datos = Object.entries(datos).map(([elemento, cantidad]) => ({ elemento, cantidad }));
  }

  if (!Array.isArray(datos)) return [];

  return datos.map(item => {
    const nombre = String(item.elemento || item.nombre || item.producto || (item.gas ? `${item.gas} ${item.medida || ""}` : "") || item.tipo || "").trim();
    const cantidad = Number(item.cantidad ?? item.unidades ?? 1);
    return { nombre, cantidad, recarga: item.recarga === true };
  }).filter(item => item.nombre && Number.isInteger(item.cantidad) && item.cantidad >= 0);
}

function agregarContador(contenedor, grupo, elemento, indice, cantidadInicial) {
  const fila = document.createElement("div");
  fila.className = "fila-cantidad";

  const etiqueta = document.createElement("span");
  etiqueta.textContent = elemento.nombre;

  const controles = document.createElement("div");
  controles.className = "cantidad-controles";

  const menos = document.createElement("button");
  menos.type = "button";
  menos.textContent = "−";

  const cantidad = document.createElement("input");
  cantidad.type = "number";
  cantidad.min = "0";
  cantidad.max = "50";
  cantidad.step = "1";
  cantidad.value = String(cantidadInicial);
  cantidad.dataset.grupo = grupo;
  cantidad.dataset.indice = String(indice);

  const mas = document.createElement("button");
  mas.type = "button";
  mas.textContent = "+";

  menos.onclick = () => {
    cantidad.value = String(Math.max(0, Number(cantidad.value || 0) - 1));
  };
  mas.onclick = () => {
    cantidad.value = String(Math.min(50, Number(cantidad.value || 0) + 1));
  };

  controles.append(menos, cantidad, mas);
  fila.append(etiqueta, controles);
  contenedor.appendChild(fila);
}

function mostrarAsignacion() {
  asignacionActual = asignaciones.find(item => item.id === $("asignacion").value) || null;
  $("detalleServicio").hidden = !asignacionActual;
  if (!asignacionActual) return;

  const item = asignacionActual;
  const ficha = $("ficha");
  ficha.replaceChildren();

  [
    ["Empresa", item.empresa],
    ["Paciente", item.paciente],
    ["Servicio", item.servicio],
    ["Tipo", item.tipo],
    ["Dirección", `${item.direccion || ""} ${item.comuna || ""}`],
    ["Programación", `${item.fechaProgramada || ""} ${item.ventanaHoraria || ""}`],
    ["Observaciones Oficina", item.observacionesOficina]
  ].forEach(([titulo, valor]) => {
    if (!String(valor || "").trim()) return;
    const parrafo = document.createElement("p");
    const negrita = document.createElement("strong");
    negrita.textContent = `${titulo}: `;
    parrafo.append(negrita, document.createTextNode(String(valor)));
    ficha.appendChild(parrafo);
  });

  const elementos = obtenerElementos(item.detalleSolicitado);
  const contenedor = $("cantidades");
  contenedor.replaceChildren();

  if (!elementos.length) {
    const aviso = document.createElement("p");
    aviso.textContent = "Este servicio no tiene un detalle estructurado. No se podrá marcar ATENDIDO hasta resolverlo.";
    contenedor.appendChild(aviso);
  } else {
    ["ENTREGADOS", "RETIRADOS"].forEach(grupo => {
      const seccion = document.createElement("section");
      seccion.className = "panel";
      const titulo = document.createElement("h3");
      titulo.textContent = grupo;
      seccion.appendChild(titulo);

      elementos.forEach((elemento, indice) => {
        agregarContador(seccion, grupo, elemento, indice, grupo === "ENTREGADOS" ? elemento.cantidad : 0);
      });

      contenedor.appendChild(seccion);
    });
  }

  $("receptor").value = "";
  $("observaciones").value = "";
  $("foto").value = "";
  firmaPad.clear();
  ajustarFirma();
}

function ajustarFirma() {
  const canvas = $("firma");
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const ancho = canvas.getBoundingClientRect().width;
  if (!ancho) return;
  canvas.width = Math.round(ancho * ratio);
  canvas.height = Math.round(170 * ratio);
  canvas.getContext("2d").scale(ratio, ratio);
  firmaPad.clear();
}

function leerCantidad(grupo, indice) {
  const input = [...document.querySelectorAll("#cantidades input")].find(
    elemento => elemento.dataset.grupo === grupo && elemento.dataset.indice === String(indice)
  );
  const numero = Number(input?.value);
  if (!input || input.value.trim() === "" || !Number.isInteger(numero) || numero < 0 || numero > 50) {
    throw new Error("Las cantidades deben ser números enteros entre 0 y 50.");
  }
  return numero;
}

function obtenerDetalleRealizado() {
  const elementos = obtenerElementos(asignacionActual.detalleSolicitado);
  return {
    entregados: elementos.map((item, indice) => ({ ...item, cantidad: leerCantidad("ENTREGADOS", indice) })),
    retirados: elementos.map((item, indice) => ({ ...item, cantidad: leerCantidad("RETIRADOS", indice) }))
  };
}

async function convertirFotografia(archivo) {
  if (!archivo) return "";
  if (!archivo.type.startsWith("image/")) throw new Error("Seleccione una fotografía válida.");

  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, 1280 / Math.max(imagen.width, imagen.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(imagen.width * escala);
  canvas.height = Math.round(imagen.height * escala);
  canvas.getContext("2d").drawImage(imagen, 0, 0, canvas.width, canvas.height);
  if (imagen.close) imagen.close();
  return canvas.toDataURL("image/jpeg", 0.72);
}

async function registrarServicio(resultadoServicio) {
  if (enviando || !asignacionActual) return;

  try {
    const observaciones = $("observaciones").value.trim();
    const foto = $("foto").files[0];
    const servicio = normalizar(asignacionActual.servicio);
    const requiereFoto = resultadoServicio === "NO REALIZADO" || servicio.includes("RECARGA") || servicio.includes("IMPLEMENT");

    if (resultadoServicio === "NO REALIZADO" && !observaciones) {
      throw new Error("NO REALIZADO requiere una observación.");
    }
    if (requiereFoto && !foto) throw new Error("Este resultado requiere una fotografía.");
    if (resultadoServicio === "ATENDIDO" && firmaPad.isEmpty()) {
      throw new Error("ATENDIDO requiere firma.");
    }
    if (resultadoServicio === "ATENDIDO" && !obtenerElementos(asignacionActual.detalleSolicitado).length) {
      throw new Error("Falta el detalle solicitado del servicio.");
    }

    const detalle = resultadoServicio === "ATENDIDO" ? obtenerDetalleRealizado() : { entregados: [], retirados: [] };
    if (!confirm(`¿Confirmar ${resultadoServicio} para ${asignacionActual.paciente || asignacionActual.empresa}?`)) return;

    enviando = true;
    $("enviar").disabled = true;
    $("noRealizado").disabled = true;

    const registro = {
      tipoCliente: "EMPRESA_TERRENO",
      id: asignacionActual.id,
      servicio: asignacionActual.servicio,
      resultadoServicio,
      envioId: crypto.randomUUID(),
      detalleRealizado: JSON.stringify(detalle),
      observaciones,
      receptor: $("receptor").value.trim(),
      gps: ubicacion,
      dispositivo: navigator.userAgent.slice(0, 180),
      fotoData: await convertirFotografia(foto),
      firmaData: resultadoServicio === "ATENDIDO" ? firmaPad.toDataURL("image/png") : ""
    };

    const cola = leerLocal(claveLocal("cola"), []);
    cola.push(registro);
    guardarLocal(claveLocal("cola"), cola);

    informar("Registro guardado localmente. Sincronizando...");
    $("detalleServicio").hidden = true;
    asignacionActual = null;

    await cargarAsignaciones();
    await sincronizarPendientes();
  } catch (error) {
    informar(`No se registró: ${error.message}`);
  } finally {
    enviando = false;
    $("enviar").disabled = false;
    $("noRealizado").disabled = false;
    actualizarEstado();
  }
}

async function sincronizarPendientes() {
  if (sincronizando || !navigator.onLine || !emailOperario) return;
  sincronizando = true;

  try {
    let cola = leerLocal(claveLocal("cola"), []);

    while (cola.length) {
      const registro = cola[0];
      const formulario = new FormData();
      Object.entries(registro).forEach(([nombre, valor]) => formulario.append(nombre, valor));

      let respuesta;
      try {
        respuesta = await fetch(WORKER_URL, {
          method: "POST",
          body: formulario,
          credentials: "same-origin"
        });
      } catch (_) {
        informar("Sin conexión. El envío permanece guardado.");
        break;
      }

      let datos;
      try {
        datos = await respuesta.json();
      } catch (_) {
        informar("Respuesta inválida. El envío permanece guardado.");
        break;
      }

      if (!respuesta.ok || datos.ok !== true) {
        informar(`Envío pendiente: ${datos.error || respuesta.status}`);
        break;
      }

      cola.shift();
      guardarLocal(claveLocal("cola"), cola);
      informar(datos.advertencia || (datos.duplicado ? "Envío registrado anteriormente." : "Servicio registrado correctamente."));
    }
  } finally {
    sincronizando = false;
    actualizarEstado();
  }
}

window.addEventListener("DOMContentLoaded", iniciar);
