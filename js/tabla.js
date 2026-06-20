/**
 * =====================================================
 * TABLA.JS
 * Render inventario + acciones + historial
 * =====================================================
 * Versión Base: 13
 */

/**
 * Render tabla principal
 */
function renderTabla() {

    const tbody = document.getElementById("tabla");
    if (!tbody) return;

    let html = "";

    const filtrados = datos.filter(item => {
        const matchEstado = !filtroEstado || item.Estado === filtroEstado;
        const texto = (textoBusqueda || "").toLowerCase();

        const matchTexto =
            !texto ||
            (item.LOTE || "").toLowerCase().includes(texto) ||
            (item.PRODUCTO || "").toLowerCase().includes(texto) ||
            (item.DESCRIPCION || "").toLowerCase().includes(texto);

        return matchEstado && matchTexto;
    });

    filtrados.forEach(item => {
        const id = item["NUMERO REGISTRO"];
        const estado = item.Estado;

        let claseFila = "";
        let badge = "";
        let acciones = "";

        // =========================
        // EN ALMACÉN
        // =========================
        if (estado === "En Almacén") {
            claseFila = "estado-almacen";
            badge = `<span class="badge badge-almacen">En Almacén</span>`;
            acciones = `
                <div class="acciones">
                    <button class="btn btn-info" onclick="verCarrete(${id})">👁</button>
                    <button class="btn btn-warning" onclick="editarCarreteUI(${id})">✏</button>
                    <button class="btn btn-danger" onclick="eliminarCarreteUI(${id})">🗑</button>
                    <button class="btn btn-danger" onclick="salidaUI(${id})">⬆</button>
                    <button class="btn btn-info" onclick="verHistorial(${id})">📋</button>
                </div>
            `;
        }
        // =========================
        // FUERA
        // =========================
        else if (estado === "Fuera") {
            claseFila = "estado-fuera";
            badge = `<span class="badge badge-fuera">Fuera</span>`;
            acciones = `
                <div class="acciones">
                    <button class="btn btn-info" onclick="verCarrete(${id})">👁</button>
                    <button class="btn btn-warning" onclick="editarCarreteUI(${id})">✏</button>
                    <button class="btn btn-danger" onclick="eliminarCarreteUI(${id})">🗑</button>
                    <button class="btn btn-success" onclick="entradaUI(${id})">⬇</button>
                    <button class="btn btn-info" onclick="verHistorial(${id})">📋</button>
                </div>
            `;
        }
        // =========================
        // VACÍA
        // =========================
        else if (estado === "Vacía") {
            claseFila = "estado-vacia";
            badge = `<span class="badge badge-vacia">Vacía</span>`;
            acciones = `
                <div class="acciones">
                    <button class="btn btn-info" onclick="verCarrete(${id})">👁</button>
                    <button class="btn btn-warning" onclick="editarCarreteUI(${id})">✏</button>
                    <button class="btn btn-danger" onclick="eliminarCarreteUI(${id})">🗑</button>
                    <button class="btn btn-info" onclick="verHistorial(${id})">📋</button>
                </div>
            `;
        }

        // Fila de renderizado manteniendo .PI original para backend, pero visualmente adaptable
        html += `
    <tr class="${claseFila}">
        <td>${item.LOTE || ""}</td>
        <td>${item["000UBI."] || ""}</td>
        <td>${item.PRODUCTO || ""}</td>
        <td>${item.DESCRIPCION || ""}</td>
        <td>${item.METROS || ""}</td>
        <td>${item.PI || ""}</td>
        <td>${badge}</td>
        <td>${acciones}</td>
    </tr>
`;
    });

    tbody.innerHTML = html;
}

/**
 * =====================================================
 * ACCIONES CENTRALES
 * =====================================================
 */

/**
 * Ver detalle de un carrete
 */
function verCarrete(id) {
    const item = datos.find(x => Number(x["NUMERO REGISTRO"]) === Number(id));

    abrirModal(`
        <h2>Detalle Carrete</h2>
        <pre style="background:#f1f5f9;padding:15px;border-radius:10px;text-align:left;overflow:auto;">${JSON.stringify(item, null, 2)}</pre>
        <div class="modal-footer">
            <button class="btn btn-primary" onclick="cerrarModal()">Cerrar</button>
        </div>
    `);
}

/**
 * Eliminar carrete del sistema
 */
async function eliminarCarreteUI(id) {
    if (!confirm("¿Eliminar carrete?")) return;
    await eliminarCarrete(id);
    await recargarSistema();
}

