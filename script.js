// URL Web App dari Apps Script kamu
const scriptURL = 'https://script.google.com/macros/s/AKfycbyzAzzp27sudKWsncEd9n_kUBcK7ZPuic7UXLxzsHppORE0y7JeAuAuJSXItVvZctX2/exec';

// 1. Handling Pengiriman Form Pelanggaran
const form = document.getElementById('formPelanggaran');
const btn = document.getElementById('btnSimpan');

if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        btn.disabled = true;
        btn.innerHTML = "Sedang Menyimpan...";

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.type = "INPUT_PELANGGARAN";

        fetch(scriptURL, { 
            method: 'POST', 
            mode: 'no-cors', // Penting untuk Google Apps Script
            body: JSON.stringify(data) 
        })
        .then(() => {
            alert('Data Pelanggaran Berhasil Dicatat!');
            form.reset();
            window.location.href = 'dashboard-admin.html';
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert('Gagal mengirim data. Cek koneksi.');
            btn.disabled = false;
            btn.innerHTML = "Simpan ke Sheets";
        });
    });
}

// 2. Load Data Profil di Dashboard
document.addEventListener('DOMContentLoaded', () => {
    const adminName = document.getElementById('adminName');
    const fotoSiswa = document.getElementById('fotoSiswa');
    
    const nameStored = localStorage.getItem('namaLengkap');
    const fotoStored = localStorage.getItem('fotoProfil');

    if (adminName && nameStored) adminName.innerText = nameStored;
    if (fotoSiswa && fotoStored) fotoSiswa.src = fotoStored;
});

// 3. Fungsi Logout
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}