// Elementos del HTML
const p = document.getElementById('pelota');
const j = document.getElementById('jugador');
const b = document.getElementById('bot');
const marc = document.getElementById('marcador');
const msg = document.getElementById('mensaje-estado');
const menu = document.getElementById('pantalla-inicial');

// Estado del juego
let jX = 100, jY = 185, bX = 670, bY = 185, pX = 390, pY = 190;
let pVelX = 0, pVelY = 0;
let golesJ = 0, golesB = 0;
let modoActual = 0; // 3 para "3 goles", 1 para "Gol de oro"
let activo = false;
let teclas = {};

// 1. Elegir modo de juego (Pulsar 1 o 2)
window.onkeydown = (e) => {
    teclas[e.key] = true;
    if (e.key === '1') iniciar(3);
    if (e.key === '2') iniciar(1);
    if (e.key === 'r' || e.key === 'R') location.reload();
};
window.onkeyup = (e) => teclas[e.key] = false;

function iniciar(goles) {
    modoActual = goles;
    menu.classList.add('oculto');
    cuentaAtras();
}

// 2. Cuenta atrás (Al empezar y tras cada gol)
function cuentaAtras() {
    activo = false;
    let contador = 3;
    msg.innerText = contador;
    let timer = setInterval(() => {
        contador--;
        msg.innerText = contador > 0 ? contador : "¡YA!";
        if (contador < 0) {
            clearInterval(timer);
            msg.innerText = "";
            activo = true;
        }
    }, 1000);
}

// 3. Bucle principal (Movimiento y Física)
function actualizar() {
    if (activo) {
        // Movimiento Jugador
        if (teclas.ArrowUp && jY > 0) jY -= 5;
        if (teclas.ArrowDown && jY < 370) jY += 5;
        if (teclas.ArrowLeft && jX > 0) jX -= 5;
        if (teclas.ArrowRight && jX < 770) jX += 5;

        // IA del Bot (Persigue la pelota)
        if (bY < pY) bY += 2;
        if (bY > pY) bY -= 2;
        if (bX > pX) bX -= 2;

        // Movimiento Pelota (Fricción)
        pX += pVelX; pY += pVelY;
        pVelX *= 0.98; pVelY *= 0.98;

        // Rebotes en paredes
        if (pY <= 0 || pY >= 380) pVelY *= -1;

        // Chutar (Colisión básica)
        if (Math.abs(jX - pX) < 25 && Math.abs(jY - pY) < 25 && teclas[' ']) {
            pVelX = 10; pVelY = (pY - jY) * 0.3;
        }
        if (Math.abs(bX - pX) < 25 && Math.abs(bY - pY) < 25) {
            pVelX = -7; // El bot despeja
        }

        // Goles
        if (pX >= 785 && pY > 150 && pY < 250) marcar('jugador');
        if (pX <= 0 && pY > 150 && pY < 250) marcar('bot');
        if (pX <= 0 || pX >= 785) pVelX *= -1;

        // Dibujar posiciones
        j.style.left = jX + 'px'; j.style.top = jY + 'px';
        b.style.left = bX + 'px'; b.style.top = bY + 'px';
        p.style.left = pX + 'px'; p.style.top = pY + 'px';
    }
    requestAnimationFrame(actualizar);
}

function marcar(quien) {
    if (quien === 'jugador') { golesJ++; msg.innerText = "¡GOOOL!"; }
    else { golesB++; msg.innerText = "¡GOL RIVAL!"; }
    
    marc.innerText = `${golesJ} - ${golesB}`;
    jX = 100; jY = 185; bX = 670; bY = 185; pX = 390; pY = 190;
    pVelX = 0; pVelY = 0;

    if (golesJ >= modoActual || golesB >= modoActual) {
        activo = false;
        msg.innerHTML = (golesJ > golesB ? "¡HAS GANADO!" : "HAS PERDIDO") + "<br><small>Pulsa R para reiniciar</small>";
    } else {
        setTimeout(cuentaAtras, 1500);
    }
}

actualizar();