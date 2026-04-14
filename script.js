// URL Apps Script kamu
const scriptURL = 'https://script.google.com/macros/s/AKfycbyzAzzp27sudKWsncEd9n_kUBcK7ZPuic7UXLxzsHppORE0y7JeAuAuJSXItVvZctX2/exec';

// 1. Handling Form Input (Jika ada di halaman tersebut)
const form = document.getElementById('formPelanggaran');
const btn = document.getElementById('btnSimpan');

if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        btn.disabled = true;
        btn.innerHTML = "Mengirim...";

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.type = "INPUT_PELANGGARAN";

        fetch(scriptURL, { 
            method: 'POST', 
            mode: 'no-cors', 
            body: JSON.stringify(data) 
        })
        .then(() => {
            alert('Data Berhasil Disimpan!');
            form.reset();
            window.location.href = 'dashboard-admin.html';
        })
        .catch(() => alert('Gagal! Cek koneksi.'))
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = "Simpan ke Sheets";
        });
    });
}

// 2. Load Profile Data
document.addEventListener('DOMContentLoaded', () => {
    const adminName = document.getElementById('adminName');
    const fotoSiswa = document.getElementById('fotoSiswa');
    const nameStored = localStorage.getItem('namaLengkap');
    const fotoStored = localStorage.getItem('fotoProfil');

    if (adminName && nameStored) adminName.innerText = nameStored;
    if (fotoSiswa && fotoStored) fotoSiswa.src = fotoStored;
});

// 3. Logout
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}