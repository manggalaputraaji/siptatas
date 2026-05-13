

const DB_ID = '19aDh5DCRpV0FJzxa7Yw6teAhnRwHOCP-zS3g8-YA_sg';
const DB_URL = `https://docs.google.com/spreadsheets/d/${DB_ID}/gviz/tq?tqx=out:json&headers=1`;
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyv5VTOhdz3CptEYZgheLY9Ha7S7cfsAhiKQGn7HFYpGRc40oUWNMemSuLjcC7IA8yr/exec';
const SCRIPT_URL_PROFILE = 'https://script.google.com/macros/s/AKfycbx1oGeWBTXQAi-SF8NVlXfxwAU9WWj2l-ELfVWMldm3jAJI8YFM8UrGhX4lTkmiN_Ti/exec';
const SHEET_ID_ADMIN = '1qwOcgSU-UOx4s2iKluk3rMqDTwjewzB8XWYUXlx6g_A';
const GVIZ_URL_ADMIN = `https://docs.google.com/spreadsheets/d/${SHEET_ID_ADMIN}/gviz/tq?tqx=out:json&headers=1`;


function parseDate(dStr) {
  if (!dStr) return null;
  if (dStr instanceof Date) return dStr;
  const s = String(dStr).replace(/,/g, '');
  const serialNum = parseFloat(s);
  if (!isNaN(serialNum) && serialNum > 1000 && serialNum < 100000 && /^\d+(\.\d+)?$/.test(s)) {
    const excelEpoch = new Date(1899, 11, 30);
    const days = Math.floor(serialNum);
    const fracDay = serialNum - days;
    const ms = excelEpoch.getTime() + days * 86400000 + Math.round(fracDay * 86400000);
    return new Date(ms);
  }
  let d = Date.parse(s);
  if (!isNaN(d)) return new Date(d);
  const p = s.split(/[\/\s:]+/);
  if (p.length >= 3) {
    let day = parseInt(p[0]), month = parseInt(p[1]), year = parseInt(p[2]);
    if (year < 1000) year += 2000;
    if (month > 12) [day, month] = [month, day];
    return new Date(year, month - 1, day);
  }
  return new Date(dStr);
}

function formatDate(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) return '-';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const mm = String(dateObj.getMinutes()).padStart(2, '0');
  const ss = String(dateObj.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function showAlert(title, description, type) {
  type = type || 'default';
  let container = document.querySelector('.alert-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'alert-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'alert ' + type;
  const icon = type === 'destructive'
    ? '<svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>'
    : '<svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  el.innerHTML = icon + '<div class="alert-title">' + title + '</div><div class="alert-description">' + description + '</div>';
  container.appendChild(el);
  setTimeout(function () {
    el.classList.add('alert-fade-out');
    setTimeout(function () { el.remove(); }, 200);
  }, 3000);
}

function animateCountUp(el, target, duration) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.innerText = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function getPoinClasses(p) {
  if (p === 'Ringan') return 'border-transparent bg-green-50 text-green-700';
  if (p === 'Sedang') return 'border-transparent bg-amber-50 text-amber-700';
  if (p === 'Berat') return 'border-transparent bg-red-50 text-red-700';
  return 'border-transparent bg-blue-50 text-blue-700';
}


function applyTheme() {
  const mode = localStorage.getItem('themeMode') || 'light';
  const accent = localStorage.getItem('themeAccent') || 'zinc';
  document.documentElement.setAttribute('data-mode', mode);
  if (accent !== 'zinc') document.documentElement.setAttribute('data-accent', accent);
  else document.documentElement.removeAttribute('data-accent');
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (icon && label) {
    if (mode === 'dark') {
      icon.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
      label.textContent = 'Mode Gelap';
    } else {
      icon.innerHTML = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
      label.textContent = 'Mode Terang';
    }
  }
  document.querySelectorAll('.theme-swatch').forEach(function (s) {
    s.classList.toggle('active', s.dataset.color === accent);
  });
  if (typeof _dashboardChartInstance !== 'undefined' && _dashboardChartInstance && typeof _dashboardDailyData !== 'undefined') {
    setTimeout(function () { renderDashboardChart(_dashboardDailyData); }, 10);
  }
}

function toggleDarkMode() {
  var c = localStorage.getItem('themeMode') || 'light';
  localStorage.setItem('themeMode', c === 'dark' ? 'light' : 'dark');
  applyTheme();
}
function setAccent(color) {
  localStorage.setItem('themeAccent', color);
  applyTheme();
}


function initMenuToggle() {
  var sidebar = document.querySelector('.sidebar-container');
  var toggle = document.getElementById('mobileNavToggle');
  var overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !toggle) return;
  function closeMenu() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  });
  overlay.addEventListener('click', closeMenu);
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

function loadUserProfile() {
  var nameEl = document.getElementById('adminName');
  if (nameEl) nameEl.innerText = localStorage.getItem('namaLengkap') || 'Admin';
  var foto = localStorage.getItem('fotoProfil');
  var fotoEl = document.getElementById('fotoSiswa');
  var mobileFotoEl = document.getElementById('mobileFotoSiswa');
  if (foto && fotoEl) fotoEl.src = foto;
  if (foto && mobileFotoEl) mobileFotoEl.src = foto;
}


