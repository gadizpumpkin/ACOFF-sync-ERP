// ==========================
// REGISTER FORM
// ==========================
document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nama_lengkap = document.getElementById("nama_lengkap").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;
  const msg = document.getElementById("msg");

  msg.textContent = "";

  // ==========================
  // VALIDASI SEDERHANA
  // ==========================
  if (!nama_lengkap || !username || !password || !role) {
    msg.textContent = "Semua field wajib diisi!";
    return;
  }

  if (password.length < 3) {
    msg.textContent = "Password minimal 3 karakter!";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nama_lengkap,
        username,
        password,
        role
      })
    });

  let data;

try {
  data = await res.json();
} catch {
  throw new Error("Response bukan JSON (kemungkinan 404)");
}

    if (res.ok) {
      msg.style.color = "green";
      msg.textContent = "Registrasi berhasil! Redirect ke login...";

      // delay biar user lihat pesan
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);

    } else {
      msg.style.color = "red";
      msg.textContent = data.message || "Registrasi gagal";
    }

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    msg.style.color = "red";
    msg.textContent = "Server error";
  }
});