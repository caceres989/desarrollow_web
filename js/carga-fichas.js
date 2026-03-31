// ===========================================
// CARGA DE FICHAS - LÓGICA DE INTERFAZ
// ===========================================

// Variables globales
let montoSeleccionado = 0;
let metodoSeleccionado = 'mercadopago';

// Elementos del DOM
const montosCards = document.querySelectorAll('.monto-card');
const montoPersonalizado = document.getElementById('montoPersonalizado');
const metodoCards = document.querySelectorAll('.metodo-card');
const btnContinuar = document.getElementById('btnContinuarPago');
const montoMostrar = document.getElementById('montoMostrar');
const fichasMostrar = document.getElementById('fichasMostrar');

// Modal de pago (Bootstrap)
const modalPagoElement = document.getElementById('modalPago');
let modalPago;

if (modalPagoElement) {
    modalPago = new bootstrap.Modal(modalPagoElement);
}
const modalPagoBody = document.getElementById('modalPagoBody');

// ===========================================
// FUNCIONES AUXILIARES
// ===========================================

// Calcular fichas con bonus según el monto
function calcularFichas(monto) {
    let fichas = monto;
    let porcentajeBonus = 0;
    
    if (monto >= 5000 && monto < 10000) {
        porcentajeBonus = 10;
    } else if (monto >= 10000 && monto < 25000) {
        porcentajeBonus = 15;
    } else if (monto >= 25000 && monto < 50000) {
        porcentajeBonus = 20;
    } else if (monto >= 50000 && monto < 100000) {
        porcentajeBonus = 25;
    } else if (monto >= 100000) {
        porcentajeBonus = 30;
    }
    
    const bonus = fichas * (porcentajeBonus / 100);
    return {
        total: Math.floor(fichas + bonus),
        bonus: Math.floor(bonus),
        porcentaje: porcentajeBonus
    };
}

// Actualizar el resumen visual
function actualizarResumen(monto) {
    if (monto > 0 && monto >= 100) {
        const resultado = calcularFichas(monto);
        montoMostrar.innerHTML = `$${monto.toLocaleString()}`;
        
        let textoFichas = `${resultado.total.toLocaleString()} fichas`;
        if (resultado.porcentaje > 0) {
            textoFichas += `<small class="d-block text-gold" style="font-size: 0.75rem;">+${resultado.bonus.toLocaleString()} bonus (${resultado.porcentaje}%)</small>`;
        }
        fichasMostrar.innerHTML = textoFichas;
        
        btnContinuar.disabled = false;
    } else {
        montoMostrar.innerHTML = '$0';
        fichasMostrar.innerHTML = '0 fichas';
        btnContinuar.disabled = true;
    }
}

// Limpiar selección de montos predefinidos
function limpiarSeleccionMontos() {
    montosCards.forEach(card => {
        card.classList.remove('selected');
    });
}

// ===========================================
// EVENTOS DE SELECCIÓN
// ===========================================

// Selección de montos predefinidos
if (montosCards.length > 0) {
    montosCards.forEach(card => {
        card.addEventListener('click', () => {
            limpiarSeleccionMontos();
            card.classList.add('selected');
            
            // Limpiar input personalizado
            if (montoPersonalizado) montoPersonalizado.value = '';
            
            // Obtener monto
            const monto = parseInt(card.dataset.monto);
            montoSeleccionado = monto;
            actualizarResumen(montoSeleccionado);
        });
    });
}

// Monto personalizado
if (montoPersonalizado) {
    montoPersonalizado.addEventListener('input', (e) => {
        limpiarSeleccionMontos();
        
        const monto = parseInt(e.target.value);
        if (!isNaN(monto) && monto >= 100) {
            montoSeleccionado = monto;
            actualizarResumen(montoSeleccionado);
        } else if (e.target.value === '') {
            montoSeleccionado = 0;
            actualizarResumen(0);
        } else if (monto < 100) {
            montoSeleccionado = 0;
            actualizarResumen(0);
            // Mostrar feedback visual
            montoPersonalizado.style.borderColor = '#dc3545';
            setTimeout(() => {
                montoPersonalizado.style.borderColor = '';
            }, 1500);
        }
    });
}

