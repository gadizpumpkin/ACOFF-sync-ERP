const BASE_URL = "http://localhost:5000/api/absensi";

// ==========================
// FETCH DATA (SAFE)
// ==========================
async function fetchAbsensi() {
  try {
    const res = await fetch(`${BASE_URL}/${sessionUser.username}`);

    if (!res.ok) {
      const text = await res.text();
      console.error("API ERROR:", text);
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error("FETCH ERROR:", err);
    return [];
  }
}

// ==========================
// ABSEN MASUK
// ==========================
async function absenMasuk() {
  try {
    const res = await fetch(BASE_URL + "/masuk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: sessionUser.username,
        tanggal: getTodayDate(),
        jamMasuk: getCurrentTime(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Absen masuk berhasil");
    renderAll();
  } catch (err) {
    console.error(err);
    alert("Gagal koneksi ke server");
  }
}

// ==========================
// ABSEN KELUAR
// ==========================
async function absenKeluar() {
  try {
    const res = await fetch(BASE_URL + "/keluar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: sessionUser.username,
        tanggal: getTodayDate(),
        jamKeluar: getCurrentTime(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Absen keluar berhasil");
    renderAll();
  } catch (err) {
    console.error(err);
    alert("Gagal koneksi ke server");
  }
}