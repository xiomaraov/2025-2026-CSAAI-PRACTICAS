
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const puntosTxt = document.getElementById("puntos");
const livesTxt = document.getElementById("vivas-display");
const energyFill = document.getElementById("energy-fill");

// Recursos - Imágenes
const jugadorImg = new Image(); jugadorImg.src = "nave.png";
const enemigoImg = new Image(); enemigoImg.src = "alien.png";
const balaImg = new Image();    balaImg.src = "bala.png";
const boomImg = new Image();    boomImg.src = "boom.png";

// Recursos - Sonidos (NUEVO)
const sonidoDisparo = new Audio("disparo.mp3");
const sonidoExplosion = new Audio("explosion.mp3");
const sonidoGameOver = new Audio("gameover.mp3");
const sonidoVictoria = new Audio("victoria.mp3");

canvas.width = 1100;
canvas.height = 500;

// Estado del juego
let puntuacion = 0;
let vidas = 3;
let juegoActivo = false;
let jugadorX = 515;
const jugadorY = canvas.height - 80;
let teclas = {};

// Energía
let energiaMax = 5;
let energiaActual = 5;
let ultimaRecarga = 0;
const TIEMPO_RECARGA = 500; 

// Flota
const LADRILLO = { F: 3, C: 8, w: 72, h: 72, padding: 20, speedBase: 2 };
let ladrillos = [];
let direccionFlota = 1;
let velocidadFlota = 2;
let balasJugador = [];
let balasEnemigas = []; // Se usará para los disparos de los aliens
let ultimoDisparoEnemigo = 0;

function inicializarNivel() {
    ladrillos = [];
    balasJugador = [];
    balasEnemigas = [];
    puntuacion = 0;
    vidas = 3;
    energiaActual = 5;
    for (let f = 0; f < LADRILLO.F; f++) {
        for (let c = 0; c < LADRILLO.C; c++) {
            ladrillos.push({
                x: 100 + c * (LADRILLO.w + LADRILLO.padding),
                y: 60 + f * (LADRILLO.h + LADRILLO.padding),
                visible: true,
                pum: 0 // Contador para la animación de explosión
            });
        }
    }
    actualizarUI();
}

function disparar() {
    if (energiaActual >= 1) { 
        balasJugador.push({ x: jugadorX + 25, y: jugadorY - 20, w: 20, h: 20 });
        energiaActual--; 
        sonidoDisparo.currentTime = 0; // Reinicia el sonido si se dispara rápido
        sonidoDisparo.play();
        actualizarUI(); 
    } 
}

function actualizarUI() {
    energyFill.style.width = (energiaActual / energiaMax * 100) + "%";
    livesTxt.innerHTML = "LIVES: " + "❤️".repeat(vidas);
    puntosTxt.innerHTML = "SCORE: " + puntuacion;
}

