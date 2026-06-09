/**
 * =====================================================
 * TABLA.JS
 * Render inventario + acciones + filtros
 * =====================================================
 */


/**
 * Render principal de la tabla
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
        // ROW HTML
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
 * ACCIONES UI
 * =========================
 */


/**
 * Ver detalle
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
 * SALIDA
 */
async function salidaUI(id) {

    const actuacion =
        prompt("Actuación / Proyecto");

    const brigada =
        prompt("Brigada");

    await registrarSalida({

        id,
        ACTUACION: actuacion,
        BRIGADA: brigada,
        OBSERVACIONES: ""

    });

    await recargarSistema();

}


/**
 * ENTRADA
 */
async function entradaUI(id) {

    const pi =
        prompt("PI actual");

    const actuacion =
        prompt("Actuación / Proyecto");

    const brigada =
        prompt("Brigada");

    const obs =
        prompt("Observaciones");

    await registrarEntrada({

        id,
        PI_NUEVO: pi,
        ACTUACION: actuacion,
        BRIGADA: brigada,
        OBSERVACIONES: obs,
        ESTADO_FINAL: "En Almacén"

    });

    await recargarSistema();

}