applyTheme();


document.addEventListener('DOMContentLoaded', function () {
  initMenuToggle();
  loadUserProfile();
});



(function initLoginPage() {
  var loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var userVal = document.getElementById('user').value.trim();
    var passVal = document.getElementById('pass').value.trim();
    var btn = document.getElementById('btnLogin');
    btn.disabled = true;
    btn.innerText = 'Memverifikasi...';
    try {
      var res = await fetch(GVIZ_URL_ADMIN);
      var text = await res.text();
      var json = JSON.parse(text.substr(47).slice(0, -2));
      var rows = json.table.rows;
      var foundAcc = rows.find(function (r) {
        var dbUser = r.c[1] ? (r.c[1].f || String(r.c[1].v)).trim() : '';
        var dbPass = r.c[2] ? (r.c[2].f || String(r.c[2].v)).trim() : '';
        return dbUser === userVal && dbPass === passVal;
      });
      if (foundAcc) {
        localStorage.setItem('siswaLogin', userVal);
        localStorage.setItem('namaLengkap', foundAcc.c[0] ? foundAcc.c[0].v : userVal);
        localStorage.setItem('fotoProfil', (foundAcc.c[3] && foundAcc.c[3].v) ? foundAcc.c[3].v : '');
        window.location.href = 'dashboard.html';
      } else {
        showAlert('Akses Ditolak', 'Nama Pengguna atau Kata Sandi Salah!', 'destructive');
        btn.disabled = false;
        btn.innerText = 'MASUK';
      }
    } catch (err) {
      showAlert('Koneksi Gagal', 'Gagal terhubung ke Database. Periksa koneksimu.', 'destructive');
      btn.disabled = false;
      btn.innerText = 'MASUK';
    }
  });
})();



(function initFormPage() {
  var form = document.getElementById('violationForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = e.target.querySelector('button[type="submit"]');
    var originalText = btn.innerText;
    btn.innerText = 'Mengirim...';
    btn.disabled = true;
    var formData = new FormData(e.target);
    var data = {
      type: 'INPUT_PELANGGARAN',
      nama: formData.get('nama'),
      kelas: formData.get('kelas'),
      pelanggaran: formData.get('hal'),
      poin: formData.get('poin')
    };
    try {
      await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) });
      showAlert('Berhasil!', 'Data pelanggaran telah disimpan.', 'success');
      e.target.reset();
    } catch (err) {
      showAlert('Gagal!', 'Gagal terhubung ke Database. Periksa koneksimu.', 'destructive');
    } finally {
      btn.innerText = originalText;
      btn.disabled = false;
    }
  });
})();



(function initProfilePage() {
  var profileForm = document.getElementById('profileForm');
  if (!profileForm) return;

  var finalImageUrl = localStorage.getItem('fotoProfil') || '';
  var originalUsername = localStorage.getItem('siswaLogin') || '';

  function compressImage(file, maxSize, quality) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var canvas = document.createElement('canvas');
          var w = img.width, h = img.height;
          if (w > h) { if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize; } }
          else { if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize; } }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function showPreviewPhoto(url) {
    var img = document.getElementById('previewFoto');
    if (url && url.trim() !== '') {
      img.src = url;
      img.style.display = 'block';
      img.classList.add('has-photo');
    } else {
      img.style.display = 'none';
      img.classList.remove('has-photo');
    }
  }

  var currentNama = localStorage.getItem('namaLengkap') || 'Admin';
  document.getElementById('inputNama').value = currentNama;
  document.getElementById('inputUser').value = originalUsername;
  showPreviewPhoto(finalImageUrl);

  var sidebarName = document.getElementById('sidebarAdminName');
  if (sidebarName) sidebarName.innerText = currentNama;
  var sidebarFoto = document.getElementById('sidebarFotoSiswa');
  if (finalImageUrl && sidebarFoto) sidebarFoto.src = finalImageUrl;
  var mobileFoto = document.getElementById('mobileFotoSiswa');
  if (finalImageUrl && mobileFoto) mobileFoto.src = finalImageUrl;

  document.getElementById('fileInput').addEventListener('change', async function () {
    var file = this.files[0];
    if (!file) return;
    var loading = document.getElementById('loadingStatus');
    var btn = document.getElementById('btnSimpan');
    loading.classList.remove('hidden');
    loading.className = 'text-sm font-medium text-primary mt-2';
    loading.innerText = 'Memproses foto...';
    btn.disabled = true;
    try {
      finalImageUrl = await compressImage(file, 200, 0.7);
      showPreviewPhoto(finalImageUrl);
      loading.innerText = 'Foto siap disimpan!';
      loading.className = 'text-sm font-medium text-emerald-500 mt-2';
    } catch (err) {
      showAlert('Gagal', 'Gagal memproses gambar. Coba gambar lain.', 'destructive');
      loading.innerText = 'Gagal memproses foto.';
      loading.className = 'text-sm font-medium text-destructive mt-2';
    } finally {
      btn.disabled = false;
    }
  });

  profileForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = document.getElementById('btnSimpan');
    btn.disabled = true;
    btn.innerText = 'Menyimpan ke database...';
    var newUsername = document.getElementById('inputUser').value;
    var payload = {
      type: 'UPDATE_PROFILE',
      oldUsername: originalUsername,
      newUsername: newUsername,
      nama: document.getElementById('inputNama').value,
      password: document.getElementById('inputPass').value,
      foto: finalImageUrl
    };
    try {
      await fetch(SCRIPT_URL_PROFILE, { method: 'POST', body: JSON.stringify(payload) });
      localStorage.setItem('namaLengkap', payload.nama);
      localStorage.setItem('siswaLogin', payload.newUsername);
      localStorage.setItem('fotoProfil', payload.foto);
      if (payload.password) localStorage.setItem('userPass', payload.password);
      showAlert('Berhasil!', 'Profil tersimpan permanen di Database.', 'success');
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 1500);
    } catch (error) {
      showAlert('Gagal!', 'Gagal menyimpan ke Google Sheet.', 'destructive');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Simpan Perubahan';
    }
  });
})();



