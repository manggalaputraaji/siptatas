const scriptURL = 'https://script.google.com/macros/s/AKfycbzKk8vgJmAI7CbpRjvt-FvH-NBTJrCt0KqyDXg8nSz2z0kJCgJh5tZm7peEGdi24gmj/exec';
const form = document.getElementById('formPelanggaran');
const btn = document.getElementById('btnSimpan');

form.addEventListener('submit', e => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerHTML = "Sabar, lagi ngirim...";

    // Mengambil data form dan mengubahnya jadi Object JSON
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Tambahkan label agar Apps Script tahu ini input pelanggaran
    data.type = "INPUT_PELANGGARAN";

    fetch(scriptURL, { 
        method: 'POST', 
        body: JSON.stringify(data) // Kirim sebagai JSON
    })
    .then(response => {
        alert('Data berhasil masuk ke Google Sheets!');
        btn.disabled = false;
        btn.innerHTML = "Simpan ke Sheets";
        form.reset();
    })
    .catch(error => {
        alert('Gagal! Cek koneksi.');
        btn.disabled = false;
        btn.innerHTML = "Simpan ke Sheets";
    });
});