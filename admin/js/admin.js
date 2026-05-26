/* ================================================================
   HopeRise Foundation — Admin Dashboard JS
================================================================ */
'use strict';

/* ── Theme ── */
function getTheme() { return localStorage.getItem('hr-admin-theme') || 'light'; }
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('hr-admin-theme', theme);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
function toggleTheme() { applyTheme(getTheme() === 'dark' ? 'light' : 'dark'); }

/* ── Sidebar ── */
function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebarOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Dropdowns ── */
function toggleDropdown(id) {
  document.querySelectorAll('.dropdown-menu').forEach(d => { if (d.id !== id) d.classList.remove('open'); });
  document.getElementById(id)?.classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown-wrap')) {
    document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('open'));
  }
});

/* ── Toast ── */
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) { container = document.createElement('div'); container.id = 'toastContainer'; container.className = 'toast-container'; document.body.appendChild(container); }
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type]||icons.info} toast-icon"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity='0'; toast.style.transform='translateX(20px)'; toast.style.transition='all .3s ease'; setTimeout(()=>toast.remove(),300); }, 3500);
}

/* ── Modal ── */
function openModal(id) { document.getElementById(id)?.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow = ''; }

/* ── Animated Counters ── */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dec    = el.dataset.dec || 0;
    const duration = 1400;
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = target < 100 && dec > 0 ? (ease * target).toFixed(dec) : Math.floor(ease * target).toLocaleString('en-IN');
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ── Progress Bars ── */
function animateProgress() {
  document.querySelectorAll('.progress-fill[data-width]').forEach(bar => {
    const w = bar.dataset.width;
    bar.style.width = '0';
    setTimeout(() => { bar.style.width = w; }, 150);
  });
}

