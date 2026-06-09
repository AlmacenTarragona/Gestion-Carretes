/**
 * =====================================================
 * CONFIG.JS
 * Configuración global
 * =====================================================
 */

const CONFIG = {

    API:
    "https://script.google.com/macros/s/AKfycbz3nDtwEfV7q2UnBsad7CRDHMIrC81FlabTSC64FZRu4BSg1STuBxnj4V54ztm44Xxg/exec"

};


/**
 * Estados permitidos
 */
const ESTADOS = [

    "En Almacén",

    "Fuera",

    "Vacía"

];


/**
 * Variables globales
 */

let datos = [];

let filtroEstado = "";

let textoBusqueda = "";

let carreteSeleccionado = null;
