/**
 * =====================================================
 * TABLA.JS
 * Render inventario + acciones + historial
 * =====================================================
 */


/**
 * Render tabla principal
 */
function renderTabla() {

    const tbody =
        document.getElementById("tabla");

    if (!tbody) return;

    let html = "";


    const filtrados =
        datos.filter(item => {

            const matchEstado =
                !filtroEstado ||
                item.Estado === filtroEstado;

            const texto =
                (textoBusqueda || "").toLowerCase();

            const matchTexto =
                !texto ||
                (item.LOTE || "").toLowerCase().includes(texto) ||
                (item.PRODUCTO || "").toLowerCase().includes(texto) ||
                (item.DESCRIPCION || "").toLowerCase().includes(texto);

            return matchEstado && matchTexto;

        });


    filtrados.forEach(item => {

        const id =
            item["NUMERO REGISTRO"];

        const estado =
            item.Estado;


        let claseFila = "";
        let badge = "";
        let acciones = "";


        // =========================
        // EN ALMACÉN
        // =========================
        if (estado === "En Almacén") {

            claseFila = "estado-almacen";

            badge = `
                <span class="badge badge-almacen">
                    En Almacén
                </span>
            `;

            acciones = `
                <div class="acciones">

                    <button class="btn btn-info"
                        onclick="verCarrete(${id})">👁</button>

                    <button class="btn btn-warning"
                        onclick="editarCarreteUI(${id})">✏</button>

                    <button class="btn btn-danger"
                        onclick="eliminarCarreteUI(${id})">🗑</button>

                    <button class="btn btn-danger"
                        onclick="salidaUI(${id})">⬆</button>

                    <button class="btn btn-info"
                        onclick="verHistorial(${id})">📋</button>

                </div>
            `;
        }


        // =========================
        // FUERA
        // =========================
        else if (estado === "Fuera") {

            claseFila = "estado-fuera";

            badge = `
                <span class="badge badge-fuera">
                    Fuera
                </span>
            `;

            acciones = `
                <div class="acciones">

                    <button class="btn btn-info"
                        onclick="verCarrete(${id})">👁</button>

                    <button class="btn btn-warning"
                        onclick="editarCarreteUI(${id})">✏</button>

                    <button class="btn btn-danger"
                        onclick="eliminarCarreteUI(${id})">🗑</button>

                    <button class="btn btn-success"
                        onclick="entradaUI(${id})">⬇</button>

                    <button class="btn btn-info"
                        onclick="verHistorial(${id})">📋</button>

                </div>
            `;
        }


        // =========================
        // VACÍA
        // =========================
        else if (estado === "Vacía") {

            claseFila = "estado-vacia";

            badge = `
                <span class="badge badge-vacia">
                    Vacía
                </span>
            `;

            acciones = `
                <div class="acciones">

                    <button class="btn btn-info"
                        onclick="verCarrete(${id})">👁</button>

                    <button class="btn btn-warning"
                        onclick="editarCarreteUI(${id})">✏</button>

                    <button class="btn btn-danger"
                        onclick="eliminarCarreteUI(${id})">🗑</button>

                    <button class="btn btn-info"
                        onclick="verHistorial(${id})">📋</button>

                </div>
            `;
        }


        // =========================
        // ROW
        // =========================
        html += `
            <tr class="${claseFila}">

                <td>${item.LOTE || ""}</td>

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
 * =========================
 * ACCIONES
 * =========================
 */


/**
 * Ver carrete
 */
function verCarrete(id) {

    const item =
        datos.find(x =>
            Number(x["NUMERO REGISTRO"]) === Number(id)
        );

    abrirModal(`
        <h2>Detalle Carrete</h2>

        <pre style="background:#f1f5f9;padding:15px;border-radius:10px;">
${JSON.stringify(item, null, 2)}
        </pre>

        <div class="modal-footer">

            <button class="btn btn-primary"
                onclick="cerrarModal()">
                Cerrar
            </button>

        </div>
    `);

}


/**
 * Eliminar
 */
async function eliminarCarreteUI(id) {

    if (!confirm("¿Eliminar carrete?")) return;

    await eliminarCarrete(id);

    await recargarSistema();

}


/**
 * SALIDA (Convertido a Formulario en Modal)
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
 * Procesar envío del formulario de Salida
 */
async function procesarSalida(event, id) {
    event.preventDefault(); // Evita que recargue la página

    const actuacion = document.getElementById("modalActuacion").value;
    const brigada = document.getElementById("modalBrigada").value;

    cerrarModal();

    await registrarSalida({
        id,
        ACTUACION: actuacion,
        BRIGADA: brigada
    });

    await recargarSistema();
}


/**
 * ENTRADA (Con panel de estado actual: PEx Anterior, Ubicación y cálculos en vivo)
 */
function entradaUI(id) {
    // 1. Buscamos el carrete en el inventario general (datos)
    const carrete = datos.find(x => Number(x["NUMERO REGISTRO"]) === Number(id));
    
    // 2. Extraemos los valores actuales de la fila de stock
    const pexAnterior = carrete ? (carrete.PI || 0) : 0; 
    const ubicacionActual = carrete ? (carrete.UBICACION || "Sin ubicación") : "Sin ubicación"; // Ajusta 'UBICACION' si en tu hoja se llama diferente (ej. UBICACIÓN o ZONA)
    const metrosTotales = carrete ? (carrete.METROS || 0) : 0;

    abrirModal(`
        <h2>Registrar Entrada de Carrete</h2>
        <form id="formEntrada" onsubmit="procesarEntrada(event, ${id}, ${pexAnterior})" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
            
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; font-size: 14px; color: #334155; display: flex; flex-direction: column; gap: 8px; border: 1px solid #e2e8f0;">
                <div style="text-transform: uppercase; font-size: 11px; font-weight: bold; color: #64748b; letter-spacing: 0.5px; margin-bottom: 2px;">
                    Estado Actual del Carrete
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div><strong>PEx Salida (Anterior):</strong> <span style="color: #0f172a;">${pexAnterior} m</span></div>
                    <div><strong>Ubicación Actual:</strong> <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #1e293b;">${ubicacionActual}</span></div>
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
                <textarea id="modalObs" rows="3" placeholder="Notas adicionales..." style="padding: 8px; border: 1px solid #ccc; border-radius: 5px; resize: vertical Orion;"></textarea>
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
        previewConsumo.innerText = "0";
        return;
    }

    const piNuevo = Number(valorInput);
    const consumo = Math.abs(Number(piAnterior) - piNuevo);

    // Actualizamos la interfaz del modal al vuelo
    previewPexNuevo.innerText = piNuevo;
    previewConsumo.innerText = consumo;
}

/**
 * Procesar envío del formulario de Entrada y calcular Consumo
 */
async function procesarEntrada(event, id, piAnterior) {
    event.preventDefault();

    const piNuevo = Number(document.getElementById("modalPi").value);
    const actuacion = document.getElementById("modalActuacion").value;
    const brigada = document.getElementById("modalBrigada").value;
    const obs = document.getElementById("modalObs").value;

    // Calculamos la diferencia en valor absoluto. Da igual si es (1000 - 800) o (800 - 1000), siempre devolverá 200.
    const consumoCalculado = Math.abs(Number(piAnterior) - piNuevo);

    cerrarModal();

    await registrarEntrada({
        id,
        PI_NUEVO: piNuevo,
        ACTUACION: actuacion,
        BRIGADA: brigada,
        OBSERVACIONES: obs,
        CONSUMO: consumoCalculado, // Pasamos el consumo calculado automáticamente en positivo
        ESTADO_FINAL: "En Almacén"
    });

    await recargarSistema();
}