// Selección de método de pago
if (metodoCards.length > 0) {
    metodoCards.forEach(card => {
        card.addEventListener('click', () => {
            metodoCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            metodoSeleccionado = card.dataset.metodo;
        });
    });
}

// ===========================================
// GENERAR CONTENIDO DEL MODAL DE PAGO
// ===========================================

function generarContenidoPago(monto, metodo) {
    const resultado = calcularFichas(monto);
    const idTransaccion = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    
    switch(metodo) {
        case 'mercadopago':
            return `
                <div class="text-center">
                    <i class="fab fa-mercadopago fa-4x text-gold mb-3"></i>
                    <h5 class="text-gold">Mercado Pago</h5>
                    <div class="info-pago">
                        <p class="mb-2">Monto: <strong class="text-gold">$${monto.toLocaleString()}</strong></p>
                        <p class="mb-2">Fichas totales: <strong class="text-gold">${resultado.total.toLocaleString()}</strong></p>
                        ${resultado.porcentaje > 0 ? `<p class="mb-0 small">Bonus aplicado: +${resultado.porcentaje}% (${resultado.bonus.toLocaleString()} fichas extra)</p>` : ''}
                    </div>
                    <div id="mercadopagoBoton" class="my-3"></div>
                    <p class="small text-white-50">Serás redirigido a Mercado Pago para completar el pago</p>
                    <button id="simularPagoMP" class="btn-confirmar mt-2">
                        <i class="fas fa-credit-card"></i> Simular pago (Demo)
                    </button>
                </div>
            `;
            
        case 'qr':
            return `
                <div class="text-center">
                    <i class="fas fa-qrcode fa-4x text-gold mb-3"></i>
                    <h5 class="text-gold">Pago con QR</h5>
                    <div class="info-pago">
                        <p class="mb-2">Monto: <strong class="text-gold">$${monto.toLocaleString()}</strong></p>
                        <p class="mb-2">Fichas: <strong class="text-gold">${resultado.total.toLocaleString()}</strong></p>
                    </div>
                    <div class="qr-container my-3">
                        <canvas id="qrCanvas" width="180" height="180"></canvas>
                    </div>
                    <p class="small text-white-50 mb-2">Escanea este código QR con Mercado Pago</p>
                    <p class="small text-white-50 mb-3">ID Transacción: ${idTransaccion}</p>
                    <button id="confirmarPagoQR" class="btn-confirmar">
                        <i class="fas fa-check-circle"></i> Confirmar pago
                    </button>
                </div>
            `;
            
        case 'transferencia':
            return `
                <div class="text-center">
                    <i class="fas fa-university fa-4x text-gold mb-3"></i>
                    <h5 class="text-gold">Transferencia Bancaria</h5>
                    <div class="info-pago text-start">
                        <p class="mb-2"><strong class="text-gold">Alias:</strong> CASINO.FICHAS.ARG</p>
                        <p class="mb-2"><strong class="text-gold">CBU:</strong> 0000003100000000000001</p>
                        <p class="mb-2"><strong class="text-gold">Titular:</strong> Casino Online SRL</p>
                        <p class="mb-2"><strong class="text-gold">Monto:</strong> $${monto.toLocaleString()}</p>
                        <p class="mb-0"><strong class="text-gold">Referencia:</strong> ${idTransaccion}</p>
                    </div>
                    <p class="small text-white-50 my-3">Realiza la transferencia y luego confirma para acreditar tus fichas</p>
                    <button id="confirmarTransferencia" class="btn-confirmar">
                        <i class="fas fa-check-circle"></i> Ya transferí, confirmar
                    </button>
                </div>
            `;
            
        default:
            return '<p class="text-danger">Método de pago no válido</p>';
    }
}

// ===========================================
// PROCESAR PAGO EXITOSO
// ===========================================

