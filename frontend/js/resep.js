const token = localStorage.getItem("token");

// ==========================
// AUTH
// ==========================
if (!token) window.location.href = "index.html";

const sessionUser = getSession();
document.getElementById("userRole").textContent = sessionUser.role;

// ==========================
// LOGOUT
// ==========================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

// ==========================
// DROPDOWN
// ==========================
async function loadDropdowns() {
  const menuSelect = document.getElementById("selectMenu");
  const bahanSelect = document.getElementById("selectBahan");

  menuSelect.innerHTML = `<option disabled selected>-- Pilih menu --</option>`;
  bahanSelect.innerHTML = `<option disabled selected>-- Pilih bahan --</option>`;

  try {
    const [menuRes, bahanRes] = await Promise.all([
      fetch("http://localhost:5000/api/menu"),
      fetch("http://localhost:5000/api/bahanbaku", {
        headers: { Authorization: "Bearer " + token }
      })
    ]);

    const menus = await menuRes.json();
    const bahan = await bahanRes.json();

    menus.forEach(m => {
      menuSelect.innerHTML += `<option value="${m.id}">${m.nama_menu}</option>`;
    });

    bahan.forEach(b => {
      bahanSelect.innerHTML += `<option value="${b.id}">${b.nama}</option>`;
    });

  } catch (err) {
    console.error("Dropdown error:", err);
  }
}

// ==========================
// TABLE
// ==========================
async function renderTable() {
  const tbody = document.getElementById("resepTable");
  const count = document.getElementById("resepCount");

  try {
    const res = await fetch("http://localhost:5000/api/resep", {
      headers: { Authorization: "Bearer " + token }
    });

    const text = await res.text();

    //DEBUG
    console.log("RESPONSE RESEP:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Response bukan JSON");
    }

    tbody.innerHTML = "";
    count.textContent = `${data.length} resep`;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">Belum ada resep</td></tr>`;
      return;
    }

    data.forEach(item => {
      tbody.innerHTML += `
        <tr>
          <td>${item.nama_menu}</td>
          <td>${item.nama_bahan}</td>
          <td>${item.qty} gram</td>
          <td>
            <button onclick="deleteResep(${item.id})">Hapus</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Render error:", err);
  }
}

// ==========================
// ADD
// ==========================
document.getElementById("resepForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const menu_id = document.getElementById("selectMenu").value;
  const bahan_id = document.getElementById("selectBahan").value;
  const qty = parseFloat(document.getElementById("jumlahGram").value);

  try {
    const res = await fetch("http://localhost:5000/api/resep", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ menu_id, bahan_id, qty })
    });

    const result = await res.json();

    if (result.error) {
      alert(result.error);
      return;
    }

    document.getElementById("jumlahGram").value = "";
    renderTable();

  } catch (err) {
    console.error("Submit error:", err);
  }
});

// ==========================
// DELETE
// ==========================
window.deleteResep = async function (id) {
  if (!confirm("Hapus resep?")) return;

  await fetch(`http://localhost:5000/api/resep/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });

  renderTable();
};

// ==========================
// INIT
// ==========================
loadDropdowns();
renderTable();