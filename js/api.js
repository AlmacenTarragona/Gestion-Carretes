/**
 * =====================================================
 * API.JS
 * Comunicación con Google Apps Script
 * =====================================================
 */


/**
 * Loader
 */

function mostrarLoader() {

    document
        .getElementById("loader")
        .classList
        .remove("oculto");

}

function ocultarLoader() {

    document
        .getElementById("loader")
        .classList
        .add("oculto");

}


/**
 * GET genérico
 */

async function apiGet(action, params = {}) {

    try {

        mostrarLoader();

        const url =
            new URL(CONFIG.API);

        url.searchParams.append(
            "action",
            action
        );

        Object.keys(params)
            .forEach(key => {

                url.searchParams.append(
                    key,
                    params[key]
                );

            });

        const response =
            await fetch(
                url.toString()
            );

        return await response.json();

    }
    catch (error) {

        console.error(error);

        alert(
            "Error de conexión"
        );

        return null;

    }
    finally {

        ocultarLoader();

    }

}


/**
 * POST genérico
 */

async function apiPost(data) {

    try {

        mostrarLoader();

        const response =
            await fetch(
                CONFIG.API,
                {
                    method: "POST",
                    body: JSON.stringify(data)
                }
            );

        return await response.json();

    }
    catch (error) {

        console.error(error);

        alert(
            "Error de conexión"
        );

        return null;

    }
    finally {

        ocultarLoader();

    }

}


/**
 * INVENTARIO
 */

async function cargarInventario() {

    return await apiGet(
        "read"
    );

}

async function cargarResumen() {

    return await apiGet(
        "resumen"
    );

}

async function crearCarrete(data) {

    return await apiPost({

        action: "create",

        data: data

    });

}

async function editarCarrete(id, data) {

    return await apiPost({

        action: "update",

        id: id,

        data: data

    });

}

async function eliminarCarrete(id) {

    return await apiPost({

        action: "delete",

        id: id

    });

}


/**
 * MOVIMIENTOS
 */

async function registrarSalida(data) {

    return await apiPost({

        action: "salida",

        ...data

    });

}

async function registrarEntrada(data) {

    return await apiPost({

        action: "entrada",

        ...data

    });

}

async function obtenerHistorial(id) {

    return await apiGet(

        "historial",

        {
            id: id
        }

    );

}


/**
 * Recarga completa
 */

async function recargarSistema() {

    datos =
        await cargarInventario();

    if (!Array.isArray(datos)) {

        datos = [];

    }

    actualizarDashboard();

    renderTabla();

}
