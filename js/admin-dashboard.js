/* ============================================================
   HopeRise Foundation — Admin Dashboard JavaScript
   ============================================================ */
'use strict';

/* ── Mock Data ───────────────────────────────────────────────*/
const DONORS_TABLE = [
  { name: 'Priya Sharma',  email: 'priya@example.com',  amount: 45000, date: '2024-12-01', status: 'Active',    campaigns: 6 },
  { name: 'Rahul Verma',   email: 'rahul@example.com',  amount: 28000, date: '2024-11-20', status: 'Active',    campaigns: 4 },
  { name: 'Anjali Singh',  email: 'anjali@example.com', amount: 72000, date: '2024-11-15', status: 'Active',    campaigns: 9 },
  { name: 'Kiran Patel',   email: 'kiran@example.com',  amount: 15000, date: '2024-10-30', status: 'Inactive',  campaigns: 2 },
  { name: 'Meena Rao',     email: 'meena@example.com',  amount: 33000, date: '2024-10-12', status: 'Active',    campaigns: 5 },
  { name: 'Suresh Kumar',  email: 'suresh@example.com', amount: 9500,  date: '2024-09-28', status: 'Pending',   campaigns: 1 },
];

const CAMPAIGNS_TABLE = [
  { name: 'Child Nutrition Drive',  goal: 250000, raised: 187500, pct: 75, status: 'Active',   donors: 142 },
  { name: 'Medical Aid Program',    goal: 150000, raised: 92000,  pct: 61, status: 'Active',   donors: 87 },
  { name: 'Education for All',      goal: 300000, raised: 215000, pct: 72, status: 'Active',   donors: 198 },
  { name: 'Clean Water Initiative', goal: 100000, raised: 44000,  pct: 44, status: 'Active',   donors: 63 },
  { name: 'Emergency Relief Fund',  goal: 200000, raised: 200000, pct: 100, status: 'Completed', donors: 231 },
];

const BENEFICIARIES_TABLE = [
  { name: 'Aarav Mehta',    type: 'Medical Aid',    date: '2024-12-01', status: 'Active',    location: 'Mumbai' },
  { name: 'Sita Devi',      type: 'Nutrition',      date: '2024-11-25', status: 'Active',    location: 'Delhi' },
  { name: 'Ravi Prasad',    type: 'Education',      date: '2024-11-18', status: 'Completed', location: 'Chennai' },
  { name: 'Geeta Kumari',   type: 'Emergency Aid',  date: '2024-11-10', status: 'Active',    location: 'Kolkata' },
  { name: 'Mohan Lal',      type: 'Medical Aid',    date: '2024-10-30', status: 'Pending',   location: 'Bangalore' },
];

const ACTIVITY_FEED = [
  { icon: 'fa-heart',    color: 'ai-blue',   msg: '<strong>Priya Sharma</strong> donated ₹5,000 to Child Nutrition Drive', time: '2 min ago' },
  { icon: 'fa-user-plus',color: 'ai-green',  msg: '<strong>Suresh Kumar</strong> registered as a new Donor', time: '15 min ago' },
  { icon: 'fa-trophy',   color: 'ai-orange', msg: 'Campaign <strong>Education for All</strong> reached 72% of its goal', time: '1 hr ago' },
  { icon: 'fa-medkit',   color: 'ai-pink',   msg: '<strong>Aarav Mehta</strong> received medical aid support', time: '3 hrs ago' },
  { icon: 'fa-check-circle', color: 'ai-green', msg: 'Emergency Relief Fund campaign <strong>completed</strong> its goal!', time: '1 day ago' },
];

/* ── Toast ───────────────────────────────────────────────────*/
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = Object.assign(document.createElement('div'), { id: 'toastContainer', className: 'toast-container' });
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const toast = Object.assign(document.createElement('div'), { className: `toast ${type}` });
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.cssText = 'opacity:0;transform:translateX(40px);transition:all .3s ease;';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── Sidebar ─────────────────────────────────────────────────*/
function initSidebar() {
  const hamburger = document.getElementById('sidebarToggle');
  const sidebar   = document.getElementById('dashSidebar');
  const overlay   = document.getElementById('sidebarOverlay');
  const links     = document.querySelectorAll('.sidebar-link[data-section]');

  const open  = () => { sidebar?.classList.add('open'); overlay?.classList.add('show'); document.body.style.overflow = 'hidden'; };
  const close = () => { sidebar?.classList.remove('open'); overlay?.classList.remove('show'); document.body.style.overflow = ''; };

  hamburger?.addEventListener('click', open);
  overlay?.addEventListener('click', close);

  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const sectionId = link.dataset.section;
      document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(sectionId);
      if (target) target.classList.add('active');

      const pageTitle = document.getElementById('pageTitle');
      if (pageTitle) pageTitle.textContent = link.querySelector('.link-text')?.textContent || '';

      if (window.innerWidth <= 960) close();

      if (sectionId === 'sectionDashboard') initCharts();
    });
  });
}

