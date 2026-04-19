document.addEventListener("DOMContentLoaded", async function () {

  const sessionUser = getSession();
  const token = localStorage.getItem("token");

  if (!sessionUser || !token) {
    window.location.href = "index.html";
    return;
  }

  const role = sessionUser.role.toUpperCase();

  document.getElementById("userRole").textContent = role;

  // ==========================
  // LOAD DATA
  // ==========================
  async function renderSupplierTable() {
    const res = await fetch("http://localhost:5000/api/supplier", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    const tbody = document.getElementById("supplierTable");
    const count = document.getElementById("supplierCount");

    tbody.innerHTML = "";
    count.textContent = data.length + " supplier";

    data.forEach(s => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${s.nama}</td>
        <td>${s.hp}</td>
        <td>${s.alamat}</td>
        <td>
          <button onclick="editSupplier(${s.id})">Edit</button>
          <button onclick="deleteSupplier(${s.id})">Hapus</button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  // ==========================
  // CREATE / UPDATE
  // ==========================
  document.getElementById("supplierForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("supplierId").value;
    const nama = document.getElementById("supplierNama").value;
    const hp = document.getElementById("supplierHp").value;
    const alamat = document.getElementById("supplierAlamat").value;

    const url = id
      ? `http://localhost:5000/api/supplier/${id}`
      : "http://localhost:5000/api/supplier";

    const method = id ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ nama, hp, alamat })
    });

    renderSupplierTable();
  });

  // ==========================
  // DELETE
  // ==========================
  window.deleteSupplier = async function (id) {
    if (!confirm("Yakin hapus?")) return;

    await fetch(`http://localhost:5000/api/supplier/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    renderSupplierTable();
  };

  renderSupplierTable();
});