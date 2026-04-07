// ==========================
// LOGIN FORM
// ==========================
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  errorMsg.textContent = "";

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {

      // ==========================
      // SIMPAN TOKEN (API)
      // ==========================
      localStorage.setItem("token", data.token);

      // ==========================
      // SIMPAN SESSION (FRONTEND)
      // ==========================
      const userSession = {
        username: data.username,
        role: data.role
      };

      setSession(userSession);

      // redirect
      window.location.href = "dashboard.html";

    } else {
      showError(data.message || "Login gagal.");
    }

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    showError("Server error. Coba lagi.");
  }
});

// ==========================
// ERROR UI
// ==========================
function showError(msg) {
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.textContent = msg;
}

// ==========================
// AUTO REDIRECT (JIKA SUDAH LOGIN)
// ==========================
const sessionUser = getSession();
if (sessionUser) {
  window.location.href = "dashboard.html";
}