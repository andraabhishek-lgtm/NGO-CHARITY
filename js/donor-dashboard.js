/* ============================================================
   HopeRise Foundation — Donor Dashboard JavaScript
   ============================================================ */
'use strict';

/* ── Mock Data ───────────────────────────────────────────────*/
const DONATIONS_DATA = [
  { id: 'DON-2024-001', amount: 5000,  date: '2024-11-15', campaign: 'Child Nutrition Drive',    status: 'Completed' },
  { id: 'DON-2024-002', amount: 2500,  date: '2024-10-22', campaign: 'Medical Aid Program',       status: 'Completed' },
  { id: 'DON-2024-003', amount: 7500,  date: '2024-09-10', campaign: 'Education for All',         status: 'Completed' },
  { id: 'DON-2024-004', amount: 1000,  date: '2024-08-05', campaign: 'Clean Water Initiative',    status: 'Completed' },
  { id: 'DON-2024-005', amount: 3000,  date: '2024-07-18', campaign: 'Emergency Relief Fund',     status: 'Completed' },
  { id: 'DON-2024-006', amount: 2500,  date: '2024-12-01', campaign: 'Child Nutrition Drive',     status: 'Processing' },
];

const CAMPAIGNS_DATA = [
  { id: 1, title: 'Child Nutrition Drive',  category: 'Nutrition',   raised: 187500, goal: 250000, pct: 75, days: 18, img: '🍎' },
  { id: 2, title: 'Medical Aid Program',    category: 'Healthcare',  raised: 92000,  goal: 150000, pct: 61, days: 32, img: '🏥' },
  { id: 3, title: 'Education for All',      category: 'Education',   raised: 215000, goal: 300000, pct: 72, days: 45, img: '📚' },
  { id: 4, title: 'Clean Water Initiative', category: 'Environment', raised: 44000,  goal: 100000, pct: 44, days: 60, img: '💧' },
];

const CERTIFICATES_DATA = [
  { id: 1, name: 'Gold Donor Certificate', campaign: 'Child Nutrition Drive', date: 'Nov 15, 2024', icon: '🏆', level: 'Gold' },
  { id: 2, name: 'Silver Donor Certificate', campaign: 'Medical Aid Program', date: 'Oct 22, 2024', icon: '🥈', level: 'Silver' },
  { id: 3, name: 'Impact Maker Award', campaign: 'Education for All', date: 'Sep 10, 2024', icon: '⭐', level: 'Platinum' },
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

/* ── Sidebar Navigation ──────────────────────────────────────*/
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
  const nameEls   = document.querySelectorAll('[data-user-name]');
  const avatarEls = document.querySelectorAll('[data-user-avatar]');
  const roleEls   = document.querySelectorAll('[data-user-role]');
  const emailEls  = document.querySelectorAll('[data-user-email]');

  nameEls.forEach(el   => { el.textContent = `${user.firstName} ${user.lastName}`; });
  avatarEls.forEach(el => { el.textContent = user.avatar || (user.firstName[0] + user.lastName[0]).toUpperCase(); });
  roleEls.forEach(el   => { el.textContent = 'Donor'; });
  emailEls.forEach(el  => { el.textContent = user.email; });

  const welcomeEl = document.getElementById('welcomeName');
  if (welcomeEl) welcomeEl.textContent = user.firstName;
}