var _dashboardChartInstance = null;
var _dashboardDailyData = [];
var _dashboardFirstLoad = true;

function renderDashboardChart(dailyData) {
  var canvas = document.getElementById('chartPelanggaran');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (_dashboardChartInstance) _dashboardChartInstance.destroy();
  var rs = getComputedStyle(document.documentElement);
  var primaryHSL = rs.getPropertyValue('--primary').trim();
  var lineColor = primaryHSL ? 'hsl(' + primaryHSL + ')' : 'hsl(221, 83%, 53%)';
  var tickColor = 'hsl(' + rs.getPropertyValue('--muted-foreground').trim() + ')';
  var borderHSL = rs.getPropertyValue('--border').trim();
  var gridColor = borderHSL ? 'hsl(' + borderHSL + ')' : 'hsl(240, 5.9%, 90%)';

  var getOrCreateTooltip = function (chart) {
    var el = chart.canvas.parentNode.querySelector('.shadcn-tooltip');
    if (!el) {
      el = document.createElement('div');
      el.className = 'shadcn-tooltip';
      el.style.cssText = 'position:absolute;pointer-events:none;transition:all 0.15s ease;opacity:0;z-index:50;';
      chart.canvas.parentNode.appendChild(el);
    }
    return el;
  };

  var externalTooltipHandler = function (context) {
    var chart = context.chart, tooltip = context.tooltip;
    var el = getOrCreateTooltip(chart);
    if (tooltip.opacity === 0) { el.style.opacity = 0; return; }
    var cardBg = 'hsl(' + rs.getPropertyValue('--card').trim() + ')';
    var cardFg = 'hsl(' + rs.getPropertyValue('--card-foreground').trim() + ')';
    var mutedFg = 'hsl(' + rs.getPropertyValue('--muted-foreground').trim() + ')';
    var borderC = 'hsl(' + rs.getPropertyValue('--border').trim() + ')';
    var title = tooltip.title[0] || '';
    var value = tooltip.body && tooltip.body[0] ? tooltip.body[0].lines[0] : '0';
    el.innerHTML = '<div style="background:' + cardBg + ';color:' + cardFg + ';border:1px solid ' + borderC + ';border-radius:0.5rem;padding:0.5rem 0.75rem;box-shadow:0 4px 6px -1px rgb(0 0 0/0.1);min-width:8rem;font-family:Inter,sans-serif;"><div style="font-size:0.75rem;color:' + mutedFg + ';margin-bottom:0.375rem;">' + title + '</div><div style="display:flex;align-items:center;justify-content:space-between;gap:1.5rem;"><div style="display:flex;align-items:center;gap:0.5rem;"><span style="display:inline-block;width:0.625rem;height:0.625rem;border-radius:0.125rem;background:' + lineColor + ';flex-shrink:0;"></span><span style="font-size:0.8125rem;color:' + mutedFg + ';">Pelanggaran</span></div><span style="font-size:0.8125rem;font-weight:600;">' + value + '</span></div></div>';
    el.style.opacity = 1;
    el.style.left = tooltip.caretX + chart.canvas.offsetLeft + 'px';
    el.style.top = tooltip.caretY + chart.canvas.offsetTop - 10 + 'px';
    el.style.transform = 'translate(-50%, -100%)';
  };

  var animDuration = _dashboardFirstLoad ? 2500 : 0;
  var clipRevealPlugin = {
    id: 'clipReveal',
    beforeDraw: function (chart) {
      if (!chart._clipReveal) return;
      var ctx2 = chart.ctx, ca = chart.chartArea;
      var clipWidth = ca.left + (ca.right - ca.left) * chart._clipReveal.progress;
      ctx2.save(); ctx2.beginPath();
      ctx2.rect(ca.left, ca.top - 10, clipWidth - ca.left, ca.bottom - ca.top + 20);
      ctx2.clip();
    },
    afterDraw: function (chart) { if (chart._clipReveal) chart.ctx.restore(); }
  };

  _dashboardChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dailyData.map(function (d) { return d.label; }),
      datasets: [{
        label: 'Pelanggaran', data: dailyData.map(function (d) { return d.count; }),
        borderColor: lineColor, borderWidth: 2, fill: false, tension: 0.4,
        pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: lineColor, pointHoverBorderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false, external: externalTooltipHandler } },
      scales: { y: { display: false }, x: { border: { display: false }, grid: { display: false }, ticks: { color: tickColor, font: { family: 'Inter', size: 12 } } } }
    },
    plugins: [clipRevealPlugin]
  });

  if (animDuration > 0) {
    _dashboardChartInstance._clipReveal = { progress: 0 };
    var startTime = performance.now();
    (function animateClip(now) {
      var t = Math.min((now - startTime) / animDuration, 1);
      _dashboardChartInstance._clipReveal.progress = 1 - Math.pow(1 - t, 4);
      _dashboardChartInstance.draw();
      if (t < 1) requestAnimationFrame(animateClip);
      else { _dashboardChartInstance._clipReveal = null; _dashboardChartInstance.draw(); }
    })(performance.now());
  }
}

