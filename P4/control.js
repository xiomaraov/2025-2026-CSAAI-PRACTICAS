/* jshint esversion: 6 */ 
var sonido = new Audio('musica_fondo.mp3');
sonido.loop = true; 

document.getElementById("boton-musica").onclick = function() {
    if (sonido.paused) {
        sonido.play();
        this.innerText = "Música: ON";
    } else {
        sonido.pause();
        this.innerText = "Música: OFF";
    }
};

// Variables de inicio siemore iguales
var fotosCama = ["cama.jpg", "cama.jpg", "cama.jpg", "cama.jpg", "casa.jpg", "casa.jpg", "casa.jpg", "casa.jpg"];
var palabras = ["CAMA", "CAMA", "CAMA", "CAMA", "CASA", "CASA", "CASA", "CASA"];

// Variables de control
var nivelActual = 1;
var posicionActual = 0;
var intervalojuego;
var intervaloTiempo;
var segundos = 0;

var cuadrículaDiv = document.getElementById("cuadricula");
var textoNivel = document.getElementById("nivel-texto");
var textoTiempo = document.getElementById("tiempo-texto");
var textoEstado = document.getElementById("estado-texto");
var textoAnuncio = document.getElementById("texto-anuncio");

function crearDibujos() {
    cuadrículaDiv.innerHTML = ""; 

    for (var i = 0; i < 8; i++) {
        var miImagen = "<img src='" + fotosCama[i] + "' width='60'>";
        var miTexto = "<p class='etiqueta-negra'>" + palabras[i] + "</p>";
        cuadrículaDiv.innerHTML += "<div class='tarjeta' id='foto-" + i + "'>" + miImagen + miTexto + "</div>";
    }
}

function configurarSecuenciaPorNivel() {
    var seleccion = document.getElementById("sel-secuencia").value;
    var img1, img2, txt1, txt2;

    if (seleccion === "Preso-Peso") {
        img1 = "preso.webp"; img2 = "peso.webp";
        txt1 = "PRESO"; txt2 = "PESO";
    } else if (seleccion === "Queso-Beso") {
        img1 = "queso.jpg"; img2 = "beso.webp";
        txt1 = "QUESO"; txt2 = "BESO";
    } else if (seleccion === "foca-boca") {
        img1 = "foca.jpg"; img2 = "boca.jpg";
        txt1 = "FOCA"; txt2 = "BOCA";
    } else if (seleccion === "Piña-Niña") {
        img1 = "piña.jpg"; img2 = "niña.jpg";
        txt1 = "PIÑA"; txt2 = "NIÑA";
    } else if (seleccion === "Hueso-Huevo") {
        img1 = "hueso.jpg"; img2 = "huevo.jpg";
        txt1 = "HUESO"; txt2 = "HUEVO";
    } else if (seleccion === "Bota-Gota") {
        img1 = "bota.jpg"; img2 = "gota.png";
        txt1 = "BOTA"; txt2 = "GOTA";
    } else if (seleccion === "Globo-Gnomo") {
        img1 = "globo.webp"; img2 = "gnomo.jpg";
        txt1 = "GLOBO"; txt2 = "GNOMO";
    } else if (seleccion === "Bruja-Burbuja") {
        img1 = "bruja.jpg"; img2 = "burbuja.jpg";
        txt1 = "BRUJA"; txt2 = "BURBUJA";
    } else if (seleccion === "Oveja-Abeja") {
        img1 = "oveja.jpg"; img2 = "abeja.png";
        txt1 = "OVEJA"; txt2 = "ABEJA";
    } else if (seleccion === "Zumo-Humo") {
        img1 = "zumo.jpg"; img2 = "humo.png";
        txt1 = "ZUMO"; txt2 = "HUMO";
    } else {
        img1 = "cama.jpg"; img2 = "casa.jpg";
        txt1 = "CAMA"; txt2 = "CASA";
    }

   for (var i = 0; i < 8; i++) {
        var usarOpcion2 = false;

        if (nivelActual === 1) {
            if (i >= 4) usarOpcion2 = true; 
        } else if (nivelActual === 2) {
            if ((i >= 2 && i <= 3) || (i >= 6 && i <= 7)) usarOpcion2 = true;
        } else if (nivelActual === 3) {
            if (i % 2 !== 0) usarOpcion2 = true;
        } else if (nivelActual === 4) {
            var patronNivel4 = [false, true, true, false, true, false, false, true];
            usarOpcion2 = patronNivel4[i];
        } else {
            // Nivel 5: Aleatorio real para mayor dificultad en el juego 
            usarOpcion2 = Math.random() > 0.5;
        }

        if (usarOpcion2) {
            fotosCama[i] = img2;
            palabras[i] = txt2;
        } else {
            fotosCama[i] = img1;
            palabras[i] = txt1;
        }
    }
}

crearDibujos();

document.getElementById("btn-comenzar").onclick = function() {
    nivelActual = parseInt(document.getElementById("sel-nivel").value);
    segundos = 0;
    textoEstado.innerText = "Jugando";
    
    document.getElementById("btn-comenzar").disabled = true;
    document.getElementById("sel-nivel").disabled = true;

    empezarRonda();

    intervaloTiempo = setInterval(function() {
        segundos = segundos + 0.1;
        textoTiempo.innerText = segundos.toFixed(1) + "s";
    }, 100);
};

function empezarRonda() {
    if (nivelActual > 5) {
        pararTodo();
        textoAnuncio.innerHTML = "¡PARTIDA COMPLETADA! 🎉 <br><small>Tiempo total: " + segundos.toFixed(1) + "s</small>";
        textoAnuncio.classList.add("mensaje-final"); 
        return;
    }

    configurarSecuenciaPorNivel();
    crearDibujos();

    textoNivel.innerText = nivelActual + "/5";
    posicionActual = 0;
    
    var velocidades = [0, 1200, 1000, 800, 650, 400];
    var velocidad = velocidades[nivelActual];

    intervalojuego = setInterval(function() {
        for (var i = 0; i < 8; i++) {
            document.getElementById("foto-" + i).classList.remove("activa");
        }

        if (posicionActual < 8) {
            document.getElementById("foto-" + posicionActual).classList.add("activa");
            textoAnuncio.innerText = palabras[posicionActual];
            posicionActual++;
        } else {
            clearInterval(intervalojuego);
            nivelActual++;
            // Pausa de cortesía de 850ms entre niveles para asimilar el cambio
            setTimeout(empezarRonda, 850); 
        }
    }, velocidad);
}

document.getElementById("btn-detener").onclick = function() {
    pararTodo();
};

function pararTodo() {
    clearInterval(intervalojuego);
    clearInterval(intervaloTiempo);
    
    // Detener música y resetear estado inicial de todos los controles 
    sonido.pause();
    sonido.currentTime = 0;
    document.getElementById("boton-musica").innerText = "Música: OFF";
    document.getElementById("btn-comenzar").disabled = false;
    document.getElementById("sel-nivel").disabled = false;
    
    textoEstado.innerText = "En espera";
    textoAnuncio.innerText = 'Pulsa "Empezar"';
    textoAnuncio.classList.remove("mensaje-final"); 
    textoAnuncio.innerText = 'Pulsa "Empezar"';

    // Limpiar resaltado de tarjetas
    for (var i = 0; i < 8; i++) {
        var tarjeta = document.getElementById("foto-" + i);
        if (tarjeta) tarjeta.classList.remove("activa");
    }
}