/* ── Stats Cards ─────────────────────────────────────────────*/
function loadStats(user) {
  const map = {
    'statTotalDonated':        `₹${(user.totalDonated || 21500).toLocaleString('en-IN')}`,
    'statCampaigns':            user.campaignsSupported || 8,
    'statLives':               (user.livesImpacted || 320).toLocaleString(),
    'statMonthly':             `₹${(user.monthlyContribution || 2500).toLocaleString('en-IN')}`
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

/* ── Donation History Table ──────────────────────────────────*/
function renderDonationTable(data) {
  const tbody = document.getElementById('donationTableBody');
  if (!tbody) return;

  const statusBadge = s => {
    const cls = s === 'Completed' ? 'badge-success' : s === 'Processing' ? 'badge-warning' : 'badge-danger';
    return `<span class="badge ${cls}">${s}</span>`;
  };

  tbody.innerHTML = data.map(d => `
    <tr>
      <td><span style="font-family:var(--font-display);font-weight:700;font-size:.8rem;color:var(--primary)">${d.id}</span></td>
      <td><strong>₹${d.amount.toLocaleString('en-IN')}</strong></td>
      <td>${d.date}</td>
      <td>${d.campaign}</td>
      <td>${statusBadge(d.status)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="showToast('Receipt downloaded!','success')">
          <i class="fas fa-download"></i> Receipt
        </button>
      </td>
    </tr>
  `).join('');
}

/* ── Active Campaigns ────────────────────────────────────────*/
function renderCampaigns(data) {
  const container = document.getElementById('campaignList');
  if (!container) return;

  container.innerHTML = data.map(c => `
    <div class="campaign-item">
      <div class="ci-top">
        <div>
          <div class="ci-title">${c.img} ${c.title}</div>
          <div class="ci-cat">${c.category} • ${c.days} days left</div>
        </div>
        <span class="badge badge-info">${c.pct}%</span>
      </div>
      <div class="ci-amounts">
        <span class="ci-raised">₹${c.raised.toLocaleString('en-IN')} raised</span>
        <span class="ci-goal">of ₹${c.goal.toLocaleString('en-IN')}</span>
      </div>
      <div class="progress-wrap" style="height:8px">
        <div class="progress-fill" style="width:${c.pct}%"></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
        <span class="ci-pct">Goal: ${c.pct}% reached</span>
      </div>
      <div class="ci-actions">
        <button class="btn btn-primary btn-sm" onclick="showToast('Redirecting to donate…','info')">
          <i class="fas fa-heart"></i> Donate Again
        </button>
        <button class="btn btn-outline btn-sm" onclick="showToast('Campaign details coming soon!','info')">
          <i class="fas fa-info-circle"></i> Details
        </button>
      </div>
    </div>
  `).join('');
}

/* ── Certificates ────────────────────────────────────────────*/
function renderCertificates(data) {
  const container = document.getElementById('certGrid');
  if (!container) return;

  container.innerHTML = data.map(c => `
    <div class="cert-card">
      <span class="cert-icon">${c.icon}</span>
      <div class="cert-name">${c.name}</div>
      <div class="cert-campaign">${c.campaign}</div>
      <div class="cert-date">Issued: ${c.date}</div>
      <button class="btn btn-primary btn-sm" style="width:100%" onclick="showToast('Certificate downloaded!','success')">
        <i class="fas fa-download"></i> Download PDF
      </button>
    </div>
  `).join('');
}

/* ── Impact Counters ─────────────────────────────────────────*/
function animateNumber(el, target, suffix = '') {
  const duration = 1500;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(target * ease).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString() + suffix;
  }
  requestAnimationFrame(step);
}

function initImpactCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el     = e.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        animateNumber(el, target, suffix);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('[data-counter]').forEach(el => obs.observe(el));
}

/* ── Profile Form ────────────────────────────────────────────*/
function initProfileForm(user) {
  const firstName = document.getElementById('profileFirstName');
  const lastName  = document.getElementById('profileLastName');
  const email     = document.getElementById('profileEmail');
  const phone     = document.getElementById('profilePhone');

  if (firstName) firstName.value = user.firstName || '';
  if (lastName)  lastName.value  = user.lastName  || '';
  if (email)     email.value     = user.email      || '';
  if (phone)     phone.value     = user.phone      || '';

  const form = document.getElementById('profileForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Profile updated successfully!', 'success');
  });
}

/* ── Settings ────────────────────────────────────────────────*/
function initSettings() {
  const form = document.getElementById('settingsForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Settings saved!', 'success');
  });
}

/* ── Donation History search/filter ─────────────────────────*/
function initTableSearch() {
  const searchEl = document.getElementById('donationSearch');
  searchEl?.addEventListener('input', () => {
    const q = searchEl.value.toLowerCase();
    const filtered = DONATIONS_DATA.filter(d =>
      d.campaign.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.status.toLowerCase().includes(q)
    );
    renderDonationTable(filtered);
  });
}

/* ── DOMContentLoaded ────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  /* Auth guard */
  const session = JSON.parse(localStorage.getItem('hoperise_session') || 'null');
  if (!session || session.role !== 'donor') {
    window.location.href = 'login.html';
    return;
  }

  loadUserInfo(session);
  loadStats(session);
  renderDonationTable(DONATIONS_DATA);
  renderCampaigns(CAMPAIGNS_DATA);
  renderCertificates(CERTIFICATES_DATA);

  initSidebar();
  initLogout();
  initImpactCounters();
  initProfileForm(session);
  initSettings();
  initTableSearch();
});

/* ── Globals ─────────────────────────────────────────────────*/
window.showToast = showToast;