/**
 * SALIDA - Interfaz de Formulario Simplificado
 */
function salidaUI(id) {
    abrirModal(`
        <h2>Registrar Salida de Carrete</h2>
        <form id="formSalida" onsubmit="procesarSalida(event, ${id})" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
            
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-weight: bold;">Actuación / Proyecto:</label>
                <input type="text" id="modalActuacion" required placeholder="Ej. Proyecto Norte" style="padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-weight: bold;">Brigada:</label>
                <input type="text" id="modalBrigada" required placeholder="Ej. Brigada A" style="padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
            </div>

            <div class="modal-footer" style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                <button type="button" class="btn btn-danger" onclick="cerrarModal()">Cancelar</button>
                <button type="submit" class="btn btn-success">Confirmar Salida</button>
            </div>
        </form>
    `);
}

/**
 * SALIDA - Procesar envío y encadenar datos históricos
 */
async function procesarSalida(event, id) {
    event.preventDefault();

    const carrete = datos.find(x => Number(x["NUMERO REGISTRO"]) === Number(id));
    const metrosTotales = carrete ? Number(carrete.METROS || 0) : 0;

    // Recuperamos el historial dinámico para no perder el rastro de la última PEx
    const movimientos = await obtenerHistorial(id) || [];
    
    let ultimoPexReal = 0;
    if (movimientos.length > 0) {
        const ultimoMovimiento = movimientos[movimientos.length - 1];
        ultimoPexReal = Number(ultimoMovimiento.PI_NUEVO || 0);
    } else {
        ultimoPexReal = carrete ? Number(carrete.PI || 0) : 0;
    }
    
    // Metros restantes = fábrica - posición PEx actual
    const metrosRestantesActuales = Math.abs(metrosTotales - ultimoPexReal);

    const actuacion = document.getElementById("modalActuacion").value;
    const brigada = document.getElementById("modalBrigada").value;

    cerrarModal();

    await registrarSalida({
        id: id,
        ACTUACION: actuacion,
        BRIGADA: brigada,
        PI_ANTERIOR: ultimoPexReal,
        PI_NUEVO: ultimoPexReal, 
        CONSUMO: 0, 
        METROS_RESTANTES: metrosRestantesActuales, 
        ESTADO_FINAL: "En Obra"          
    });

    await recargarSistema();
}
/**
 * ENTRADA - Interfaz con Panel Informativo y cálculo en vivo
 */
async function entradaUI(id) {
    const carrete = datos.find(x => Number(x["NUMERO REGISTRO"]) === Number(id));
    const metrosTotales = carrete ? Number(carrete.METROS || 0) : 0;
    const ubicacionActual = carrete ? (carrete.UBICACION || "Sin ubicación") : "Sin ubicación";

    const movimientos = await obtenerHistorial(id) || [];
    
    let pexAnterior = 0;
    if (movimientos.length > 0) {
        const ultimoMovimiento = movimientos[movimientos.length - 1];
        pexAnterior = Number(ultimoMovimiento.PI_NUEVO || 0);
    } else {
        pexAnterior = carrete ? Number(carrete.PI || 0) : 0;
    }

    abrirModal(`
        <h2>Registrar Entrada de Carrete</h2>
        <form id="formEntrada" onsubmit="procesarEntrada(event, ${id}, ${pexAnterior}, ${metrosTotales})" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
            
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; font-size: 14px; color: #334155; display: flex; flex-direction: column; gap: 8px; border: 1px solid #e2e8f0;">
                <div style="text-transform: uppercase; font-size: 11px; font-weight: bold; color: #64748b; letter-spacing: 0.5px; margin-bottom: 2px;">
                    Estado Actual del Carrete
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div><strong>PEx Anterior:</strong> <span style="color: #0f172a; font-weight: bold;">${pexAnterior} m</span></div>
                    <div><strong>Ubicación:</strong> <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #1e293b;">${ubicacionActual}</span></div>
                </div>
                <div style="border-top: 1px dashed #e2e8f0; margin-top: 4px; padding-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div><strong>PEx Retorno (Nuevo):</strong> <span id="previewPexNuevo" style="font-weight: bold; color: #0284c7;">--</span></div>
                    <div><strong>Consumo Calculado:</strong> <span id="previewConsumo" style="font-weight: bold; color: #16a34a;">0 m</span></div>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-weight: bold;">PEx actual (Dato de retorno):</label>
                <input type="number" id="modalPi" required placeholder="Ej. 750" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 15px;"
                       oninput="calcularConsumoEnVivo(this.value, ${pexAnterior})">
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-weight: bold;">Actuación / Proyecto:</label>
                <input type="text" id="modalActuacion" required placeholder="Ej. Proyecto Norte" style="padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-weight: bold;">Brigada:</label>
                <input type="text" id="modalBrigada" required placeholder="Ej. Brigada A" style="padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-weight: bold;">Observaciones:</label>
                <textarea id="modalObs" rows="3" placeholder="Notas adicionales..." style="padding: 8px; border: 1px solid #ccc; border-radius: 5px; resize: vertical;"></textarea>
            </div>

            <div class="modal-footer" style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                <button type="button" class="btn btn-danger" onclick="cerrarModal()">Cancelar</button>
                <button type="submit" class="btn btn-success">Confirmar Entrada</button>
            </div>
        </form>
    `);
}