function update(timestamp) {
    if (!juegoActivo) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Recarga energía
    if (energiaActual < energiaMax && timestamp - ultimaRecarga > TIEMPO_RECARGA) {
        energiaActual++;
        ultimaRecarga = timestamp;
        actualizarUI();
    }

    // Movimiento Jugador
    if (teclas["ArrowLeft"] && jugadorX > 0) jugadorX -= 8;
    if (teclas["ArrowRight"] && jugadorX < canvas.width - 70) jugadorX += 8;
    ctx.drawImage(jugadorImg, jugadorX, jugadorY, 70, 70);

    // Gestión de la Flota
    let tocarBorde = false;
    let vivos = ladrillos.filter(b => b.visible);
    
    // Aumentar velocidad según quedan menos enemigos
    velocidadFlota = LADRILLO.speedBase + (1 - vivos.length / (LADRILLO.F * LADRILLO.C)) * 5;

    vivos.forEach(b => {
        b.x += velocidadFlota * direccionFlota;
        if (b.x + LADRILLO.w > canvas.width || b.x < 0) tocarBorde = true;
        ctx.drawImage(enemigoImg, b.x, b.y, LADRILLO.w, LADRILLO.h);
        
        // Si los aliens llegan al jugador
        if (b.y + LADRILLO.h > jugadorY) finalizarJuego("GAME OVER", false);
    });

    if (tocarBorde) {
        direccionFlota *= -1;
        ladrillos.forEach(b => b.y += 15);
    }

    // Dibujar explosiones (PUM) de enemigos destruidos recientemente
    ladrillos.forEach(b => {
        if (!b.visible && b.pum > 0) {
            ctx.drawImage(boomImg, b.x, b.y, LADRILLO.w, LADRILLO.h);
            b.pum--;
        }
    });

    // --- DISPAROS ENEMIGOS (NUEVO) ---
    if (timestamp - ultimoDisparoEnemigo > 1200 && vivos.length > 0) {
        const alienAzar = vivos[Math.floor(Math.random() * vivos.length)];
        balasEnemigas.push({ x: alienAzar.x + LADRILLO.w/2, y: alienAzar.y + 20, w: 15, h: 15 });
        ultimoDisparoEnemigo = timestamp;
    }

    balasEnemigas.forEach((be, index) => {
        be.y += 4;
        // Dibujamos la bala enemiga (puedes usar un ctx.fillRect o una imagen)
        ctx.fillStyle = "yellow";
        ctx.fillRect(be.x, be.y, 8, 15);

        // Colisión con Jugador
        if (be.x < jugadorX + 60 && be.x + 8 > jugadorX && be.y < jugadorY + 60 && be.y + 15 > jugadorY) {
            balasEnemigas.splice(index, 1);
            vidas--;
            actualizarUI();
            if (vidas <= 0) finalizarJuego("GAME OVER", false);
        }
        if (be.y > canvas.height) balasEnemigas.splice(index, 1);
    });

    // --- BALAS JUGADOR ---
    balasJugador.forEach((bala, index) => {
        bala.y -= 10;
        ctx.drawImage(balaImg, bala.x, bala.y, bala.w, bala.h);
        
        vivos.forEach(b => {
            if (bala.x < b.x + LADRILLO.w && bala.x + bala.w > b.x && bala.y < b.y + LADRILLO.h && bala.y + bala.h > b.y) {
                b.visible = false;
                b.pum = 15; // Mostrar explosión durante 15 frames
                balasJugador.splice(index, 1);
                puntuacion += 10;
                sonidoExplosion.currentTime = 0;
                sonidoExplosion.play();
                actualizarUI();
            }
        });
        if (bala.y < 0) balasJugador.splice(index, 1);
    });

    if (vivos.length === 0 && ladrillos.length > 0) finalizarJuego("VICTORIA", true);

    requestAnimationFrame(update);
}

// Controles
window.addEventListener("keydown", (e) => {
    teclas[e.code] = true;
    if (e.code === "Space") {
        e.preventDefault();
        if (juegoActivo) disparar();
    }
});

window.addEventListener("keyup", (e) => {
    teclas[e.code] = false;
});

// Botones de Interfaz
document.getElementById("single-level").onclick = () => {
    document.querySelector(".modos").style.display = "none";
    juegoActivo = true;
    inicializarNivel();
    requestAnimationFrame(update);
};

document.getElementById("restart-button").onclick = () => location.reload();

function finalizarJuego(msg, victoria) {
    juegoActivo = false;
    document.getElementById("game-over").style.display = "flex";
    document.getElementById("modal-title").textContent = msg;
    
    if (victoria) {
        sonidoVictoria.play();
    } else {
        sonidoGameOver.play();
    }
}

// Eventos para botones móviles
document.getElementById("btn-left").ontouchstart = () => { teclas["ArrowLeft"] = true; };
document.getElementById("btn-left").ontouchend = () => { teclas["ArrowLeft"] = false; };

document.getElementById("btn-right").ontouchstart = () => { teclas["ArrowRight"] = true; };
document.getElementById("btn-right").ontouchend = () => { teclas["ArrowRight"] = false; };

document.getElementById("btn-shoot").ontouchstart = (e) => {
    e.preventDefault(); // Evita zoom accidental
    if (juegoActivo) disparar();
};