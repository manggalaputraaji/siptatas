const scriptURL = 'https://script.google.com/macros/s/AKfycby9WYcW3GCwSRTEYav-hhP361Au2j5HuZ6Ghi04TIbHrGOh65J20juuF_R3dsfWvhFA/exec';
const form = document.getElementById('formPelanggaran');
const btn = document.getElementById('btnSimpan');

form.addEventListener('submit', e => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerHTML = "Sedang Menyimpan...";

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Menambahkan timestamp otomatis jika dibutuhkan oleh script GAS kamu
    data.timestamp = new Date().toLocaleString();

    fetch(scriptURL, { 
        method: 'POST', 
        body: new URLSearchParams(formData) // Menggunakan URLSearchParams agar sesuai dengan doPost standar GAS
    })
    .then(response => {
        alert('Berhasil! Data telah tersimpan di Database Pelanggar.');
        btn.disabled = false;
        btn.innerHTML = "Simpan ke Sheets";
        form.reset();
    })
    .catch(error => {
        alert('Gagal mengirim data! Cek koneksi internet.');
        btn.disabled = false;
        btn.innerHTML = "Simpan ke Sheets";
    });
});