(function initDashboardPage() {
  var chartCanvas = document.getElementById('chartPelanggaran');
  if (!chartCanvas) return;

  function calculateDailyData(rows) {
    var now = new Date(), days = [];
    var dayOfWeek = now.getDay();
    var sunday = new Date(now); sunday.setDate(now.getDate() - dayOfWeek); sunday.setHours(0, 0, 0, 0);
    var dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    for (var i = 0; i <= 6; i++) { var d = new Date(sunday); d.setDate(sunday.getDate() + i); days.push({ date: d, label: dayNames[i], count: 0 }); }
    rows.forEach(function (r) {
      var tgl = r.c[4] ? (r.c[4].f || r.c[4].v) : null;
      if (!tgl) return;
      var date = parseDate(tgl);
      if (!date || isNaN(date.getTime())) return;
      days.forEach(function (day) {
        var start = new Date(day.date); start.setHours(0, 0, 0, 0);
        var end = new Date(day.date); end.setHours(23, 59, 59, 999);
        if (date >= start && date <= end) day.count++;
      });
    });
    return days;
  }

  function calculateStats(rows) {
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    var countSekarang = 0, countLalu = 0;
    rows.forEach(function (r) {
      var tgl = r.c[4] ? (r.c[4].f || r.c[4].v) : null;
      if (!tgl) return;
      var date = parseDate(tgl);
      if (!date || isNaN(date.getTime())) return;
      var dateOnly = new Date(date); dateOnly.setHours(0, 0, 0, 0);
      if (dateOnly.getTime() === now.getTime()) countSekarang++;
      else if (dateOnly.getTime() === yesterday.getTime()) countLalu++;
    });
    return { countSekarang: countSekarang, countLalu: countLalu };
  }

  function getStatusBadgeClass(s) {
    if (s === 'Sedang Ditangani') return 'sedang';
    if (s === 'Sudah Ditangani') return 'selesai';
    return 'belum';
  }

  async function dashboardInit() {
    try {
      var res = await fetch(DB_URL);
      var text = await res.text();
      var json = JSON.parse(text.substr(47).slice(0, -2));
      var rows = json.table.rows || [];
      var stats = calculateStats(rows);
      var dailyData = calculateDailyData(rows);

      var cSekarang = document.getElementById('countSekarang');
      var cLalu = document.getElementById('countLalu');
      var trendEl = document.getElementById('trend');

      cSekarang.classList.remove('skeleton', 'text-transparent', 'w-20', 'h-12');
      cLalu.classList.remove('skeleton', 'text-transparent', 'w-16', 'h-9');
      trendEl.classList.remove('skeleton', 'text-transparent', 'w-6', 'h-6');

      if (_dashboardFirstLoad) {
        cSekarang.classList.add('animate-number-in');
        cLalu.classList.add('animate-number-in');
        animateCountUp(cSekarang, stats.countSekarang, 1200);
        animateCountUp(cLalu, stats.countLalu, 1200);
      } else {
        cSekarang.innerText = stats.countSekarang;
        cLalu.innerText = stats.countLalu;
      }

      var diff = stats.countSekarang - stats.countLalu;
      if (diff > 0) { trendEl.innerHTML = '▲'; trendEl.className = 'text-destructive text-xl font-bold ml-2'; }
      else if (diff < 0) { trendEl.innerHTML = '▼'; trendEl.className = 'text-emerald-500 text-xl font-bold ml-2'; }
      else { trendEl.innerHTML = '—'; trendEl.className = 'text-muted-foreground text-xl font-bold ml-2'; }

      var allV = rows.map(function (r) {
        var dateObj = parseDate(r.c[4] ? (r.c[4].f || r.c[4].v) : null);
        return { nama: (r.c[0] && r.c[0].v) || '-', kelas: (r.c[1] && r.c[1].v) || '-', hal: (r.c[2] && r.c[2].v) || '-', poin: (r.c[3] && r.c[3].v) || '-', tgl: formatDate(dateObj), status: (r.c[5] && r.c[5].v) || 'Belum Ditangani', date: dateObj };
      }).filter(function (r) { return r.date && !isNaN(r.date.getTime()); }).sort(function (a, b) { return b.date - a.date; });

      var html = '';
      if (allV.length === 0) {
        html = '<tr class="border-b transition-colors hover:bg-muted/50"><td colspan="6" class="p-4 align-middle text-center text-muted-foreground">Tidak ada data</td></tr>';
      } else {
        allV.slice(0, 3).forEach(function (r, idx) {
          var rowDelay = _dashboardFirstLoad ? ' style="animation-delay:' + (idx * 150) + 'ms"' : '';
          var rowClass = _dashboardFirstLoad ? ' animate-row' : '';
          html += '<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted' + rowClass + '"' + rowDelay + '><td class="p-4 align-middle font-medium">' + r.nama + '</td><td class="p-4 align-middle">' + r.kelas + '</td><td class="p-4 align-middle text-sm text-muted-foreground">' + r.hal + '</td><td class="p-4 align-middle"><div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ' + getPoinClasses(r.poin) + '">' + r.poin + '</div></td><td class="p-4 align-middle text-muted-foreground text-sm">' + r.tgl + '</td><td class="p-4 align-middle"><span class="status-badge ' + getStatusBadgeClass(r.status) + '">' + r.status + '</span></td></tr>';
        });
      }
      document.getElementById('tableContent').innerHTML = html;
      _dashboardDailyData = dailyData;
      renderDashboardChart(_dashboardDailyData);
      _dashboardFirstLoad = false;
    } catch (e) { console.error('Dashboard error:', e); }
  }

  window.addEventListener('resize', function () {
    if (_dashboardChartInstance && window.innerWidth >= 1024) _dashboardChartInstance.resize();
  });
  setInterval(dashboardInit, 30000);
  window.addEventListener('load', function () { dashboardInit(); });
})();



