// Elementos del HTML
const p = document.getElementById('pelota');
const j = document.getElementById('jugador');
const comp = document.getElementById('companero'); // Nuevo
const b = document.getElementById('bot');
const b2 = document.getElementById('bot2'); // Nuevo
const marc = document.getElementById('marcador');
const msg = document.getElementById('mensaje-estado');
const menu = document.getElementById('pantalla-inicial');
const guia = document.getElementById('guia-tiro');

// Estado del juego
let jX = 100, jY = 185;
let compX = 100, compY = 100; // Posición compañero
let bX = 670, bY = 185;
let b2X = 550, b2Y = 250; // Posición defensa rival
let pX = 390, pY = 190;

let anguloJ = 0; 
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
    marc.innerText = "TÚ 0 - 0 MÁQUINA";
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
    jX = 100; jY = 185;
    compX = 150; compY = 100;
    bX = 670; bY = 185;
    b2X = 600; b2Y = 280;
    pX = 390; pY = 190;
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

function actualizar() {
    if (activo) {
        // Movimiento Jugador (TÚ)
        if (teclas.arrowup && jY > 0) jY -= 5;
        if (teclas.arrowdown && jY < 370) jY += 5;
        if (teclas.arrowleft && jX > 0) jX -= 5;
        if (teclas.arrowright && jX < 770) jX += 5;

        // Giro de dirección (A y D)
        if (teclas.a) anguloJ -= 5;
        if (teclas.d) anguloJ += 5;

        // IA Compañero (Te sigue a una distancia)
        if (compY < jY - 40) compY += 3;
        if (compY > jY + 40) compY -= 3;
        if (compX < jX - 50) compX += 3;
        if (compX > jX + 50) compX -= 3;

        // IA Bot principal (Ataca la pelota)
        if (bY < pY) bY += 2.5;
        if (bY > pY) bY -= 2.5;
        if (bX < pX && bX < 770) bX += 2;
        if (bX > pX && bX > 400) bX -= 2;

        // IA Defensa Rival (Se queda atrás protegiendo)
        if (b2Y < pY - 20) b2Y += 2;
        if (b2Y > pY + 20) b2Y -= 2;
        b2X = 650; // Se queda cerca de su área

        // --- MOVIMIENTO PELOTA ---
        pX += pVelX; pY += pVelY;
        pVelX *= 0.98; pVelY *= 0.98;

        // --- REBOTES Y GOLES ---
        if (pY <= 0) { pY = 0; pVelY *= -1; }
        if (pY >= 380) { pY = 380; pVelY *= -1; }

        if (pX <= 0) {
            if (pY > 150 && pY < 250) marcar('bot');
            else { pX = 0; pVelX *= -1; }
        }
        if (pX >= 780) {
            if (pY > 150 && pY < 250) marcar('jugador');
            else { pX = 780; pVelX *= -1; }
        }

        // Chutar con ángulo (Jugador principal)
        if (Math.abs(jX - pX) < 30 && Math.abs(jY - pY) < 30 && teclas[' ']) {
            let rad = (anguloJ - 90) * (Math.PI / 180);
            pVelX = Math.cos(rad) * 12;
            pVelY = Math.sin(rad) * 12;
        }

        // Colisiones de otros jugadores 
        let otros = [
            {x: bX, y: bY, vx: -8}, 
            {x: b2X, y: b2Y, vx: -8}, 
            {x: compX, y: compY, vx: 8}
        ];
        
        otros.forEach(ent => {
            if (Math.abs(ent.x - pX) < 25 && Math.abs(ent.y - pY) < 25) {
                pVelX = ent.vx; 
                pVelY = (pY - ent.y) * 0.2;
            }
        });

        j.style.left = jX + 'px'; j.style.top = jY + 'px';
        guia.style.transform = `rotate(${anguloJ}deg)`;
        
        comp.style.left = compX + 'px'; comp.style.top = compY + 'px';
        
        b.style.left = bX + 'px'; b.style.top = bY + 'px';
        b2.style.left = b2X + 'px'; b2.style.top = b2Y + 'px';
        
        p.style.left = pX + 'px'; p.style.top = pY + 'px';
    }
    requestAnimationFrame(actualizar);
}

function marcar(quien) {
    if (quien === 'jugador') { 
        golesJ++; 
        msg.innerText = "¡GOOOL DE TÚ :)!"; 
    } else { 
        golesB++; 
        msg.innerText = "¡GOL DE LA MÁQUINA!"; 
    }
    
    marc.innerText = `TÚ ${golesJ} - ${golesB} MÁQUINA`;
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
resetearPosiciones();