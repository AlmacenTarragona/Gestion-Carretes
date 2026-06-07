const API_URL = "https://script.google.com/macros/s/AKfycbyBxAoXgTIrLgfTdupgkJQLt792npdkaPJ0fYCRb65yuSrP-m8aw5YTU7AbnlcR5yvNTw/exec";


let carretes = [];

// Cargar carretes al iniciar
window.onload = () => {
  cargarCarretes();

  document.getElementById("filtroEstado").onchange = filtrar;
  document.getElementById("filtroCodigo").onkeyup = filtrar;
  document.getElementById("filtroProveedor").onkeyup = filtrar;
};

function cargarCarretes() {
  fetch(API_URL + "?action=getCarretes")
    .then(r => r.json())
    .then(data => {
      carretes = data;
      mostrarTabla(data);
    });
}

function mostrarTabla(lista) {
  const tbody = document.getElementById("tablaCarretes");
  tbody.innerHTML = "";

  lista.forEach(c => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="p-2">${c.Carrete}</td>
      <td class="p-2">${c["Código de producto"]}</td>
      <td class="p-2">${c.Descripción}</td>
      <td class="p-2">${c.Metros}</td>
      <td class="p-2">${c["P.Interior"]}</td>
      <td class="p-2">${c["P.Exterior"]}</td>
      <td class="p-2">${c.Estado}</td>
      <td class="p-2">${c.Proveedor}</td>
      <td class="p-2">
        <button class="bg-blue-600 text-white px-2 py-1 rounded" onclick="editar('${c.Carrete}')">Editar</button>
        <button class="bg-green-600 text-white px-2 py-1 rounded" onclick="mostrarQR('${c.Carrete}')">QR</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function filtrar() {
  const estado = document.getElementById("filtroEstado").value;
  const codigo = document.getElementById("filtroCodigo").value.toLowerCase();
  const proveedor = document.getElementById("filtroProveedor").value.toLowerCase();

  const filtrados = carretes.filter(c =>
    (estado === "" || c.Estado === estado) &&
    (codigo === "" || (c["Código de producto"] + "").toLowerCase().includes(codigo)) &&
    (proveedor === "" || (c.Proveedor + "").toLowerCase().includes(proveedor))
  );

  mostrarTabla(filtrados);
}

// Modal edición
let carreteActual = null;

function editar(id) {
  carreteActual = carretes.find(c => c.Carrete === id);

  document.getElementById("editCarrete").value = carreteActual.Carrete;
  document.getElementById("editEstado").value = carreteActual.Estado;
  document.getElementById("editPExterior").value = carreteActual["P.Exterior"];

  document.getElementById("modal").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modal").classList.add("hidden");
}

function guardarCambios() {
  const nuevoEstado = document.getElementById("editEstado").value;
  const nuevaPunta = document.getElementById("editPExterior").value;

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "updateCarrete",
      Carrete: carreteActual.Carrete,
      Estado: nuevoEstado,
      "P.Exterior": nuevaPunta
    })
  })
  .then(r => r.json())
  .then(() => {
    cerrarModal();
    cargarCarretes();
  });
}

// QR
function mostrarQR(id) {
  document.getElementById("qrModal").classList.remove("hidden");

  const cont = document.getElementById("qrContainer");
  cont.innerHTML = "";

  new QRCode(cont, {
    text: id,
    width: 200,
    height: 200
  });
}

function cerrarQR() {
  document.getElementById("qrModal").classList.add("hidden");
}
