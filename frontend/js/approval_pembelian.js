// ==========================
// AUTH
// ==========================
const sessionUser = getSession();
const token = localStorage.getItem("token");

if (!sessionUser || !token) window.location.href = "index.html";

if (sessionUser.role !== "OWNER") {
  alert("Akses hanya untuk OWNER");
  window.location.href = "dashboard.html";
}

// ==========================
// LOAD DATA
// ==========================
async function loadPembelian() {
  try {
    const res = await fetch("http://localhost:5000/api/pembelian", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("ERROR API:", data);
      throw new Error(data.message || "Gagal fetch");
    }

    return data;

  } catch (err) {
    console.error(err);
    alert("Tidak bisa load pembelian");
    return [];
  }
}

// ==========================
// RENDER TABLE
// ==========================
async function renderTable() {
  const tbody = document.getElementById("approvalTable");
  tbody.innerHTML = "";

  const data = await loadPembelian();

  data.forEach(po => {

    let actions = "-";

    if (po.status === "DRAFT") {
      actions = `
        <button onclick="approve(${po.id})">Approve</button>
        <button onclick="reject(${po.id})">Reject</button>
      `;
    } else if (po.status === "APPROVED") {
      actions = `
        <button onclick="receive(${po.id})">Received</button>
      `;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${po.id}</td>
      <td>${po.nama_supplier || "-"}</td>
      <td>${new Date(po.tanggal).toLocaleString("id-ID")}</td>
      <td>${po.status}</td>
      <td>Rp ${Number(po.total).toLocaleString("id-ID")}</td>
      <td>${actions}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// UPDATE STATUS
// ==========================
async function updateStatus(id, status) {
  const res = await fetch(`http://localhost:5000/api/pembelian/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ status })
  });

  const data = await res.json();
  alert(data.message);
  renderTable();
}

// ==========================
// BUTTON ACTION
// ==========================
function approve(id) {
  updateStatus(id, "APPROVED");
}

function reject(id) {
  updateStatus(id, "REJECTED");
}

function receive(id) {
  updateStatus(id, "RECEIVED");
}

// INIT
renderTable();