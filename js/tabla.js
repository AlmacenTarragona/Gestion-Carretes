/**
 * =====================================================
 * TABLA.JS
 * Render de inventario + filtros + acciones
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
                textoBusqueda || "";

            const matchTexto =
                !texto ||
                (
                    (item.LOTE || "").toLowerCase().includes(texto) ||
                    (item.PRODUCTO || "").toLowerCase().includes(texto) ||
                    (item.DESCRIPCION || "").toLowerCase().includes(texto)
                );

            return matchEstado && matchTexto;

        });


    filtrados.forEach(item => {

        const estado = item.Estado;

        let claseFila = "";
        let badge = "";
        let acciones = "";

        switch (estado) {

            case "En Almacén":

                claseFila = "estado-almacen";

                badge =
                    `<span class="badge badge-almacen">En Almacén</span>`;

                acciones = `
                    <div class="acciones">

                        <button class="btn btn-info"
                            onclick="verCarrete(${item['NUMERO REGISTRO']})">
                            👁
                        </button>

                        <button class="btn btn-warning"
                            onclick="editarCarreteUI(${item['NUMERO REGISTRO']})">
                            ✏
                        </button>

                        <button class="btn btn-danger"
                            onclick="eliminarCarreteUI(${item['NUMERO REGISTRO']})">
                            🗑
                        </button>

                        <button class="btn btn-danger"
                            onclick="salidaUI(${item['NUMERO REGISTRO']})">
                            ⬆
                        </button>

                    </div>
                `;

                break;

            case "Fuera":

                claseFila = "estado-fuera";

                badge =
                    `<span class="badge badge-fuera">Fuera</span>`;

                acciones = `
                    <div class="acciones">

                        <button class="btn btn-info"
                            onclick="verCarrete(${item['NUMERO REGISTRO']})">
                            👁
                        </button>

                        <button class="btn btn-warning"
                            onclick="editarCarreteUI(${item['NUMERO REGISTRO']})">
                            ✏
                        </button>

                        <button class="btn btn-danger"
                            onclick="eliminarCarreteUI(${item['NUMERO REGISTRO']})">
                            🗑
                        </button>

                        <button class="btn btn-success"
                            onclick="entradaUI(${item['NUMERO REGISTRO']})">
                            ⬇
                        </button>

                    </div>
                `;

                break;

            case "Vacía":

                claseFila = "estado-vacia";

                badge =
                    `<span class="badge badge-vacia">Vacía</span>`;

                acciones = `
                    <div class="acciones">

                        <button class="btn btn-info"
                            onclick="verCarrete(${item['NUMERO REGISTRO']})">
                            👁
                        </button>

                        <button class="btn btn-warning"
                            onclick="editarCarreteUI(${item['NUMERO REGISTRO']})">
                            ✏
                        </button>

                        <button class="btn btn-danger"
                            onclick="eliminarCarreteUI(${item['NUMERO REGISTRO']})">
                            🗑
                        </button>

                    </div>
                `;

                break;
        }


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
 * ACCIONES UI (PLACEHOLDERS)
 * =========================
 */

function verCarrete(id) {

    const item =
        datos.find(x =>
            Number(x["NUMERO REGISTRO"]) === Number(id)
        );

    alert(JSON.stringify(item, null, 2));

}


/**
 * EDITAR
 */
function editarCarreteUI(id) {

    carreteSeleccionado = id;

    alert("Aquí abriríamos modal de edición (siguiente paso)");

}


/**
 * ELIMINAR
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
        prompt("Actuación (obra/proyecto)");

    const brigada =
        prompt("Brigada");

    await registrarSalida({

        action: "salida",

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
        prompt("PI actual del carrete");

    const actuacion =
        prompt("Actuación");

    const brigada =
        prompt("Brigada");

    const observaciones =
        prompt("Observaciones");

    await registrarEntrada({

        action: "entrada",

        id,

        PI_NUEVO: pi,

        ACTUACION: actuacion,

        BRIGADA: brigada,

        OBSERVACIONES: observaciones,

        ESTADO_FINAL: "En Almacén"

    });

    await recargarSistema();

}
