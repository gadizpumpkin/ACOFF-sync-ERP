console.log("=== MENU JS LOADED ===");

document.addEventListener("DOMContentLoaded", function () {

  // ==========================
  // AUTH
  // ==========================
  const sessionUser = getSession();
  const token = localStorage.getItem("token");

  if (!sessionUser && !token) {
    window.location.href = "index.html";
    return;
  }

  const role = sessionUser?.role?.trim().toUpperCase();

  if (role !== "MANAGER") {
    alert("Akses ditolak. Halaman ini hanya untuk Manajer.");
    window.location.href = "dashboard.html";
    return;
  }

  // ==========================
  // HEADER
  // ==========================
  document.getElementById("userRole").textContent = role;

  document.getElementById("logoutBtn").addEventListener("click", function () {
    clearSession();
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // ==========================
  // RENDER TABLE
  // ==========================
  async function renderTable() {
    try {
      const tbody = document.getElementById("menuTable");
      const count = document.getElementById("menuCount");

      const res = await fetch("http://localhost:5000/api/menu");
      const data = await res.json();

      tbody.innerHTML = "";
      count.textContent = `${data.length} menu`;

      data.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${item.nama_menu}</td>
          <td>Rp ${parseInt(item.harga_jual).toLocaleString("id-ID")}</td>
          <td>
            <button onclick="editMenu(${item.id})">Edit</button>
            <button onclick="deleteMenu(${item.id})">Hapus</button>
          </td>
        `;

        tbody.appendChild(tr);
      });

    } catch (err) {
      console.error("Render error:", err);
      alert("Gagal load data menu");
    }
  }

  // ==========================
  // CREATE / UPDATE
  // ==========================
  document.getElementById("menuForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("menuId").value;
    const nama = document.getElementById("menuNama").value.trim();
    const harga = parseInt(document.getElementById("menuHarga").value);

    if (!nama || !harga) {
      alert("Nama dan harga wajib diisi!");
      return;
    }

    try {
      if (id) {
        // UPDATE
        await fetch(`http://localhost:5000/api/menu/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama, harga })
        });
      } else {
        // CREATE
        await fetch("http://localhost:5000/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama, harga })
        });
      }

      resetForm();
      renderTable();

    } catch (err) {
      console.error("Submit error:", err);
      alert("Gagal menyimpan data");
    }
  });

  // ==========================
  // DELETE (GLOBAL)
  // ==========================
  window.deleteMenu = async function (id) {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;

    try {
      await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: "DELETE"
      });

      renderTable();

    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus data");
    }
  };

  // ==========================
  // EDIT (GLOBAL)
  // ==========================
  window.editMenu = async function (id) {
    try {
      const res = await fetch("http://localhost:5000/api/menu");
      const data = await res.json();

      const item = data.find(x => x.id === id);

      if (!item) return;

      document.getElementById("menuId").value = item.id;
      document.getElementById("menuNama").value = item.nama_menu;
      document.getElementById("menuHarga").value = item.harga_jual;

      document.getElementById("formTitle").textContent = "Edit Menu";
      document.getElementById("btnSubmit").textContent = "Update";

    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  // ==========================
  // RESET
  // ==========================
  function resetForm() {
    document.getElementById("menuId").value = "";
    document.getElementById("menuNama").value = "";
    document.getElementById("menuHarga").value = "";

    document.getElementById("formTitle").textContent = "Form Tambah Menu";
    document.getElementById("btnSubmit").textContent = "Simpan";
  }

  document.getElementById("btnReset").addEventListener("click", resetForm);

  // ==========================
  // INIT
  // ==========================
  renderTable();

});