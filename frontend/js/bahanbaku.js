const token = localStorage.getItem("token");

// ==========================
// AUTH CHECK
// ==========================
if (!token) {
  window.location.href = "index.html";
}



// tampilkan role di navbar
const sessionUser = getSession();
const role = sessionUser?.role;
document.getElementById("userRole").textContent = role;

// logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

// ==========================
// ELEMENT
// ==========================
const form = document.getElementById("bahanForm");
const table = document.getElementById("bahanTable");
const count = document.getElementById("bahanCount");
const notifBox = document.getElementById("notifBox");
const notifList = document.getElementById("notifList");

const bahanId = document.getElementById("bahanId");
const nama = document.getElementById("bahanNama");
const stok = document.getElementById("bahanStok");
const min = document.getElementById("bahanMin");

const formTitle = document.getElementById("formTitle");

// ==========================
// LOAD DATA
// ==========================
async function loadBahan() {
  try {
    const res = await fetch("http://localhost:5000/api/bahanbaku", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "index.html";
      return;
    }

    const data = await res.json();

    renderTable(data);
    renderNotif(data);

  } catch (err) {
    console.error(err);
  }
}

// ==========================
// RENDER TABLE
// ==========================
function renderTable(data) {
  table.innerHTML = "";

  count.textContent = data.length + " bahan";

  data.forEach(item => {

    const isLow = item.stok <= item.minimal_stok;

    const tr = document.createElement("tr");
    if (isLow) tr.classList.add("cs-row-low");

    tr.innerHTML = `
      <td>${item.nama}</td>
      <td>${item.stok} gr</td>
      <td>${item.minimal_stok} gr</td>
      <td>
        <span class="cs-status-pill ${isLow ? "low" : "safe"}">
          <span class="cs-pulse"></span>
          ${isLow ? "Low Stock" : "Aman"}
        </span>
      </td>
      <td>
        <div class="cs-action-btn">
          <button class="cs-btn-edit" onclick="editBahan('${item.id}', '${item.nama}', ${item.stok}, ${item.minimal_stok})">
            Edit
          </button>
          <button class="cs-btn-delete" onclick="deleteBahan('${item.id}')">
            Hapus
          </button>
        </div>
      </td>
    `;

    table.appendChild(tr);
  });
}

// ==========================
// NOTIFIKASI STOK MINIMUM
// ==========================
function renderNotif(data) {
  notifList.innerHTML = "";

  const lowItems = data.filter(i => i.stok <= i.minimal_stok);

  if (lowItems.length === 0) {
    notifBox.style.display = "none";
    return;
  }

  notifBox.style.display = "block";

  lowItems.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.nama} (Stok: ${item.stok} gr, Min: ${item.minimal_stok} gr)`;
    notifList.appendChild(li);
  });
}

// ==========================
// SUBMIT FORM (CREATE / UPDATE)
// ==========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nama: nama.value,
    stok: parseInt(stok.value),
    minimal_stok: parseInt(min.value)
  };

  try {

    let url = "http://localhost:5000/api/bahanbaku";
    let method = "POST";

    if (bahanId.value) {
      url += "/" + bahanId.value;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    resetForm();
    loadBahan();

  } catch (err) {
    console.error(err);
  }
});

// ==========================
// EDIT
// ==========================
window.editBahan = function(id, n, s, m) {
  bahanId.value = id;
  nama.value = n;
  stok.value = s;
  min.value = m;

  formTitle.textContent = "Edit Bahan Baku";
}

// ==========================
// DELETE
// ==========================
window.deleteBahan = async function(id) {
  if (!confirm("Yakin hapus bahan ini?")) return;

  try {
    await fetch(`http://localhost:5000/api/bahanbaku/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    loadBahan();

  } catch (err) {
    console.error(err);
  }
}

// ==========================
// RESET
// ==========================
document.getElementById("btnReset").addEventListener("click", resetForm);

function resetForm() {
  bahanId.value = "";
  form.reset();
  formTitle.textContent = "Form Tambah Bahan Baku";
}

// ==========================
// INIT
// ==========================
loadBahan();