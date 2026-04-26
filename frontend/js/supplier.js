console.log("SESSION:", sessionUser);
console.log("TOKEN:", token);
document.addEventListener("DOMContentLoaded", function () {
console.log("ROLE RAW:", sessionUser?.role);

  // ==========================
  // AUTH
  // ==========================
  const sessionUser = getSession();
  const token = localStorage.getItem("token");

  if (!sessionUser || !token) {
    window.location.href = "index.html";
    return;
  }

const role = sessionUser?.role?.toString().trim().toUpperCase();

if (!role) {
  alert("Session tidak valid, login ulang!");
  window.location.href = "index.html";
  return;
}
if (!sessionUser || !token) {
  console.log("SESSION / TOKEN HILANG");
  window.location.href = "index.html";
  return;
}

  document.getElementById("userRole").textContent = role;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearSession();
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // ==========================
  // LOAD DATA
  // ==========================
  async function renderSupplierTable() {
    try {
      const res = await fetch("http://localhost:5000/api/supplier", {
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      if (!res.ok) throw new Error("Gagal fetch data");

      const data = await res.json();

      const tbody = document.getElementById("supplierTable");
      const count = document.getElementById("supplierCount");

      tbody.innerHTML = "";
      count.textContent = data.length + " supplier";

      if (data.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4">Belum ada supplier</td>
          </tr>
        `;
        return;
      }

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

    } catch (err) {
      console.error(err);
      alert("Gagal load data supplier");
    }
  }

  // ==========================
  // CREATE / UPDATE
  // ==========================
  document.getElementById("supplierForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("supplierId").value;
    const nama = document.getElementById("supplierNama").value.trim();
    const hp = document.getElementById("supplierHp").value.trim();
    const alamat = document.getElementById("supplierAlamat").value.trim();

    if (!nama || !hp || !alamat) {
      alert("Semua field wajib diisi!");
      return;
    }

    try {
      const url = id
        ? `http://localhost:5000/api/supplier/${id}`
        : "http://localhost:5000/api/supplier";

      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ nama, hp, alamat })
      });

      if (!res.ok) throw new Error("Gagal simpan data");

      resetForm();
      renderSupplierTable();

    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
    }
  });

  // ==========================
  // EDIT
  // ==========================
  window.editSupplier = function (id) {
    fetch(`http://localhost:5000/api/supplier`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => {
        const s = data.find(x => x.id == id);
        if (!s) return alert("Data tidak ditemukan");

        document.getElementById("supplierId").value = s.id;
        document.getElementById("supplierNama").value = s.nama;
        document.getElementById("supplierHp").value = s.hp;
        document.getElementById("supplierAlamat").value = s.alamat;

        document.getElementById("btnSubmit").textContent = "Update Supplier";
        document.getElementById("formTitle").textContent = "Edit Supplier";
      });
  };

  // ==========================
  // DELETE
  // ==========================
  window.deleteSupplier = async function (id) {
    if (!confirm("Yakin hapus supplier ini?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/supplier/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      if (!res.ok) throw new Error("Gagal hapus");

      renderSupplierTable();

    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data");
    }
  };

  // ==========================
  // RESET FORM
  // ==========================
  function resetForm() {
    document.getElementById("supplierId").value = "";
    document.getElementById("supplierNama").value = "";
    document.getElementById("supplierHp").value = "";
    document.getElementById("supplierAlamat").value = "";

    document.getElementById("btnSubmit").textContent = "Simpan Supplier";
    document.getElementById("formTitle").textContent = "Form Tambah Supplier";
  }

  document.getElementById("btnReset").addEventListener("click", resetForm);

  // ==========================
  // INIT
  // ==========================
  renderSupplierTable();

});