/* ── Logout ──────────────────────────────────────────────────*/
function initLogout() {
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.removeItem('hoperise_session');
      showToast('Logged out successfully.', 'info');
      setTimeout(() => { window.location.href = 'login.html'; }, 900);
    });
  });
}

/* ── Load User Info ──────────────────────────────────────────*/
function loadUserInfo(user) {
  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = `${user.firstName} ${user.lastName}`;
  });
  document.querySelectorAll('[data-user-avatar]').forEach(el => {
    el.textContent = user.avatar || (user.firstName[0] + user.lastName[0]).toUpperCase();
  });
  document.querySelectorAll('[data-user-email]').forEach(el => {
    el.textContent = user.email;
  });
}

/* ── Stats Cards ─────────────────────────────────────────────*/
function loadStats() {
  const stats = {
    statTotalRaised:   '₹8,42,500',
    statActiveCampaigns: '4',
    statBeneficiaries:  '1,284',
    statMonthlyGrowth:  '+23%',
    statPending:        '6',
    statSuccessRate:    '94%'
  };
  Object.entries(stats).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

/* ── Tables ──────────────────────────────────────────────────*/
function renderDonorsTable(data) {
  const tbody = document.getElementById('donorsTableBody');
  if (!tbody) return;

  const initials = n => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const statusCls = s => s === 'Active' ? 'badge-success' : s === 'Pending' ? 'badge-warning' : 'badge-gray';

  tbody.innerHTML = data.map(d => `
    <tr>
      <td>
        <div class="donor-cell">
          <div class="donor-avatar">${initials(d.name)}</div>
          <div>
            <div class="donor-name">${d.name}</div>
            <div class="donor-email">${d.email}</div>
          </div>
        </div>
      </td>
      <td><strong>₹${d.amount.toLocaleString('en-IN')}</strong></td>
      <td>${d.date}</td>
      <td>${d.campaigns}</td>
      <td><span class="badge ${statusCls(d.status)}">${d.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="showToast('Donor details coming soon!','info')">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function renderCampaignsTable(data) {
  const tbody = document.getElementById('campaignsTableBody');
  if (!tbody) return;

  const statusCls = s => s === 'Active' ? 'badge-success' : s === 'Completed' ? 'badge-info' : 'badge-warning';

  tbody.innerHTML = data.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>₹${c.goal.toLocaleString('en-IN')}</td>
      <td>₹${c.raised.toLocaleString('en-IN')}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="progress-wrap" style="height:7px;flex:1;min-width:80px">
            <div class="progress-fill${c.pct >= 100 ? ' green' : ''}" style="width:${c.pct}%"></div>
          </div>
          <span style="font-size:.78rem;font-weight:700;color:var(--primary);white-space:nowrap">${c.pct}%</span>
        </div>
      </td>
      <td>${c.donors}</td>
      <td><span class="badge ${statusCls(c.status)}">${c.status}</span></td>
    </tr>
  `).join('');
}

function renderBeneficiariesTable(data) {
  const tbody = document.getElementById('beneTableBody');
  if (!tbody) return;

  const statusCls = s => s === 'Active' ? 'badge-success' : s === 'Completed' ? 'badge-info' : 'badge-warning';

  tbody.innerHTML = data.map(b => `
    <tr>
      <td><strong>${b.name}</strong></td>
      <td><span class="badge badge-purple">${b.type}</span></td>
      <td>${b.location}</td>
      <td>${b.date}</td>
      <td><span class="badge ${statusCls(b.status)}">${b.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="showToast('Details coming soon!','info')">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/* ── Activity Feed ───────────────────────────────────────────*/
function renderActivityFeed() {
  const container = document.getElementById('activityFeed');
  if (!container) return;

  container.innerHTML = ACTIVITY_FEED.map(a => `
    <div class="activity-item">
      <div class="activity-icon ${a.color}"><i class="fas ${a.icon}"></i></div>
      <div class="activity-body">
        <div class="activity-msg">${a.msg}</div>
        <div class="activity-time"><i class="fas fa-clock" style="margin-right:4px;opacity:.6"></i>${a.time}</div>
      </div>
    </div>
  `).join('');
}

/* ── Charts ──────────────────────────────────────────────────*/
let chartsInitialized = false;

function initCharts() {
  if (chartsInitialized || typeof Chart === 'undefined') return;
  chartsInitialized = true;

  /* Monthly Donations */
  const ctxMonthly = document.getElementById('chartMonthly');
  if (ctxMonthly) {
    new Chart(ctxMonthly, {
      type: 'bar',
      data: {
        labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Donations (₹)',
          data: [85000, 92000, 110000, 130000, 158000, 175000],
          backgroundColor: 'rgba(79,140,255,.18)',
          borderColor: '#4F8CFF',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(79,140,255,.35)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,.05)' },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#94A3B8',
              callback: v => '₹' + (v >= 1000 ? Math.round(v/1000) + 'K' : v)
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8' }
          }
        }
      }
    });
  }

  /* Campaign Performance */
  const ctxCampaign = document.getElementById('chartCampaign');
  if (ctxCampaign) {
    new Chart(ctxCampaign, {
      type: 'doughnut',
      data: {
        labels: ['Nutrition', 'Healthcare', 'Education', 'Water', 'Relief'],
        datasets: [{
          data: [187500, 92000, 215000, 44000, 200000],
          backgroundColor: ['#4F8CFF', '#2ECC71', '#FF6B9D', '#0EA5E9', '#F59E0B'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { family: 'Inter', size: 11 }, color: '#475569', boxWidth: 12, padding: 12 }
          }
        }
      }
    });
  }

  /* Fund Distribution (line) */
  const ctxFund = document.getElementById('chartFund');
  if (ctxFund) {
    new Chart(ctxFund, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Raised',
            data: [42000, 58000, 71000, 65000, 88000, 95000, 85000, 92000, 110000, 130000, 158000, 175000],
            borderColor: '#4F8CFF',
            backgroundColor: 'rgba(79,140,255,.08)',
            fill: true,
            tension: 0.45,
            pointRadius: 3,
            pointBackgroundColor: '#4F8CFF'
          },
          {
            label: 'Spent',
            data: [38000, 52000, 68000, 60000, 80000, 88000, 77000, 85000, 98000, 118000, 140000, 155000],
            borderColor: '#2ECC71',
            backgroundColor: 'rgba(46,204,113,.07)',
            fill: true,
            tension: 0.45,
            pointRadius: 3,
            pointBackgroundColor: '#2ECC71'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { font: { family: 'Inter', size: 11 }, color: '#475569', boxWidth: 12 }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(0,0,0,.05)' },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#94A3B8',
              callback: v => '₹' + (v >= 1000 ? Math.round(v/1000) + 'K' : v)
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8' }
          }
        }
      }
    });
  }

  /* Program Success (bar) */
  const ctxProg = document.getElementById('chartProgram');
  if (ctxProg) {
    new Chart(ctxProg, {
      type: 'bar',
      data: {
        labels: ['Nutrition', 'Healthcare', 'Education', 'Water'],
        datasets: [{
          label: 'Success %',
          data: [88, 94, 91, 79],
          backgroundColor: ['rgba(79,140,255,.75)', 'rgba(46,204,113,.75)', 'rgba(255,107,157,.75)', 'rgba(14,165,233,.75)'],
          borderRadius: 8,
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(0,0,0,.05)' },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8', callback: v => v + '%' }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8' }
          }
        }
      }
    });
  }
}

/* ── Settings Toggles ────────────────────────────────────────*/
function initSettings() {
  const form = document.getElementById('settingsForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Settings saved successfully!', 'success');
  });
}

/* ── Table Search ────────────────────────────────────────────*/
function initTableSearch() {
  const ds = document.getElementById('donorSearch');
  ds?.addEventListener('input', () => {
    const q = ds.value.toLowerCase();
    renderDonorsTable(DONORS_TABLE.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      d.status.toLowerCase().includes(q)
    ));
  });

  const cs = document.getElementById('campaignSearch');
  cs?.addEventListener('input', () => {
    const q = cs.value.toLowerCase();
    renderCampaignsTable(CAMPAIGNS_TABLE.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    ));
  });

  const bs = document.getElementById('beneSearch');
  bs?.addEventListener('input', () => {
    const q = bs.value.toLowerCase();
    renderBeneficiariesTable(BENEFICIARIES_TABLE.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q) ||
      b.status.toLowerCase().includes(q)
    ));
  });
}

/* ── DOMContentLoaded ────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  /* Auth guard */
  const session = JSON.parse(localStorage.getItem('hoperise_session') || 'null');
  if (!session || session.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  loadUserInfo(session);
  loadStats();
  renderDonorsTable(DONORS_TABLE);
  renderCampaignsTable(CAMPAIGNS_TABLE);
  renderBeneficiariesTable(BENEFICIARIES_TABLE);
  renderActivityFeed();

  initSidebar();
  initLogout();
  initSettings();
  initTableSearch();

  /* Charts load after short delay to ensure canvas is visible */
  setTimeout(initCharts, 200);
});

/* ── Globals ─────────────────────────────────────────────────*/
window.showToast = showToast;
