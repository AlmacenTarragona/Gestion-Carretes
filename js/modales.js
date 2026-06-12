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
 * HISTORIAL - Filtrado exclusivo por LOTE para evitar mezclas de registros idénticos
 */
async function verHistorial(id) {
    console.log(`%c=== INICIANDO FILTRADO EXCLUSIVO ===`, 'background: #0f172a; color: #38bdf8; padding: 4px; font-weight: bold;');
    
    // 1. Buscamos primero el carrete maestro para saber cuál es su LOTE real único
    const carreteOriginal = datos.find(x => 
        String(x["NUMERO REGISTRO"]).trim() === String(id).trim()
    );
    
    if (!carreteOriginal) {
        console.error("No se encontró el carrete maestro con ID:", id);
        return;
    }

    const loteReal = String(carreteOriginal.LOTE).trim();
    const metrosTotalesCarrete = Number(carreteOriginal.METROS || 0);
    
    console.log(`Buscando movimientos en la hoja exclusivos para el Lote: ${loteReal}`);

    // 2. Traemos TODOS los movimientos pero los FILTRAMOS en caliente para quedarnos SOLO con los de su lote
    const todosLosMovimientos = await obtenerHistorial(id) || [];
    const movimientos = todosLosMovimientos.filter(m => 
        String(m.LOTE).trim() === loteReal
    );

    console.log(`Movimientos totales encontrados en la hoja para este lote: ${movimientos.length}`);

    let rows = "";

    movimientos.forEach((m, index) => {
        const fechaLimpia = m.FECHA 
            ? new Date(m.FECHA).toLocaleString('es-ES', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              })
            : "";

        // Controlar si la fila tiene PEx
        const tienePexNuevo = m.PI_NUEVO !== undefined && m.PI_NUEVO !== null && String(m.PI_NUEVO).trim() !== "";
        
        let pexAnteriorMostrar = m.PI_ANTERIOR !== undefined && String(m.PI_ANTERIOR).trim() !== "" ? m.PI_ANTERIOR : "--";
        let pexNuevoMostrar = tienePexNuevo ? m.PI_NUEVO : "--";
        
        let metrosCalculados = 0;

        // Lógica de metros remanentes decrecientes
        if (m.TIPO === "SALIDA" && !tienePexNuevo) {
            metrosCalculados = m.METROS_RESTANTES !== undefined && m.METROS_RESTANTES !== "" 
                ? Number(m.METROS_RESTANTES) 
                : metrosTotalesCarrete;
        } else {
            const pexActual = tienePexNuevo ? Number(m.PI_NUEVO) : 0;
            metrosCalculados = metrosTotalesCarrete > 0 ? Math.abs(metrosTotalesCarrete - pexActual) : Number(m.METROS_RESTANTES || 0);
        }

        rows += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 8px;">${fechaLimpia}</td>
                <td style="padding: 10px 8px;"><span class="badge ${m.TIPO === 'ENTRADA' ? 'badge-almacen' : 'badge-fuera'}">${m.TIPO || ""}</span></td>
                <td style="padding: 10px 8px;">${m.ACTUACION || ""}</td>
                <td style="padding: 10px 8px;">${m.BRIGADA || ""}</td>
                <td style="padding: 10px 8px; font-weight: 500;">${pexAnteriorMostrar}</td> 
                <td style="padding: 10px 8px; font-weight: bold; color: #0284c7;">${pexNuevoMostrar}</td>    
                <td style="padding: 10px 8px; color: #16a34a; font-weight: 500;">${m.CONSUMO ?? 0} m</td>
                <td style="padding: 10px 8px; font-weight: bold; color: #1e293b;">${metrosCalculados} m</td>
            </tr>
        `;
    });

    if (!rows) {
        rows = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#64748b;">⚠️ No se encontraron movimientos para el lote ${loteReal}.</td></tr>`;
    }

    const html = `
        <h2>📋 Historial: Lote ${loteReal} <span style="font-size: 14px; color: #64748b; font-weight: normal;">(${movimientos.length} movimientos)</span></h2>
        <div style="max-height:60vh;overflow-y:auto;margin-top:15px;border: 1px solid #e2e8f0; border-radius: 8px;">
            <table style="width:100%;border-collapse:collapse;text-align:left;font-size:13px;">
                <thead>
                    <tr style="background:#0f172a;color:white;position:sticky;top:0;">
                        <th style="padding: 12px 8px;">Fecha</th>
                        <th style="padding: 12px 8px;">Tipo</th>
                        <th style="padding: 12px 8px;">Actuación</th>
                        <th style="padding: 12px 8px;">Brigada</th>
                        <th style="padding: 12px 8px;">PEx Ant.</th> 
                        <th style="padding: 12px 8px;">PEx Nue.</th> 
                        <th style="padding: 12px 8px;">Consumo</th>
                        <th style="padding: 12px 8px;">Metros Rem.</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <div class="modal-footer" style="margin-top:15px;display:flex;justify-content:flex-end;">
            <button class="btn btn-primary" onclick="cerrarModal()">Cerrar Historial</button>
        </div>
    `;

    abrirModal(html);
}