function procesarPagoExitoso(monto, metodo) {
    const resultado = calcularFichas(monto);
    
    // Mostrar mensaje de éxito en el modal
    if (modalPagoBody) {
        modalPagoBody.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-check-circle fa-5x text-success mb-3"></i>
                <h4 class="text-gold">¡Pago exitoso!</h4>
                <div class="info-pago mt-3">
                    <p class="mb-2">Se acreditaron <strong class="text-gold">${resultado.total.toLocaleString()} fichas</strong></p>
                    <p class="mb-0 small">ID Transacción: ${Date.now()}</p>
                </div>
                <div class="mt-4">
                    <button onclick="location.reload()" class="btn btn-outline-gold me-2">
                        <i class="fas fa-redo"></i> Nueva carga
                    </button>
                    <button onclick="window.location.href='../index.html'" class="btn btn-gold">
                        <i class="fas fa-home"></i> Volver al casino
                    </button>
                </div>
            </div>
        `;
    }
    
    // Guardar en localStorage (simulación)
    const fichasActuales = parseInt(localStorage.getItem('fichasUsuario') || '0');
    const nuevasFichas = fichasActuales + resultado.total;
    localStorage.setItem('fichasUsuario', nuevasFichas);
    localStorage.setItem('ultimaTransaccion', JSON.stringify({
        monto: monto,
        fichas: resultado.total,
        metodo: metodo,
        fecha: new Date().toISOString()
    }));
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('fichasActualizadas', { 
        detail: { fichas: nuevasFichas, transaccion: resultado.total }
    }));
}

// ===========================================
// EVENTO DEL BOTÓN CONTINUAR
// ===========================================

if (btnContinuar) {
    btnContinuar.addEventListener('click', () => {
        if (montoSeleccionado >= 100) {
            // Generar contenido del modal
            const contenido = generarContenidoPago(montoSeleccionado, metodoSeleccionado);
            if (modalPagoBody) modalPagoBody.innerHTML = contenido;
            
            // Mostrar modal
            if (modalPago) modalPago.show();
            
            // Configurar eventos según el método seleccionado
            setTimeout(() => {
                if (metodoSeleccionado === 'mercadopago') {
                    const btnSimular = document.getElementById('simularPagoMP');
                    if (btnSimular) {
                        btnSimular.addEventListener('click', () => {
                            procesarPagoExitoso(montoSeleccionado, metodoSeleccionado);
                        });
                    }
                }
                
                if (metodoSeleccionado === 'qr') {
                    // Generar QR simple (para demo)
                    const canvas = document.getElementById('qrCanvas');
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, 180, 180);
                        ctx.fillStyle = 'black';
                        ctx.font = 'bold 14px Arial';
                        ctx.fillText('MP', 80, 60);
                        ctx.font = '10px Arial';
                        ctx.fillText(`$${montoSeleccionado}`, 70, 90);
                        ctx.fillText('Casino Online', 55, 120);
                    }
                    
                    const btnConfirmar = document.getElementById('confirmarPagoQR');
                    if (btnConfirmar) {
                        btnConfirmar.addEventListener('click', () => {
                            procesarPagoExitoso(montoSeleccionado, metodoSeleccionado);
                        });
                    }
                }
                
                if (metodoSeleccionado === 'transferencia') {
                    const btnConfirmar = document.getElementById('confirmarTransferencia');
                    if (btnConfirmar) {
                        btnConfirmar.addEventListener('click', () => {
                            procesarPagoExitoso(montoSeleccionado, metodoSeleccionado);
                        });
                    }
                }
            }, 100);
        }
    });
}

// ===========================================
// MOSTRAR SALDO ACTUAL
// ===========================================

function mostrarSaldoActual() {
    const saldo = localStorage.getItem('fichasUsuario');
    if (saldo && parseInt(saldo) > 0) {
        const headerSaldo = document.querySelector('.navbar .d-flex');
        if (headerSaldo && !document.getElementById('saldoUsuario')) {
            const saldoBadge = document.createElement('div');
            saldoBadge.id = 'saldoUsuario';
            saldoBadge.className = 'me-3 text-gold fw-bold';
            saldoBadge.innerHTML = `<i class="fas fa-coins"></i> ${parseInt(saldo).toLocaleString()} fichas`;
            headerSaldo.insertBefore(saldoBadge, headerSaldo.firstChild);
        }
    }
}

mostrarSaldoActual();

// Escuchar cambios en localStorage
window.addEventListener('storage', (e) => {
    if (e.key === 'fichasUsuario') {
        mostrarSaldoActual();
    }
});

console.log('Carga de fichas - JavaScript cargado correctamente');