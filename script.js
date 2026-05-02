// script.js — idempotent form submit (safe to include once)
(function(){
  if (window.__lexacore_scriptjs_installed) return;
  window.__lexacore_scriptjs_installed = true;

  const scriptURL = 'https://script.google.com/macros/s/AKfycby9WYcW3GCwSRTEYav-hhP361Au2j5HuZ6Ghi04TIbHrGOh65J20juuF_R3dsfWvhFA/exec';
  const form = document.getElementById('formPelanggaran') || document.getElementById('violationForm');
  const btn = document.getElementById('btnSimpan') || document.querySelector('button[type="submit"]');

  if (!form) return;

  // Remove previous handler if present
  if (form.__submit_handler) form.removeEventListener('submit', form.__submit_handler);

  const handler = function(e){
    e.preventDefault();
    if (btn) { btn.disabled = true; btn.innerHTML = "Sedang Menyimpan..."; }

    const formData = new FormData(form);
    // Add timestamp if needed
    formData.append('timestamp', new Date().toLocaleString());

    fetch(scriptURL, {
      method: 'POST',
      body: new URLSearchParams(formData)
    })
    .then(() => {
      alert('Berhasil! Data telah tersimpan di Database Pelanggar.');
      if (btn) { btn.disabled = false; btn.innerHTML = btn.getAttribute('data-original') || "Simpan ke Sheets"; }
      form.reset();
    })
    .catch(() => {
      alert('Gagal mengirim data! Cek koneksi internet.');
      if (btn) { btn.disabled = false; btn.innerHTML = btn.getAttribute('data-original') || "Simpan ke Sheets"; }
    });
  };

  form.__submit_handler = handler;
  form.addEventListener('submit', handler);
})();
