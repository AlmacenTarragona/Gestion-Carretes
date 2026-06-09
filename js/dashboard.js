/**
 * =====================================================
 * DASHBOARD.JS
 * KPIs + filtros por estado
 * =====================================================
 */


/**
 * Actualiza dashboard
 */
function actualizarDashboard() {

    if (!Array.isArray(datos)) return;

    const total =
        datos.length;

    const almacen =
        datos.filter(
            x => x.Estado === "En Almacén"
        ).length;

    const fuera =
        datos.filter(
            x => x.Estado === "Fuera"
        ).length;

    const vacia =
        datos.filter(
            x => x.Estado === "Vacía"
        ).length;


    document.getElementById("total")
        .textContent = total;

    document.getElementById("almacen")
        .textContent = almacen;

    document.getElementById("fuera")
        .textContent = fuera;

    document.getElementById("vacia")
        .textContent = vacia;

}


/**
 * Filtro por estado (click en cards)
 */
function filtrarEstado(estado) {

    filtroEstado = estado;

    renderTabla();

}


/**
 * Limpia filtros globales
 */
function limpiarFiltros() {

    filtroEstado = "";

    textoBusqueda = "";

    document.getElementById("buscar")
        .value = "";

    renderTabla();

}


/**
 * Listener búsqueda en tiempo real
 */
document.addEventListener("DOMContentLoaded", () => {

    const input =
        document.getElementById("buscar");

    if (input) {

        input.addEventListener("input", (e) => {

            textoBusqueda =
                e.target.value.toLowerCase();

            renderTabla();

        });

    }

});
