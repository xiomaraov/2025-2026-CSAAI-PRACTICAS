// VARIABLES DEL JUEGO
var claveSecreta = [];
var intentos = 7; // Máximo 7 intentos [cite: 15]
var intentosConsumidos = 0;
var ms = 0; 
var intervalo = null;

// Al cargar la página inicializamos el juego [cite: 44]
window.onload = function() {
    resetJuego();
};

function generarClave() {
    claveSecreta = [];
    while (claveSecreta.length < 4) {
        let n = Math.floor(Math.random() * 10);
        if (!claveSecreta.includes(n)) {
            claveSecreta.push(n);
        }
    }
    console.log("Clave secreta:", claveSecreta); // Solo para desarrollo
}

function pulsarDigito(num, boton) {
    // Si el crono no está iniciado, arranca automáticamente [cite: 49]
    if (!intervalo) {
        iniciarJuego();
    }
    
    // Evitar pulsar si ya no hay intentos o el botón está desactivado [cite: 54]
    if (intentos <= 0 || boton.disabled) return;

    // Desactivar botón y marcar como usado [cite: 54, 179]
    boton.disabled = true;
    boton.classList.add("usado");

    intentos--;
    intentosConsumidos++;
    document.getElementById("intentos-txt").innerText = intentos;

    let acierto = false;
    for (let i = 0; i < 4; i++) {
        if (claveSecreta[i] === num) {
            let span = document.getElementById("pos" + i);
            span.innerText = num;
            // Cambiar color al acertar (vía clase CSS) [cite: 46, 53]
            span.classList.remove("numero-oculto");
            span.classList.add("numero-acierto");
            acierto = true;
        }
    }

    if (acierto) {
        document.getElementById("mensaje").innerText = "Has acertado el número " + num + ". Sigue así.";
    } else {
        document.getElementById("mensaje").innerText = "El número " + num + " no está en la clave.";
    }

    comprobarFinal();
}

function comprobarFinal() {
    let acertados = 0;
    for (let i = 0; i < 4; i++) {
        if (document.getElementById("pos" + i).innerText !== "*") {
            acertados++;
        }
    }

    // Victoria [cite: 105, 107, 123]
    if (acertados === 4) {
        pararJuego();
        let tiempoFinal = document.getElementById("crono").innerText;
        document.getElementById("mensaje").innerText = 
            "¡Clave descubierta! Tiempo: " + tiempoFinal + 
            " - Consumidos: " + intentosConsumidos + 
            " - Restantes: " + intentos;
    } 
    // Derrota [cite: 79, 81, 91]
    else if (intentos <= 0) {
        pararJuego();
        document.getElementById("mensaje").innerText = 
            "BOOM. Has agotado los intentos. La clave era " + claveSecreta.join("") + ". Pulsa Reset.";
        // Revelar la clave al perder [cite: 81]
        for(let i = 0; i < 4; i++) {
            document.getElementById("pos" + i).innerText = claveSecreta[i];
        }
    }
}

// FUNCIONES DE CONTROL [cite: 139, 142, 166]
function iniciarJuego() {
    if (intervalo) return; 
    let inicio = Date.now() - ms;
    intervalo = setInterval(() => {
        ms = Date.now() - inicio;
        let totalSegundos = Math.floor(ms / 1000);
        let m = Math.floor(totalSegundos / 60);
        let s = totalSegundos % 60;
        let c = Math.floor((ms % 1000) / 10);
        // Formato m:ss:cc [cite: 20, 57]
        document.getElementById("crono").innerText = 
            m + ":" + (s < 10 ? "0" + s : s) + ":" + (c < 10 ? "0" + c : c);
    }, 10);
}

function pararJuego() {
    clearInterval(intervalo);
    intervalo = null;
    if (intentos > 0 && !document.getElementById("mensaje").innerText.includes("descubierta")) {
        document.getElementById("mensaje").innerText = "Cronómetro detenido.";
    }
}

function resetJuego() {
    // Detener crono y resetear tiempo [cite: 166]
    pararJuego();
    ms = 0;
    document.getElementById("crono").innerText = "0:00:00";
    
    // Restaurar intentos [cite: 169]
    intentos = 7;
    intentosConsumidos = 0;
    document.getElementById("intentos-txt").innerText = intentos;
    
    // Nueva clave y ocultar dígitos [cite: 167, 170]
    generarClave();
    for (let i = 0; i < 4; i++) {
        let span = document.getElementById("pos" + i);
        span.innerText = "*";
        span.className = "numero-oculto";
    }
    
    // Habilitar todos los botones numéricos [cite: 171]
    let botones = document.querySelectorAll(".btn-num");
    botones.forEach(b => {
        b.disabled = false;
        b.classList.remove("usado");
    });

    document.getElementById("mensaje").innerText = "Nueva partida preparada. Pulsa Start o un número.";
}