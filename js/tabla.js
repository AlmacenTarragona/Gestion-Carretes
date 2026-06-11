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
 * ENTRADA (Formulario con cálculo automático de consumo)
 */
function entradaUI(id) {
    // Buscamos el carrete en nuestro array local de 'datos' para saber su PI anterior
    const carrete = datos.find(x => Number(x["NUMERO REGISTRO"]) === Number(id));
    // Si por lo que sea no tiene PI o no se encuentra, asumimos 0
    const piAnterior = carrete ? (carrete.PI || 0) : 0;

    abrirModal(`
        <h2>Registrar Entrada de Carrete</h2>
        <form id="formEntrada" onsubmit="procesarEntrada(event, ${id}, ${piAnterior})" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
            
            <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; font-size: 14px; color: #475569;">
                <strong>PI de Salida (Anterior):</strong> ${piAnterior} m
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-weight: bold;">PI actual (Retorno):</label>
                <input type="number" id="modalPi" required placeholder="Introduce el PI actual con el que vuelve" style="padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
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
