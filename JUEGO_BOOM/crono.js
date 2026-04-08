// VARIABLES DEL JUEGO
var claveSecreta = [];
var intentos = 7; // Máximo 7 intentos de partida 
var intentosConsumidos = 0;
var ms = 0; 
var intervalo = null;


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
    // Si el crono no está iniciado, arranca automáticamente
    if (!intervalo) {
        iniciarJuego();
    }
    
    // Evitar pulsar si ya no hay intentos o el botón está desactivado
    if (intentos <= 0 || boton.disabled) return;

    // --- REPRODUCIR SONIDO CLICK ---
    let sndClick = document.getElementById("sonido-click");
    sndClick.currentTime = 0; // Reinicia el audio por si se pulsa muy rápido
    sndClick.play().catch(() => {}); // El catch evita errores de carga del navegador

    // Desactivar botón y marcar como usado
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
            // Cambiar color al acertar (vía clase CSS)
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

    // Victoria
    if (acertados === 4) {
        pararJuego();

        // --- REPRODUCIR SONIDO GANAR ---
        document.getElementById("sonido-ganar").play().catch(() => {});

        let tiempoFinal = document.getElementById("crono").innerText;
        document.getElementById("mensaje").innerText = 
            "¡Clave descubierta! Tiempo: " + tiempoFinal + 
            " - Consumidos: " + intentosConsumidos + 
            " - Restantes: " + intentos;
    } 
    // Derrota
    else if (intentos <= 0) {
        pararJuego();

        // --- REPRODUCIR SONIDO PERDER ---
        document.getElementById("sonido-perder").play().catch(() => {});

        document.getElementById("mensaje").innerText = 
            "BOOM. Has agotado los intentos. La clave era " + claveSecreta.join("") + ". Pulsa Reset.";
        // Revelar la clave al perder
        for(let i = 0; i < 4; i++) {
            document.getElementById("pos" + i).innerText = claveSecreta[i];
        }
    }
}

// FUNCIONES DE CONTROL
function iniciarJuego() {
    if (intervalo) return; 
    let inicio = Date.now() - ms;
    intervalo = setInterval(() => {
        ms = Date.now() - inicio;
        let totalSegundos = Math.floor(ms / 1000);
        let m = Math.floor(totalSegundos / 60);
        let s = totalSegundos % 60;
        let c = Math.floor((ms % 1000) / 10);
        // Formato m:ss:cc
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
    // Detener crono y resetear tiempo
    pararJuego();
    ms = 0;
    document.getElementById("crono").innerText = "0:00:00";
    
    // Restaurar intentos
    intentos = 7;
    intentosConsumidos = 0;
    document.getElementById("intentos-txt").innerText = intentos;
    
    // Nueva clave y ocultar dígitos
    generarClave();
    for (let i = 0; i < 4; i++) {
        let span = document.getElementById("pos" + i);
        span.innerText = "*";
        span.className = "numero-oculto";
    }
    
    // Habilitar todos los botones numéricos
    let botones = document.querySelectorAll(".btn-num");
    botones.forEach(b => {
        b.disabled = false;
        b.classList.remove("usado");
    });

    document.getElementById("mensaje").innerText = "Nueva partida preparada. Pulsa Start o un número.";
}