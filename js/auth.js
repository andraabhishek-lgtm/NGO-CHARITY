/* ============================================================
   HopeRise Foundation — Authentication (Demo Mode)
   ============================================================ */

'use strict';

const DEMO_USERS = [
  { id: 1, name: 'Admin User',      email: 'admin@hoperise.org',   password: 'admin123',  role: 'admin',   avatar: 'AU' },
  { id: 2, name: 'Dr. Priya Singh', email: 'doctor@hoperise.org',  password: 'doctor123', role: 'doctor',  avatar: 'PS' },
  { id: 3, name: 'Rahul Kumar',     email: 'patient@hoperise.org', password: 'patient123',role: 'patient', avatar: 'RK' },
  { id: 4, name: 'Arjun Reddy',     email: 'donor@hoperise.org',   password: 'donor123',  role: 'donor',   avatar: 'AR' }
];

const ROLE_DASHBOARDS = {
  admin:   'dashboards/admin.html',
  doctor:  'dashboards/doctor.html',
  patient: 'dashboards/patient.html',
  donor:   'dashboard.html'
};

/* ── Built-in toast (no dependency on main.js) ── */
function authToast(message, type) {
  var existing = typeof showToast === 'function' ? showToast : null;
  if (existing) { existing(message, type); return; }

  var container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:10px;min-width:300px;';
    document.body.appendChild(container);
  }
  var colors = { success: '#a3e635', error: '#ef4444', info: '#06b6d4' };
  var icons  = { success: '✓', error: '✕', info: 'ℹ' };
  var color  = colors[type] || colors.info;
  var toast  = document.createElement('div');
  toast.style.cssText = 'display:flex;align-items:center;gap:10px;padding:12px 18px;background:#1a1a26;border-radius:10px;font-size:14px;font-weight:600;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.4);border-left:4px solid ' + color + ';';
  toast.innerHTML = '<span style="color:' + color + ';font-size:16px;">' + (icons[type] || icons.info) + '</span><span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(function() {
    toast.style.transition = 'opacity .3s';
    toast.style.opacity = '0';
    setTimeout(function() { toast.remove(); }, 350);
  }, 3000);
}

/* ── Session helpers ── */
function saveSession(user) {
  try {
    var safe = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
    sessionStorage.setItem('hr-user', JSON.stringify(safe));
  } catch(e) {}
}

function getSession() {
  try { return JSON.parse(sessionStorage.getItem('hr-user') || 'null'); }
  catch(e) { return null; }
}

function logout() {
  try { sessionStorage.removeItem('hr-user'); } catch(e) {}
  window.location.href = 'login.html';
}

/* ── Login ── */
function handleLogin(e) {
  if (e) e.preventDefault();

  var emailEl = document.getElementById('loginEmail');
  var passEl  = document.getElementById('loginPassword');
  if (!emailEl || !passEl) return;

  var email    = emailEl.value.trim().toLowerCase();
  var password = passEl.value;
  var roleEl   = document.querySelector('#loginRoles .role-tab.active');
  var selRole  = roleEl ? roleEl.dataset.role : '';

  if (!email || !password) {
    authToast('Please enter your email and password.', 'error');
    return;
  }

  var btn = document.querySelector('#loginForm .btn-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

  setTimeout(function() {
    var user = null;
    for (var i = 0; i < DEMO_USERS.length; i++) {
      if (DEMO_USERS[i].email.toLowerCase() === email && DEMO_USERS[i].password === password) {
        user = DEMO_USERS[i]; break;
      }
    }

    if (!user) {
      authToast('Invalid email or password. Use a demo account below.', 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-sign-in-alt"></i>&nbsp;&nbsp;SIGN IN'; }
      return;
    }

    if (selRole && user.role !== selRole) {
      authToast('Select the "' + user.role + '" role tab and try again.', 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-sign-in-alt"></i>&nbsp;&nbsp;SIGN IN'; }
      return;
    }

    saveSession(user);
    authToast('Welcome back, ' + user.name.split(' ')[0] + '! Opening dashboard…', 'success');
    setTimeout(function() {
      window.location.href = ROLE_DASHBOARDS[user.role] || 'index.html';
    }, 900);
  }, 500);
}

/* ── Register ── */
function handleRegister(e) {
  if (e) e.preventDefault();

  var name     = (document.getElementById('regName')    ? document.getElementById('regName').value    : '').trim();
  var email    = (document.getElementById('regEmail')   ? document.getElementById('regEmail').value   : '').trim().toLowerCase();
  var password = (document.getElementById('regPassword')? document.getElementById('regPassword').value: '');
  var confirm  = (document.getElementById('regConfirm') ? document.getElementById('regConfirm').value : '');
  var roleEl   = document.querySelector('#regRoles .role-tab.active');
  var role     = roleEl ? roleEl.dataset.role : 'donor';

  if (!name || !email || !password || !confirm) {
    authToast('Please fill in all required fields.', 'error'); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    authToast('Please enter a valid email address.', 'error'); return;
  }
  if (password.length < 6) {
    authToast('Password must be at least 6 characters.', 'error'); return;
  }
  if (password !== confirm) {
    authToast('Passwords do not match.', 'error'); return;
  }
  for (var i = 0; i < DEMO_USERS.length; i++) {
    if (DEMO_USERS[i].email === email) {
      authToast('This email is already registered. Please sign in.', 'error'); return;
    }
  }

  var btn = document.querySelector('#registerForm .btn-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }

  setTimeout(function() {
    var initials = name.split(' ').map(function(n){ return n[0]; }).join('').toUpperCase().slice(0, 2);
    var newUser  = { id: Date.now(), name: name, email: email, role: role, avatar: initials };
    saveSession(newUser);
    authToast('Account created! Welcome, ' + name.split(' ')[0] + '!', 'success');
    setTimeout(function() {
      window.location.href = ROLE_DASHBOARDS[role] || 'index.html';
    }, 900);
  }, 500);
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', function() {
  var loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  var regForm = document.getElementById('registerForm');
  if (regForm) regForm.addEventListener('submit', handleRegister);

  document.querySelectorAll('[data-logout]').forEach(function(btn) {
    btn.addEventListener('click', function(e) { e.preventDefault(); logout(); });
  });
});

window.logout     = logout;
window.getSession = getSession;
