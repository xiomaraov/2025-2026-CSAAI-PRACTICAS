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

// Variables de datos (se actualizan dinámicamente en cada selección)
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

    // Definición de parejas de imágenes y palabras
    if (seleccion === "pato-gato") {
        img1 = "pato.jpg"; img2 = "gato.webp";
        txt1 = "PATO"; txt2 = "GATO";
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
    } else {
        img1 = "cama.jpg"; img2 = "casa.jpg";
        txt1 = "CAMA"; txt2 = "CASA";
    }

   for (var i = 0; i < 8; i++) {
        var usarOpcion2 = false;

        if (nivelActual === 1) {
            // 4 de la primera, 4 de la segunda
            if (i >= 4) usarOpcion2 = true; 
        } else if (nivelActual === 2) {
            // Bloques de 2 en 2 (A-A-B-B-A-A-B-B)
            if ((i >= 2 && i <= 3) || (i >= 6 && i <= 7)) usarOpcion2 = true;
        } else if (nivelActual === 3) {
            // Intercalado 1 a 1 (A-B-A-B-A-B-A-B)
            if (i % 2 !== 0) usarOpcion2 = true;
        } else if (nivelActual === 4) {
            // Patrón más difícil (ejemplo: A-B-B-A-B-A-A-B)
            var patronNivel4 = [false, true, true, false, true, false, false, true];
            usarOpcion2 = patronNivel4[i];
        } else {
            // Nivel 5: Aleatorio total
            if (Math.random() > 0.5) usarOpcion2 = true;
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

// Llamamos a la función al cargar el script
crearDibujos();

document.getElementById("btn-comenzar").onclick = function() {
    nivelActual = parseInt(document.getElementById("sel-nivel").value);
    segundos = 0;
    textoEstado.innerText = "Jugando";
    
    // Bloquear botones
    document.getElementById("btn-comenzar").disabled = true;
    document.getElementById("sel-nivel").disabled = true;

    empezarRonda();

    // Contador de tiempo
    intervaloTiempo = setInterval(function() {
        segundos = segundos + 0.1;
        textoTiempo.innerText = segundos.toFixed(1) + "s";
    }, 100);
};

function empezarRonda() {
    if (nivelActual > 5) {
        pararTodo();
        textoAnuncio.innerText = "¡FIN DEL JUEGO!";
        return;
    }

    // Actualizamos la lógica de imágenes y redibujamos la cuadrícula
    configurarSecuenciaPorNivel();
    crearDibujos();

    textoNivel.innerText = nivelActual + "/5";
    posicionActual = 0;
    
    // Incremento de ritmo: reducimos el tiempo de espera significativamente por nivel
    var velocidad = 1000 - (nivelActual * 150); 
    if (velocidad < 200) velocidad = 200; // Tope de velocidad máxima

    intervalojuego = setInterval(function() {
        // Quitar el color rojo de todas
        for (var i = 0; i < 8; i++) {
            document.getElementById("foto-" + i).classList.remove("activa");
        }

        if (posicionActual < 8) {
            // Poner rojo a la que toca
            document.getElementById("foto-" + posicionActual).classList.add("activa");
            textoAnuncio.innerText = palabras[posicionActual];
            posicionActual++;
        } else {
            // Al terminar la fila, pausa corta y siguiente nivel
            clearInterval(intervalojuego);
            nivelActual++;
            setTimeout(empezarRonda, 1000); 
        }
    }, velocidad);
}

document.getElementById("btn-detener").onclick = function() {
    pararTodo();
};

function pararTodo() {
    clearInterval(intervalojuego);
    clearInterval(intervaloTiempo);
    document.getElementById("btn-comenzar").disabled = false;
    document.getElementById("sel-nivel").disabled = false;
    textoEstado.innerText = "En espera";
    textoAnuncio.innerText = 'Pulsa "Empezar"';
}