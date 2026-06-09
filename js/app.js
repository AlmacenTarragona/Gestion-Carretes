/**
 * =====================================================
 * APP.JS
 * Arranque del sistema
 * =====================================================
 */


/**
 * Inicialización principal
 */
async function initApp() {

    try {

        await recargarSistema();

        console.log("✔ Sistema de Carretes iniciado correctamente");

    }
    catch (error) {

        console.error("Error al iniciar la app:", error);

        alert("Error al cargar la aplicación");

    }

}


/**
 * Auto-refresh opcional (cada 60s)
 * Puedes desactivarlo si no lo quieres
 */
setInterval(async () => {

    try {

        await recargarSistema();

    } catch (e) {

        console.warn("Auto-refresh falló:", e);

    }

}, 60000);


/**
 * Cerrar modal al hacer click fuera
 */
document.addEventListener("DOMContentLoaded", () => {

    const overlay =
        document.getElementById("modalOverlay");

    if (overlay) {

        overlay.addEventListener("click", (e) => {

            if (e.target === overlay) {

                cerrarModal();

            }

        });

    }

});


/**
 * Arranque automático
 */
document.addEventListener("DOMContentLoaded", initApp);
