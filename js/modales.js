/**
 * =====================================================
 * MODALES.JS
 * CRUD UI real (sin prompts)
 * =====================================================
 */


/**
 * Abre modal genérico
 */
function abrirModal(html) {

    const overlay =
        document.getElementById("modalOverlay");

    const content =
        document.getElementById("modalContent");

    content.innerHTML = html;

    overlay.classList.remove("oculto");

}


/**
 * Cierra modal
 */
function cerrarModal() {

    document
        .getElementById("modalOverlay")
        .classList
        .add("oculto");

}


/**
 * NUEVO CARRETE
 */
function abrirNuevoCarrete() {

    const html = `
        <h2>Nuevo Carrete</h2>

        <div class="modal-grid">

            <div>
                <label>LOTE</label>
                <input id="m_lote">
            </div>

            <div>
                <label>UBICACIÓN</label>
                <input id="m_ubi">
            </div>

            <div>
                <label>OPE</label>
                <input id="m_ope">
            </div>

            <div>
                <label>PRODUCTO</label>
                <input id="m_producto">
            </div>

            <div>
                <label>DESCRIPCIÓN</label>
                <input id="m_descripcion">
            </div>

            <div>
                <label>METROS</label>
                <input id="m_metros" type="number">
            </div>

            <div>
                <label>PI</label>
                <input id="m_pi" type="number">
            </div>

            <div>
                <label>PE</label>
                <input id="m_pe" type="number">
            </div>

            <div>
                <label>OBSERVACIONES</label>
                <textarea id="m_obs"></textarea>
            </div>

        </div>

        <div class="modal-footer">

            <button class="btn btn-light"
                onclick="cerrarModal()">
                Cancelar
            </button>

            <button class="btn btn-primary"
                onclick="guardarCarrete()">
                Guardar
            </button>

        </div>
    `;

    abrirModal(html);

}


/**
 * GUARDAR CARRETE
 */
async function guardarCarrete() {

    const data = {

        LOTE:
            document.getElementById("m_lote").value,

        UBI:
            document.getElementById("m_ubi").value,

        OPE:
            document.getElementById("m_ope").value,

        PRODUCTO:
            document.getElementById("m_producto").value,

        DESCRIPCION:
            document.getElementById("m_descripcion").value,

        METROS:
            document.getElementById("m_metros").value,

        PI:
            document.getElementById("m_pi").value,

        PE:
            document.getElementById("m_pe").value,

        OBSERVACIONES:
            document.getElementById("m_obs").value,

        Estado:
            "En Almacén"

    };

    await crearCarrete({
        action: "create",
        data
    });

    cerrarModal();

    await recargarSistema();

}


/**
 * VER CARRETE
 */
function verCarrete(id) {

    const item =
        datos.find(x =>
            Number(x["NUMERO REGISTRO"]) === Number(id)
        );

    const html = `
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
    `;

    abrirModal(html);

}


/**
 * EDITAR CARRETE
 */
function editarCarreteUI(id) {

    const item =
        datos.find(x =>
            Number(x["NUMERO REGISTRO"]) === Number(id)
        );

    carreteSeleccionado = id;

    const html = `
        <h2>Editar Carrete</h2>

        <div class="modal-grid">

            <div>
                <label>LOTE</label>
                <input id="e_lote" value="${item.LOTE || ""}">
            </div>

            <div>
                <label>PRODUCTO</label>
                <input id="e_producto" value="${item.PRODUCTO || ""}">
            </div>

            <div>
                <label>DESCRIPCIÓN</label>
                <input id="e_descripcion" value="${item.DESCRIPCION || ""}">
            </div>

            <div>
                <label>METROS</label>
                <input id="e_metros" type="number" value="${item.METROS || 0}">
            </div>

            <div>
                <label>PI</label>
                <input id="e_pi" type="number" value="${item.PI || 0}">
            </div>

            <div>
                <label>ESTADO</label>
                <select id="e_estado">
                    <option ${item.Estado === "En Almacén" ? "selected" : ""}>En Almacén</option>
                    <option ${item.Estado === "Fuera" ? "selected" : ""}>Fuera</option>
                    <option ${item.Estado === "Vacía" ? "selected" : ""}>Vacía</option>
                </select>
            </div>

        </div>

        <div class="modal-footer">

            <button class="btn btn-light"
                onclick="cerrarModal()">
                Cancelar
            </button>

            <button class="btn btn-success"
                onclick="guardarEdicion(${id})">
                Guardar cambios
            </button>

        </div>
    `;

    abrirModal(html);

}


/**
 * GUARDAR EDICIÓN
 */
async function guardarEdicion(id) {

    const data = {

        LOTE:
            document.getElementById("e_lote").value,

        PRODUCTO:
            document.getElementById("e_producto").value,

        DESCRIPCION:
            document.getElementById("e_descripcion").value,

        METROS:
            document.getElementById("e_metros").value,

        PI:
            document.getElementById("e_pi").value,

        Estado:
            document.getElementById("e_estado").value

    };

    await editarCarrete(id, data);

    cerrarModal();

    await recargarSistema();

}
/**
 * =====================================================
 * HISTORIAL DE MOVIMIENTOS
 * =====================================================
 */

async function verHistorial(id) {

    const movimientos =
        await obtenerHistorial(id) || [];

    let rows = "";

    movimientos.forEach(m => {

        rows += `
            <tr>
                <td>${m.FECHA || ""}</td>
                <td>${m.TIPO || ""}</td>
                <td>${m.ACTUACION || ""}</td>
                <td>${m.BRIGADA || ""}</td>
                <td>${m.PI_ANTERIOR || ""}</td>
                <td>${m.PI_NUEVO || ""}</td>
                <td>${m.CONSUMO || 0}</td>
                <td>${m.METROS_RESTANTES || ""}</td>
            </tr>
        `;

    });

    if (!rows) {

        rows = `
            <tr>
                <td colspan="8" style="text-align:center;padding:20px;">
                    No existen movimientos para este carrete
                </td>
            </tr>
        `;

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
                        <th>PI Ant.</th>
                        <th>PI Nue.</th>
                        <th>Consumo</th>
                        <th>Metros</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>

        <div class="modal-footer">

            <button
                class="btn btn-primary"
                onclick="cerrarModal()">

                Cerrar

            </button>

        </div>
    `;

    abrirModal(html);

}