/**
 * Función auxiliar para actualizar los textos del modal al escribir
 */
function calcularConsumoEnVivo(valorInput, piAnterior) {
    const previewPexNuevo = document.getElementById("previewPexNuevo");
    const previewConsumo = document.getElementById("previewConsumo");

    if (!valorInput || isNaN(valorInput)) {
        previewPexNuevo.innerText = "--";
        previewConsumo.innerText = "0 m";
        return;
    }

    const piNuevo = Number(valorInput);
    const consumo = Math.abs(Number(piAnterior) - piNuevo);

    previewPexNuevo.innerText = piNuevo + " m";
    previewConsumo.innerText = consumo + " m";
}

/**
 * ENTRADA - Procesar envío, calcular consumo y metros restantes reales
 */
async function procesarEntrada(event, id, piAnterior, metrosTotales) {
    event.preventDefault();

    const piNuevo = Number(document.getElementById("modalPi").value);
    const actuacion = document.getElementById("modalActuacion").value;
    const brigada = document.getElementById("modalBrigada").value;
    const obs = document.getElementById("modalObs").value;

    // Cálculo matemático impecable basado en encadenamiento lógico
    const consumoCalculado = Math.abs(Number(piAnterior) - piNuevo);
    const metrosRestantesCalculados = Math.abs(Number(metrosTotales) - piNuevo);

    cerrarModal();

    await registrarEntrada({
        id: id,
        ACTUACION: actuacion,
        BRIGADA: brigada,
        PI_ANTERIOR: piAnterior, 
        PI_NUEVO: piNuevo,
        CONSUMO: consumoCalculado, 
        METROS_RESTANTES: metrosRestantesCalculados,
        OBSERVACIONES: obs,
        ESTADO_FINAL: "En Almacén"
    });

    await recargarSistema();
}

/**
 * HISTORIAL - Carga la tabla de movimientos calculando remanentes reales decrecientes
 */
async function verHistorial(id) {
    const movimientos = await obtenerHistorial(id) || [];
    const carreteOriginal = datos.find(x => Number(x["NUMERO REGISTRO"]) === Number(id));
    const metrosTotalesCarrete = carreteOriginal ? Number(carreteOriginal.METROS || 0) : 0;

    let rows = "";

    movimientos.forEach(m => {
        const fechaLimpia = m.FECHA 
            ? new Date(m.FECHA).toLocaleString('es-ES', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              })
            : "";

        const pexActual = Number(m.PI_NUEVO || 0);
        const metrosCalculados = Math.abs(metrosTotalesCarrete - pexActual);

        rows += `
            <tr>
                <td>${fechaLimpia}</td>
                <td>${m.TIPO || ""}</td>
                <td>${m.ACTUACION || ""}</td>
                <td>${m.BRIGADA || ""}</td>
                <td>${m.PI_ANTERIOR ?? ""}</td> 
                <td>${m.PI_NUEVO ?? ""}</td>    
                <td>${m.CONSUMO ?? 0}</td>
                <td>${metrosCalculados}</td>
            </tr>
        `;
    });

    if (!rows) {
        rows = `<tr><td colspan="8" style="text-align:center;padding:20px;">No existen movimientos para este carrete</td></tr>`;
    }

    const html = `
        <h2>📋 Historial de Movimientos</h2>
        <div style="max-height:60vh;overflow:auto;">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="background:#0f172a;color:white;">
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Actuación</th>
                        <th>Brigada</th>
                        <th>PEx Ant.</th> 
                        <th>PEx Nue.</th> 
                        <th>Consumo</th>
                        <th>Metros</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <div class="modal-footer">
            <button class="btn btn-primary" onclick="cerrarModal()">Cerrar</button>
        </div>
    `;

    abrirModal(html);
}
