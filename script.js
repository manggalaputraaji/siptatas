const scriptURL = 'https://script.google.com/macros/s/AKfycbyzAzzp27sudKWsncEd9n_kUBcK7ZPuic7UXLxzsHppORE0y7JeAuAuJSXItVvZctX2/exec';
const form = document.getElementById('formPelanggaran');
const btn = document.getElementById('btnSimpan');
form.addEventListener('submit', e => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerHTML = "Sabar, lagi ngirim...";
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.type = "INPUT_PELANGGARAN";
    fetch(scriptURL, { 
        method: 'POST', 
        body: JSON.stringify(data)
    })
    .then(response => {
        alert('Data berhasil masuk ke Google Sheets!');
        btn.disabled = false;
        btn.innerHTML = "Simpan ke Sheets";
        form.reset();
        window.location.href = 'dashboard.html';
    })
    .catch(error => {
        alert('Gagal! Cek koneksi.');
        btn.disabled = false;
        btn.innerHTML = "Simpan ke Sheets";
    });
});