(function initDatabasePage() {
  var databaseContent = document.getElementById('databaseContent');
  if (!databaseContent) return;

  var allData = [], currentData = [];
  var pieActiveIndex = 0;
  var globalMonthCounts = new Array(12).fill(0);
  var currentPage = 1, itemsPerPage = 25;
  var sortCol = '', sortAsc = true;
  var currentTotalView = 'pertahun';

  var PIE_COLORS = [
    'hsl(220,70%,50%)', 'hsl(160,60%,45%)', 'hsl(30,80%,55%)', 'hsl(280,65%,60%)',
    'hsl(340,75%,55%)', 'hsl(197,71%,52%)', 'hsl(47,88%,50%)', 'hsl(142,58%,42%)',
    'hsl(271,55%,50%)', 'hsl(20,80%,52%)', 'hsl(186,72%,44%)', 'hsl(325,65%,52%)'
  ];

  function getStatusClass(s) {
    if (s === 'Sedang Ditangani') return 'status-sedang';
    if (s === 'Sudah Ditangani') return 'status-selesai';
    return 'status-belum';
  }
  function getPoinWeight(p) {
    var v = p.toLowerCase();
    if (v === 'berat') return 3; if (v === 'sedang') return 2; if (v === 'ringan') return 1; return 0;
  }
  function getStatusWeight(s) {
    if (s === 'Sudah Ditangani') return 3; if (s === 'Sedang Ditangani') return 2; if (s === 'Belum Ditangani') return 1; return 0;
  }
  function countWorkingDaysElapsed(statusDateStr) {
    if (!statusDateStr) return 0;
    var sd = parseDate(statusDateStr);
    if (!sd) return 0;
    var count = 0, cur = new Date(sd); cur.setHours(0, 0, 0, 0);
    var end = new Date(); end.setHours(0, 0, 0, 0);
    while (cur < end) { cur.setDate(cur.getDate() + 1); var day = cur.getDay(); if (day !== 0 && day !== 6) count++; }
    return count;
  }

  function buildStatusCell(r) {
    var countdown = '';
    if (r.status === 'Sudah Ditangani' && r.statusDate) {
      var elapsed = countWorkingDaysElapsed(r.statusDate);
      var remaining = Math.max(0, 5 - elapsed);
      countdown = remaining > 0
        ? '<div class="status-countdown">Diarsipkan dalam ' + remaining + ' hari kerja</div>'
        : '<div class="status-countdown">Menunggu arsip otomatis...</div>';
    }
    return '<td class="p-3 px-4 align-middle"><div><select class="status-select ' + getStatusClass(r.status) + '" onchange="updateStatus(' + r.rowIndex + ', this.value, this)" data-row="' + r.rowIndex + '"><option value="Belum Ditangani"' + (r.status === 'Belum Ditangani' ? ' selected' : '') + '>Belum Ditangani</option><option value="Sedang Ditangani"' + (r.status === 'Sedang Ditangani' ? ' selected' : '') + '>Sedang Ditangani</option><option value="Sudah Ditangani"' + (r.status === 'Sudah Ditangani' ? ' selected' : '') + '>Sudah Ditangani</option></select>' + countdown + '</div></td>';
  }

  function renderTable() {
    var start = (currentPage - 1) * itemsPerPage;
    var paginatedData = currentData.slice(start, start + itemsPerPage);
    var html = '';
    if (paginatedData.length === 0) {
      html = '<tr class="border-b"><td colspan="6" class="py-6 text-center text-muted-foreground font-medium">Data tidak ditemukan</td></tr>';
    } else {
      paginatedData.forEach(function (r) {
        html += '<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"><td class="p-3 px-4 align-middle font-medium uppercase">' + r.nama + '</td><td class="p-3 px-4 align-middle">' + r.kelas + '</td><td class="p-3 px-4 align-middle text-sm text-muted-foreground truncate max-w-xs" title="' + r.hal + '">' + r.hal + '</td><td class="p-3 px-4 align-middle"><div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ' + getPoinClasses(r.poin) + '">' + r.poin + '</div></td><td class="p-3 px-4 align-middle text-muted-foreground text-sm">' + r.tglStr + '</td>' + buildStatusCell(r) + '</tr>';
      });
    }
    databaseContent.innerHTML = html;
  }

  function renderPagination() {
    var totalPages = Math.max(1, Math.ceil(currentData.length / itemsPerPage));
    var pagContainer = document.getElementById('pagination');
    pagContainer.innerHTML = '';
    var createBtn = function (text, isDisabled, onClick, isActive) {
      var btn = document.createElement('button');
      btn.className = 'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ' + (isActive ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90' : 'bg-transparent') + (isDisabled ? ' pointer-events-none opacity-50' : '');
      btn.innerHTML = text; btn.disabled = isDisabled;
      if (!isDisabled && !isActive) btn.onclick = onClick;
      return btn;
    };
    pagContainer.appendChild(createBtn('&laquo;', currentPage === 1, function () { currentPage = 1; updateTableAndView(); }));
    pagContainer.appendChild(createBtn('&lsaquo;', currentPage === 1, function () { currentPage--; updateTableAndView(); }));
    for (var i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        (function (pg) { pagContainer.appendChild(createBtn(pg, false, function () { currentPage = pg; updateTableAndView(); }, pg === currentPage)); })(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        var dots = document.createElement('span'); dots.className = 'px-1 text-muted-foreground'; dots.innerText = '...'; pagContainer.appendChild(dots);
      }
    }
    pagContainer.appendChild(createBtn('&rsaquo;', currentPage === totalPages, function () { currentPage++; updateTableAndView(); }));
    pagContainer.appendChild(createBtn('&raquo;', currentPage === totalPages, function () { currentPage = totalPages; updateTableAndView(); }));
  }

  function updateTableAndView() { renderTable(); renderPagination(); }

  function updateTotalCard(data) {
    var now = new Date(), count = 0, prevCount = 0;
    var currentYear = now.getFullYear(), currentMonth = now.getMonth();
    data.forEach(function (d) {
      var itemYear = d.date.getFullYear(), itemMonth = d.date.getMonth();
      if (currentTotalView === 'keseluruhan') { count++; }
      else if (currentTotalView === 'pertahun') { if (itemYear === currentYear) count++; else if (itemYear === currentYear - 1) prevCount++; }
      else if (currentTotalView === 'perbulan') {
        if (itemYear === currentYear && itemMonth === currentMonth) count++;
        var prevMonthYear = currentYear, prevMonth = currentMonth - 1;
        if (prevMonth < 0) { prevMonth = 11; prevMonthYear--; }
        if (itemYear === prevMonthYear && itemMonth === prevMonth) prevCount++;
      } else if (currentTotalView === 'perminggu') {
        var diffDays = (now - d.date) / 86400000;
        if (diffDays >= 0 && diffDays <= 7) count++;
        else if (diffDays > 7 && diffDays <= 14) prevCount++;
      }
    });
    var totalAngkaEl = document.getElementById('totalAngka');
    var wasSkeleton = totalAngkaEl.classList.contains('skeleton');
    totalAngkaEl.classList.remove('skeleton', 'text-transparent', 'w-24', 'h-16');
    totalAngkaEl.classList.add('animate-number-in');
    if (wasSkeleton) { animateCountUp(totalAngkaEl, count, 1200); } else { totalAngkaEl.innerText = count; }
    document.getElementById('totalLabel').innerText = currentTotalView;
    var trendEl = document.getElementById('totalTrend');
    if (currentTotalView === 'keseluruhan') { trendEl.classList.add('hidden'); }
    else {
      trendEl.classList.remove('hidden');
      if (count > prevCount) { trendEl.innerHTML = '▲'; trendEl.className = 'text-3xl font-bold text-destructive'; }
      else if (count < prevCount) { trendEl.innerHTML = '▼'; trendEl.className = 'text-3xl font-bold text-emerald-500'; }
      else { trendEl.innerHTML = '—'; trendEl.className = 'text-3xl font-bold text-muted-foreground'; }
    }
  }

  function renderInteractivePie() {
    var wrap = document.getElementById('donutChartContainer');
    if (!wrap) return;
    var SZ = 280, CX = 140, CY = 140, IR = 82, OR = 112, EX = 10, RW = 13, GAP = 0.014;
    var total = globalMonthCounts.reduce(function (a, b) { return a + b; }, 0);
    var NS = 'http://www.w3.org/2000/svg';
    wrap.innerHTML = '';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + SZ + ' ' + SZ); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%'); svg.style.overflow = 'visible';
    if (total === 0) {
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', CX); t.setAttribute('y', CY); t.setAttribute('text-anchor', 'middle'); t.setAttribute('dominant-baseline', 'middle');
      t.setAttribute('font-size', '13'); t.setAttribute('font-family', 'Inter,sans-serif'); t.setAttribute('fill', 'hsl(var(--muted-foreground))');
      t.textContent = 'Tidak ada data tahun ini'; svg.appendChild(t); wrap.appendChild(svg); return;
    }
    var arcs = [], angle = -Math.PI / 2;
    globalMonthCounts.forEach(function (cnt, i) {
      if (cnt === 0) { arcs.push(null); return; }
      var sweep = (cnt / total) * Math.PI * 2 - GAP;
      arcs.push({ i: i, cnt: cnt, color: PIE_COLORS[i], a1: angle + GAP / 2, a2: angle + GAP / 2 + sweep });
      angle += (cnt / total) * Math.PI * 2;
    });
    function sector(r1, r2, a1, a2) {
      var c = Math.cos, s = Math.sin, lg = a2 - a1 > Math.PI ? 1 : 0;
      return 'M' + (CX + r2 * c(a1)) + ',' + (CY + r2 * s(a1)) + 'A' + r2 + ',' + r2 + ' 0 ' + lg + ',1 ' + (CX + r2 * c(a2)) + ',' + (CY + r2 * s(a2)) + 'L' + (CX + r1 * c(a2)) + ',' + (CY + r1 * s(a2)) + 'A' + r1 + ',' + r1 + ' 0 ' + lg + ',0 ' + (CX + r1 * c(a1)) + ',' + (CY + r1 * s(a1)) + 'Z';
    }
    var arcIdx = 0;
    var sliceDelay = Math.min(180, 2500 / Math.max(1, arcs.filter(function (a) { return a; }).length));
    arcs.forEach(function (arc) {
      if (!arc || arc.i === pieActiveIndex) return;
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', sector(IR, OR, arc.a1, arc.a2)); p.setAttribute('fill', arc.color);
      p.setAttribute('stroke', 'white'); p.setAttribute('stroke-width', '2'); p.style.cursor = 'pointer';
      p.style.transformOrigin = CX + 'px ' + CY + 'px'; p.style.opacity = '0';
      p.style.animation = 'donutSliceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both';
      p.style.animationDelay = (arcIdx * sliceDelay) + 'ms';
      p.onmouseenter = function () { p.style.opacity = '.7'; };
      p.onmouseleave = function () { p.style.opacity = '1'; };
      (function (a) { p.onclick = function () { pieActiveIndex = a.i; document.getElementById('pieMonthSelect').value = a.i; renderInteractivePie(); }; })(arc);
      svg.appendChild(p); arcIdx++;
    });
    var activeDelay = arcIdx * sliceDelay;
    var a = arcs[pieActiveIndex];
    if (a) {
      var ring = document.createElementNS(NS, 'path');
      ring.setAttribute('d', sector(OR + EX + 2, OR + EX + 2 + RW, a.a1, a.a2)); ring.setAttribute('fill', a.color);
      ring.style.transformOrigin = CX + 'px ' + CY + 'px'; ring.style.opacity = '0';
      ring.style.animation = 'donutRingIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both';
      ring.style.animationDelay = (activeDelay + 120) + 'ms'; svg.appendChild(ring);
      var sp = document.createElementNS(NS, 'path');
      sp.setAttribute('d', sector(IR, OR + EX, a.a1, a.a2)); sp.setAttribute('fill', a.color);
      sp.setAttribute('stroke', 'white'); sp.setAttribute('stroke-width', '2');
      sp.style.transformOrigin = CX + 'px ' + CY + 'px'; sp.style.opacity = '0';
      sp.style.animation = 'donutSliceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both';
      sp.style.animationDelay = activeDelay + 'ms'; svg.appendChild(sp);
    }
    var textDelay = activeDelay + 300;
    var tVal = document.createElementNS(NS, 'text');
    tVal.setAttribute('x', CX); tVal.setAttribute('y', CY - 6); tVal.setAttribute('text-anchor', 'middle'); tVal.setAttribute('dominant-baseline', 'middle');
    tVal.setAttribute('font-size', '32'); tVal.setAttribute('font-weight', '700'); tVal.setAttribute('font-family', 'Inter,sans-serif');
    tVal.setAttribute('fill', 'hsl(var(--foreground))'); tVal.textContent = globalMonthCounts[pieActiveIndex] || 0;
    tVal.style.opacity = '0'; tVal.style.animation = 'donutTextIn 0.5s ease-out both'; tVal.style.animationDelay = textDelay + 'ms'; svg.appendChild(tVal);
    var tLbl = document.createElementNS(NS, 'text');
    tLbl.setAttribute('x', CX); tLbl.setAttribute('y', CY + 22); tLbl.setAttribute('text-anchor', 'middle');
    tLbl.setAttribute('font-size', '13'); tLbl.setAttribute('font-family', 'Inter,sans-serif'); tLbl.setAttribute('fill', 'hsl(var(--muted-foreground))');
    tLbl.textContent = 'Kasus'; tLbl.style.opacity = '0'; tLbl.style.animation = 'donutTextIn 0.5s ease-out both';
    tLbl.style.animationDelay = (textDelay + 100) + 'ms'; svg.appendChild(tLbl);
    wrap.appendChild(svg);
  }

  function processDonutAndYoY(data) {
    var now = new Date();
    globalMonthCounts = new Array(12).fill(0);
    data.forEach(function (d) { if (d.date.getFullYear() === now.getFullYear()) globalMonthCounts[d.date.getMonth()]++; });
    pieActiveIndex = now.getMonth();
    document.getElementById('pieMonthSelect').value = pieActiveIndex;
    renderInteractivePie();
  }

  async function fetchDatabase() {
    try {
      var res = await fetch(DB_URL);
      var text = await res.text();
      var json = JSON.parse(text.substr(47).slice(0, -2));
      var rawRows = json.table.rows || [];
      allData = rawRows.map(function (r, idx) {
        var rawDate = r.c[4] ? (r.c[4].f || r.c[4].v) : null;
        var dateObj = parseDate(rawDate);
        var tglStr = rawDate || '-';
        if (dateObj && !isNaN(dateObj.getTime())) tglStr = formatDate(dateObj);
        return {
          nama: (r.c[0] && r.c[0].v) || '-', kelas: (r.c[1] && r.c[1].v) || '-',
          hal: (r.c[2] && r.c[2].v) || '-', poin: (r.c[3] && r.c[3].v) || '-',
          tglStr: tglStr, date: dateObj, timestamp: dateObj ? dateObj.getTime() : 0,
          status: (r.c[5] && r.c[5].v) || 'Belum Ditangani', statusDate: (r.c[6] && r.c[6].v) || '', rowIndex: idx + 2
        };
      }).filter(function (r) { return r.timestamp !== 0; });
      allData.sort(function (a, b) { return b.timestamp - a.timestamp; });
      currentData = allData.slice();
      processDonutAndYoY(allData);
      updateTotalCard(allData);
      renderTable();
      renderPagination();
    } catch (e) {
      console.error('Database error:', e);
      databaseContent.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-muted-foreground">Gagal memuat data</td></tr>';
    }
  }


  window.sortTable = function (col) {
    if (sortCol === col) sortAsc = !sortAsc; else { sortCol = col; sortAsc = true; }
    document.querySelectorAll('.sort-icon').forEach(function (ic) { ic.innerText = '↕'; });
    document.querySelectorAll('.table th').forEach(function (th) { th.classList.remove('active'); });
    var activeIcon = document.getElementById('icon-' + col);
    if (activeIcon) { activeIcon.parentElement.classList.add('active'); activeIcon.innerText = sortAsc ? '⬆' : '⬇'; }
    currentData.sort(function (a, b) {
      var valA, valB;
      if (col === 'nama') { valA = a.nama.toLowerCase(); valB = b.nama.toLowerCase(); }
      else if (col === 'poin') { valA = getPoinWeight(a.poin); valB = getPoinWeight(b.poin); }
      else if (col === 'tgl') { valA = a.timestamp; valB = b.timestamp; }
      else if (col === 'status') { valA = getStatusWeight(a.status); valB = getStatusWeight(b.status); }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    currentPage = 1; renderTable(); renderPagination();
  };


  window.updateStatus = async function (rowIndex, newStatus, selectEl) {
    selectEl.disabled = true;
    var prevClass = selectEl.className;
    selectEl.className = 'status-select ' + getStatusClass(newStatus);
    try {
      await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ type: 'UPDATE_STATUS', rowIndex: rowIndex, status: newStatus }) });
      var item = allData.find(function (d) { return d.rowIndex === rowIndex; });
      if (item) { item.status = newStatus; item.statusDate = newStatus === 'Sudah Ditangani' ? new Date().toLocaleString('id-ID') : ''; }
      var cur = currentData.find(function (d) { return d.rowIndex === rowIndex; });
      if (cur) { cur.status = newStatus; cur.statusDate = newStatus === 'Sudah Ditangani' ? new Date().toLocaleString('id-ID') : ''; }
      showAlert('Berhasil!', 'Status diubah ke "' + newStatus + '"', 'success');
      renderTable();
    } catch (err) {
      showAlert('Gagal!', 'Gagal mengubah status. Periksa koneksi.', 'destructive');
      selectEl.className = prevClass;
      var orig = allData.find(function (d) { return d.rowIndex === rowIndex; });
      if (orig) selectEl.value = orig.status;
    } finally { selectEl.disabled = false; }
  };


  document.getElementById('searchInput').addEventListener('input', function (e) {
    var keyword = e.target.value.toLowerCase();
    currentData = allData.filter(function (r) { return r.nama.toLowerCase().includes(keyword); });
    currentPage = 1; sortCol = '';
    document.querySelectorAll('.sort-icon').forEach(function (ic) { ic.innerText = '↕'; });
    document.querySelectorAll('.table th').forEach(function (th) { th.classList.remove('active'); });
    renderTable(); renderPagination();
  });


  document.getElementById('pieMonthSelect').addEventListener('change', function (e) {
    pieActiveIndex = parseInt(e.target.value);
    renderInteractivePie();
  });


  document.getElementById('filterBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('filterDropdown').classList.toggle('show');
  });
  document.addEventListener('click', function () { document.getElementById('filterDropdown').classList.remove('show'); });
  document.querySelectorAll('.filter-option').forEach(function (opt) {
    opt.addEventListener('click', function (e) {
      document.querySelectorAll('.filter-option').forEach(function (o) { o.classList.remove('bg-accent', 'text-accent-foreground', 'font-medium'); });
      e.target.classList.add('bg-accent', 'text-accent-foreground', 'font-medium');
      currentTotalView = e.target.getAttribute('data-view');
      updateTotalCard(allData);
    });
  });


  window.addEventListener('load', function () { fetchDatabase(); });
})();