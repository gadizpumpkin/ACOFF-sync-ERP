// ==========================
// SESSION HANDLER
// ==========================
function setSession(user) {
  localStorage.setItem("userSession", JSON.stringify(user));
}

function getSession() {
  const data = localStorage.getItem("userSession");
  return data ? JSON.parse(data) : null;
}

function clearSession() {
  localStorage.removeItem("userSession");
}

function getToken() {
  const session = getSession();
  return session ? session.token : null;
}

// ==========================
// AUTO AUTH CHECK (FIX LOOP)
// ==========================
(function () {
  const path = window.location.pathname;
  const token = getToken();

  // kalau di halaman login
  if (path.includes("index.html")) {
    if (token) {
      window.location.href = "dashboard.html";
    }
  } 
  // halaman selain login
  else {
    if (!token) {
      clearSession();
      window.location.href = "index.html";
    }
  }
})();