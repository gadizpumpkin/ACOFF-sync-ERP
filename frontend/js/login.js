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
      // SIMPAN SESSION + TOKEN (FIX)
      // ==========================
      const userSession = {
        username: data.username,
        role: data.role,
        token: data.token // 🔥 FIX UTAMA
      };

      setSession(userSession);

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
  document.getElementById("errorMsg").textContent = msg;
}

// ==========================
// AUTO REDIRECT
// ==========================
const sessionUser = getSession();
if (sessionUser && sessionUser.token) {
  window.location.href = "dashboard.html";
}