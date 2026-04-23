// Elementos del HTML
const p = document.getElementById('pelota');
const j = document.getElementById('jugador');
const b = document.getElementById('bot');
const marc = document.getElementById('marcador');
const msg = document.getElementById('mensaje-estado');
const menu = document.getElementById('pantalla-inicial');
const guia = document.getElementById('guia-tiro');

// Estado del juego
let jX = 100, jY = 185, bX = 670, bY = 185, pX = 390, pY = 190;
let anguloJ = 0; // Nueva variable para el giro (en grados)
let pVelX = 0, pVelY = 0;
let golesJ = 0, golesB = 0;
let modoActual = 0; 
let activo = false;
let teclas = {};

// 1. Controles
window.onkeydown = (e) => {
    teclas[e.key.toLowerCase()] = true; 
    if (e.key === '1' && !activo) iniciar(3);
    if (e.key === '2' && !activo) iniciar(1);
    if (e.key.toLowerCase() === 'r') location.reload();
    if (e.key.toLowerCase() === 'm') volverAlMenu();
};
window.onkeyup = (e) => teclas[e.key.toLowerCase()] = false;

function iniciar(goles) {
    modoActual = goles;
    menu.classList.add('oculto');
    golesJ = 0; golesB = 0;
    marc.innerText = "0 - 0";
    resetearPosiciones();
    cuentaAtras();
}

function volverAlMenu() {
    activo = false;
    menu.classList.remove('oculto');
    msg.innerText = "";
    resetearPosiciones();
}

function resetearPosiciones() {
    jX = 100; jY = 185; bX = 670; bY = 185; pX = 390; pY = 190;
    pVelX = 0; pVelY = 0; anguloJ = 0;
}

function cuentaAtras() {
    activo = false;
    let contador = 3;
    msg.innerText = contador;
    let timer = setInterval(() => {
        contador--;
        if (contador > 0) {
            msg.innerText = contador;
        } else if (contador === 0) {
            msg.innerText = "¡YA!";
        } else {
            clearInterval(timer);
            msg.innerText = "";
            activo = true;
        }
    }, 1000);
}

// 3. Bucle principal
function actualizar() {
    if (activo) {
        // Movimiento Jugador
        if (teclas.arrowup && jY > 0) jY -= 5;
        if (teclas.arrowdown && jY < 370) jY += 5;
        if (teclas.arrowleft && jX > 0) jX -= 5;
        if (teclas.arrowright && jX < 770) jX += 5;

        // Giro de dirección (A y D)
        if (teclas.a) anguloJ -= 5;
        if (teclas.d) anguloJ += 5;

        // IA del Bot
        if (bY < pY) bY += 2.5;
        if (bY > pY) bY -= 2.5;
        if (bX < pX && bX < 770) bX += 2;
        if (bX > pX && bX > 400) bX -= 2;

        // Movimiento Pelota
        pX += pVelX; pY += pVelY;
        pVelX *= 0.98; pVelY *= 0.98;

        // Rebotes
        if (pY <= 0 || pY >= 380) pVelY *= -1;

        // Chutar con ángulo
        if (Math.abs(jX - pX) < 30 && Math.abs(jY - pY) < 30 && teclas[' ']) {
            let rad = (anguloJ - 90) * (Math.PI / 180);
            pVelX = Math.cos(rad) * 12;
            pVelY = Math.sin(rad) * 12;
        }

        // Colisión Bot
        if (Math.abs(bX - pX) < 25 && Math.abs(bY - pY) < 25) {
            pVelX = -8; 
            pVelY = (pY - bY) * 0.2;
        }

        // Goles
        if (pX >= 785 && pY > 150 && pY < 250) marcar('jugador');
        if (pX <= 0 && pY > 150 && pY < 250) marcar('bot');
        if (pX <= 0 || pX >= 785) pVelX *= -1;

        // Dibujar
        j.style.left = jX + 'px'; j.style.top = jY + 'px';
        guia.style.transform = `rotate(${anguloJ}deg)`;
        b.style.left = bX + 'px'; b.style.top = bY + 'px';
        p.style.left = pX + 'px'; p.style.top = pY + 'px';
    }
    requestAnimationFrame(actualizar);
}

function marcar(quien) {
    if (quien === 'jugador') { golesJ++; msg.innerText = "¡GOOOL!"; }
    else { golesB++; msg.innerText = "¡GOL RIVAL!"; }
    
    marc.innerText = `${golesJ} - ${golesB}`;
    activo = false;
    resetearPosiciones();

    if (golesJ >= modoActual || golesB >= modoActual) {
        msg.innerHTML = (golesJ > golesB ? "¡HAS GANADO!" : "HAS PERDIDO") + 
                        "<br><small>R: Reiniciar | M: Menú</small>";
    } else {
        setTimeout(cuentaAtras, 1500);
    }
}

actualizar();