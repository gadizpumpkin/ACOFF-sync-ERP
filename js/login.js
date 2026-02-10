document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  const user = authenticate(username, password);

  if (!user) {
    errorMsg.textContent = "Login gagal. Username atau password salah.";
    return;
  }

  setSession(user);
  window.location.href = "dashboard.html";
});
