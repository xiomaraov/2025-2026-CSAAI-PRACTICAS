// --- CONFIGURACIÓN ---
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const puntosTxt = document.getElementById("puntos");
const livesTxt = document.getElementById("vivas-display");
const energyFill = document.getElementById("energy-fill");

// Recursos - REVISA QUE LOS NOMBRES SEAN IGUALES A TUS ARCHIVOS
const jugadorImg = new Image(); jugadorImg.src = "nave.png";
const enemigoImg = new Image(); enemigoImg.src = "alien.png";
const balaImg = new Image();    balaImg.src = "bala.png";
const boomImg = new Image();    boomImg.src = "boom.png";

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
let balasEnemigas = [];
let ultimoDisparoEnemigo = 0;

function inicializarNivel() {
    ladrillos = [];
    for (let f = 0; f < LADRILLO.F; f++) {
        for (let c = 0; c < LADRILLO.C; c++) {
            ladrillos.push({
                x: 100 + c * (LADRILLO.w + LADRILLO.padding),
                y: 60 + f * (LADRILLO.h + LADRILLO.padding),
                visible: true,
                pum: 0
            });
        }
    }
}

function disparar() {
    if (energiaActual >= 1) { 
        balasJugador.push({ x: jugadorX + 25, y: jugadorY - 20, w: 20, h: 20 });
        energiaActual--; 
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

    // Flota
    let tocarBorde = false;
    let vivos = ladrillos.filter(b => b.visible);
    velocidadFlota = LADRILLO.speedBase + (1 - vivos.length / (LADRILLO.F * LADRILLO.C)) * 5;

    vivos.forEach(b => {
        b.x += velocidadFlota * direccionFlota;
        if (b.x + LADRILLO.w > canvas.width || b.x < 0) tocarBorde = true;
        ctx.drawImage(enemigoImg, b.x, b.y, LADRILLO.w, LADRILLO.h);
        if (b.y + LADRILLO.h > jugadorY) finalizarJuego("GAME OVER", false);
    });

    if (tocarBorde) {
        direccionFlota *= -1;
        ladrillos.forEach(b => b.y += 15);
    }

    // Balas jugador
    balasJugador.forEach((bala, index) => {
        bala.y -= 10;
        ctx.drawImage(balaImg, bala.x, bala.y, bala.w, bala.h);
        vivos.forEach(b => {
            if (bala.x < b.x + LADRILLO.w && bala.x + bala.w > b.x && bala.y < b.y + LADRILLO.h && bala.y + bala.h > b.y) {
                b.visible = false;
                b.pum = 10;
                balasJugador.splice(index, 1);
                puntuacion += 10;
                actualizarUI();
            }
        });
        if (bala.y < 0) balasJugador.splice(index, 1);
    });

    if (vivos.length === 0) finalizarJuego("VICTORIA", true);

    requestAnimationFrame(update);
}

window.addEventListener("keydown", (e) => {
    teclas[e.code] = true;
    if (e.code === "Space") {
        e.preventDefault();
        disparar();
    }
});

window.addEventListener("keyup", (e) => {
    teclas[e.code] = false;
});

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
}