/* ── Table Sort ── */
function sortTable(tableId, col) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const dir = table.dataset.sortDir === 'asc' ? 'desc' : 'asc';
  table.dataset.sortDir = dir;
  rows.sort((a, b) => {
    const av = a.cells[col]?.textContent.trim() || '';
    const bv = b.cells[col]?.textContent.trim() || '';
    const an = parseFloat(av.replace(/[^\d.]/g, ''));
    const bn = parseFloat(bv.replace(/[^\d.]/g, ''));
    if (!isNaN(an) && !isNaN(bn)) return dir === 'asc' ? an - bn : bn - an;
    return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  rows.forEach(r => tbody.appendChild(r));
  table.querySelectorAll('th .sort-icon').forEach((ic, i) => {
    ic.className = 'fas sort-icon ' + (i === col ? (dir === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort');
  });
}

/* ── Table Search ── */
function bindSearch(inputId, tableId) {
  const inp = document.getElementById(inputId);
  const tbl = document.getElementById(tableId);
  if (!inp || !tbl) return;
  inp.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    tbl.querySelectorAll('tbody tr').forEach(r => { r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none'; });
  });
}

/* ── Export CSV ── */
function exportCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) { showToast('No data to export', 'error'); return; }
  const rows = Array.from(table.querySelectorAll('tr'));
  const csv = rows.map(r => Array.from(r.querySelectorAll('th,td')).map(c => '"' + c.textContent.trim().replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename || 'report.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('Report exported successfully!', 'success');
}

/* ── Settings Tabs ── */
function openSettingsTab(name) {
  document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.settings-nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name)?.classList.add('active');
  document.querySelector(`[data-tab="${name}"]`)?.classList.add('active');
}

/* ── Logout ── */
function adminLogout() {
  try { sessionStorage.removeItem('hr-user'); } catch(e) {}
  window.location.href = '../login.html';
}

/* ── Chart Colors ── */
const CHART_COLORS = {
  blue:   '#4776e6',
  green:  '#22c55e',
  pink:   '#ec4899',
  orange: '#f97316',
  cyan:   '#06b6d4',
  purple: '#8b5cf6',
};

function gradientFill(ctx, color1, color2) {
  const g = ctx.createLinearGradient(0, 0, 0, 280);
  g.addColorStop(0, color1 + '80');
  g.addColorStop(1, color2 + '08');
  return g;
}

/* ── Charts ── */
function initCharts() {
  Chart.defaults.font.family = "'Poppins', sans-serif";
  Chart.defaults.color = '#94a3b8';

  /* Monthly Donations Line */
  const dc = document.getElementById('donationsChart');
  if (dc) {
    const ctx = dc.getContext('2d');
    new Chart(dc, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'Donations ₹',
          data: [42000,58000,71000,55000,89000,102000,95000,118000,132000,145000,128000,162000],
          borderColor: CHART_COLORS.blue,
          backgroundColor: gradientFill(ctx, CHART_COLORS.blue, CHART_COLORS.green),
          borderWidth: 2.5, tension: 0.4, fill: true,
          pointBackgroundColor: CHART_COLORS.blue, pointRadius: 4, pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => '₹' + (v/1000).toFixed(0) + 'k' } }
        }
      }
    });
  }

  /* Volunteer Growth Bar */
  const vc = document.getElementById('volunteersChart');
  if (vc) {
    new Chart(vc, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'Volunteers',
          data: [8,12,15,10,22,18,25,30,28,35,32,40],
          backgroundColor: ctx => {
            const g = ctx.chart.ctx.createLinearGradient(0,0,0,200);
            g.addColorStop(0, CHART_COLORS.blue); g.addColorStop(1, CHART_COLORS.green); return g;
          },
          borderRadius: 6, borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.04)' } } }
      }
    });
  }

  /* Donation Sources Doughnut */
  const sc = document.getElementById('sourcesChart');
  if (sc) {
    new Chart(sc, {
      type: 'doughnut',
      data: {
        labels: ['Online','Cash','Bank Transfer','Corporate','Events'],
        datasets: [{ data: [38,18,22,14,8], backgroundColor: Object.values(CHART_COLORS), borderWidth: 0, hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 } } } }
      }
    });
  }

  /* Campaign Radar */
  const cc = document.getElementById('campaignChart');
  if (cc) {
    new Chart(cc, {
      type: 'radar',
      data: {
        labels: ['Education','Healthcare','Food Relief','Environment','Child Welfare','Housing'],
        datasets: [
          { label: 'Target',   data: [90,85,75,60,80,70], borderColor: CHART_COLORS.blue,  backgroundColor: CHART_COLORS.blue  + '1a', pointBackgroundColor: CHART_COLORS.blue,  borderWidth: 2 },
          { label: 'Achieved', data: [75,72,68,45,70,55], borderColor: CHART_COLORS.green, backgroundColor: CHART_COLORS.green + '1a', pointBackgroundColor: CHART_COLORS.green, borderWidth: 2 },
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }, scales: { r: { ticks: { display: false }, grid: { color: 'rgba(0,0,0,0.07)' } } } }
    });
  }

  /* Reports Donation Trend */
  const rc = document.getElementById('reportDonationChart');
  if (rc) {
    const ctx = rc.getContext('2d');
    new Chart(rc, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [
          { label: 'Donations', data: [42000,58000,71000,55000,89000,102000,95000,118000,132000,145000,128000,162000], backgroundColor: CHART_COLORS.blue + 'cc', borderRadius: 5 },
          { label: 'Target',    data: [50000,60000,70000,65000,85000,100000,100000,115000,130000,140000,135000,160000], type: 'line', borderColor: CHART_COLORS.green, backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointRadius: 3 },
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => '₹' + (v/1000).toFixed(0) + 'k' } } } }
    });
  }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getTheme());

  document.getElementById('sidebarToggle')?.addEventListener('click', openSidebar);
  document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);
  document.getElementById('themeBtn')?.addEventListener('click', toggleTheme);
  document.getElementById('notifBtn')?.addEventListener('click', () => toggleDropdown('notifMenu'));
  document.getElementById('profileBtn')?.addEventListener('click', () => toggleDropdown('profileMenu'));

  animateCounters();
  animateProgress();

  if (typeof Chart !== 'undefined') initCharts();

  // Table sort headers
  document.querySelectorAll('[data-sort-col]').forEach(th => {
    th.addEventListener('click', function() { sortTable(this.dataset.sortTable, parseInt(this.dataset.sortCol)); });
  });

  // Search bindings
  bindSearch('donorSearch', 'donorsTable');
  bindSearch('volSearch', 'volunteersTable');
  bindSearch('donationSearch', 'donationsTable');

  // Settings tabs
  document.querySelectorAll('.settings-nav-item').forEach(btn => {
    btn.addEventListener('click', function() { openSettingsTab(this.dataset.tab); });
  });

  // Toggle switches
  document.querySelectorAll('.toggle-switch').forEach(sw => {
    sw.addEventListener('click', function() { this.classList.toggle('on'); });
  });

  // Logout
  document.querySelectorAll('[data-admin-logout]').forEach(btn => {
    btn.addEventListener('click', e => { e.preventDefault(); adminLogout(); });
  });

  // Modal overlay click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
      closeSidebar();
    }
  });
});

window.openModal   = openModal;
window.closeModal  = closeModal;
window.exportCSV   = exportCSV;
window.adminLogout = adminLogout;
window.sortTable   = sortTable;
window.showToast   = showToast;
window.openSettingsTab = openSettingsTab;
