// ----------------------------
// CONTADORES
// ----------------------------

function aumentar(id){

const input=document.getElementById(id);

input.value=parseInt(input.value)+1;

}

function disminuir(id){

const input=document.getElementById(id);

let valor=parseInt(input.value);

if(valor>0){

valor--;

}

input.value=valor;

}

// ----------------------------
// SOLO LETRAS Y NUMEROS
// ----------------------------

function limpiarTexto(e){

e.target.value=e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]/g,'');

}

document.getElementById("cliente").addEventListener("input",limpiarTexto);

document.getElementById("operario").addEventListener("input",limpiarTexto);

// ----------------------------
// FIRMA
// ----------------------------

const canvas=document.getElementById("firma");

canvas.width=canvas.offsetWidth;

canvas.height=220;

const signaturePad=new SignaturePad(canvas);

// ----------------------------
// LIMPIAR FIRMA
// ----------------------------

document.getElementById("btnLimpiar").addEventListener("click",()=>{

signaturePad.clear();

});

// ----------------------------
// ENVIAR
// ----------------------------

document.getElementById("formulario").addEventListener("submit", async (e) => {

    e.preventDefault();

    if (signaturePad.isEmpty()) {
        alert("Debe ingresar la firma.");
        return;
    }

    const btn = document.getElementById("btnEnviar");

    btn.disabled = true;
    btn.textContent = "Enviando...";

    const datos = {

        cliente: document.getElementById("cliente").value,

        operario: document.getElementById("operario").value,

        entrega07: document.getElementById("e07").value,

        entrega10: document.getElementById("e10").value,

        retiro07: document.getElementById("r07").value,

        retiro10: document.getElementById("r10").value,

        observaciones: document.getElementById("obs").value,

        firma: signaturePad.toDataURL(),

        dispositivo: navigator.userAgent

    };

    try {

        const formData = new URLSearchParams();

        formData.append("datos", JSON.stringify(datos));

        const respuesta = await fetch(CONFIG.API_URL, {

            method: "POST",

            body: formData

});

        const resultado = await respuesta.json();

        if(resultado.ok){

            alert("Registro " + resultado.id + " enviado correctamente.");

            document.getElementById("formulario").reset();

            document.getElementById("e07").value = 0;
            document.getElementById("e10").value = 0;
            document.getElementById("r07").value = 0;
            document.getElementById("r10").value = 0;

            signaturePad.clear();

        }else{

            alert(resultado.error);

        }

    }catch(error){

        alert("No fue posible conectar con el servidor.");

        console.error(error);

    }

    btn.disabled = false;

    btn.textContent = "Enviar Registro";

});