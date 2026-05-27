/* ============================================================
   HopeRise Foundation — Auth JavaScript
   ============================================================ */
'use strict';

const USERS_KEY   = 'hoperise_users';
const SESSION_KEY = 'hoperise_session';

/* ── Seed Default Users ─────────────────────────────────────── */
const DEFAULT_USERS = [
  {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    email: 'admin@hoperise.org',
    password: 'Admin@123',
    role: 'admin',
    joinDate: '2024-01-15',
    avatar: 'AU'
  },
  {
    id: 2,
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'donor@example.com',
    password: 'Donor@123',
    role: 'donor',
    joinDate: '2024-03-10',
    avatar: 'JD',
    totalDonated: 25000,
    campaignsSupported: 8,
    livesImpacted: 320,
    monthlyContribution: 2500
  }
];

function seedUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* ── Toast ──────────────────────────────────────────────────── */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info} toast-icon"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── Password Visibility ──────────────────────────────────────*/
function initPwToggle() {
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.form-ctrl-wrap')?.querySelector('.form-ctrl');
      if (!input) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.querySelector('i').className = `fas ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
    });
  });
}

/* ── Password Strength ───────────────────────────────────────*/
function checkStrength(password) {
  let score = 0;
  if (password.length >= 8)  score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  if (score <= 1) return { level: 'weak',   label: 'Weak',   bars: 1 };
  if (score === 2) return { level: 'fair',   label: 'Fair',   bars: 2 };
  if (score === 3) return { level: 'good',   label: 'Good',   bars: 3 };
  return                    { level: 'strong', label: 'Strong', bars: 4 };
}

function initPwStrength() {
  const pwInput   = document.getElementById('signupPassword');
  const bars      = document.querySelectorAll('.pw-bar');
  const labelEl   = document.querySelector('.pw-strength-label');
  if (!pwInput || !bars.length) return;

  pwInput.addEventListener('input', () => {
    const val = pwInput.value;
    if (!val) {
      bars.forEach(b => { b.className = 'pw-bar'; });
      if (labelEl) { labelEl.textContent = ''; labelEl.className = 'pw-strength-label'; }
      return;
    }
    const result = checkStrength(val);
    bars.forEach((b, i) => {
      b.className = `pw-bar${i < result.bars ? ' ' + result.level : ''}`;
    });
    if (labelEl) {
      labelEl.textContent = result.label;
      labelEl.className   = `pw-strength-label ${result.level}`;
    }
  });
}

/* ── Role Tabs (Login) ───────────────────────────────────────*/
function initRoleTabs() {
  const tabs = document.querySelectorAll('.role-tab');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

function getSelectedRole() {
  const active = document.querySelector('.role-tab.active');
  return active ? active.dataset.role : 'donor';
}

/* ── Role Selector (Signup) ──────────────────────────────────*/
function initRoleSelector() {
  const cards = document.querySelectorAll('.role-card');
  if (!cards.length) return;
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const hidden = document.getElementById('selectedRole');
      if (hidden) hidden.value = card.dataset.role;
    });
  });
}

/* ── Validation Helpers ──────────────────────────────────────*/
function showErr(id, msg) {
  const errEl = document.getElementById(id);
  if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
  const inputId = id.replace('Err', '');
  const input = document.getElementById(inputId);
  if (input) input.classList.add('is-error');
}

function clearErr(id) {
  const errEl = document.getElementById(id);
  if (errEl) { errEl.textContent = ''; errEl.classList.remove('show'); }
  const inputId = id.replace('Err', '');
  const input = document.getElementById(inputId);
  if (input) { input.classList.remove('is-error'); }
}

function clearAllErrors() {
  document.querySelectorAll('.form-err').forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
  document.querySelectorAll('.form-ctrl').forEach(el => {
    el.classList.remove('is-error', 'is-ok');
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── LOGIN ───────────────────────────────────────────────────*/
function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  initPwToggle();
  initRoleTabs();

  /* Remember me — pre-fill */
  const remembered = localStorage.getItem('hoperise_remember');
  if (remembered) {
    const data = JSON.parse(remembered);
    const emailEl = document.getElementById('loginEmail');
    const remEl   = document.getElementById('rememberMe');
    if (emailEl) emailEl.value   = data.email;
    if (remEl)   remEl.checked   = true;
  }

  /* Clear errors on input */
  form.querySelectorAll('.form-ctrl').forEach(el => {
    el.addEventListener('input', () => clearErr(el.id + 'Err'));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearAllErrors();

    const email    = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const remember = document.getElementById('rememberMe')?.checked;
    const role     = getSelectedRole();

    let valid = true;

    if (!email) {
      showErr('loginEmailErr', 'Email is required.');
      valid = false;
    } else if (!validateEmail(email)) {
      showErr('loginEmailErr', 'Enter a valid email address.');
      valid = false;
    }

    if (!password) {
      showErr('loginPasswordErr', 'Password is required.');
      valid = false;
    }

    if (!valid) return;

    /* Set loading */
    const btn = form.querySelector('.btn-auth-primary');
    btn.classList.add('loading');

    setTimeout(() => {
      /* Accept any valid email + any password — derive name from email local part */
      const localPart = email.split('@')[0];
      const nameParts = localPart.replace(/[._\-]/g, ' ').trim().split(' ');
      const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
      const lastName  = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : '';
      const avatar    = firstName[0].toUpperCase() + (lastName ? lastName[0].toUpperCase() : firstName[1]?.toUpperCase() || 'U');

      /* Check if this email was previously registered (to keep their data) */
      const users    = getUsers();
      const existing = users.find(u => u.email === email);

      const user = existing || {
        id: Date.now(),
        firstName,
        lastName,
        username: localPart,
        email,
        password,
        role,
        joinDate: new Date().toISOString().split('T')[0],
        avatar,
        totalDonated: 21500,
        campaignsSupported: 8,
        livesImpacted: 320,
        monthlyContribution: 2500
      };

      /* If existing user, honour their stored role; otherwise use selected tab */
      user.role = existing ? existing.role : role;

      /* Save if new */
      if (!existing) {
        users.push(user);
        saveUsers(users);
      }

      /* Remember me */
      if (remember) {
        localStorage.setItem('hoperise_remember', JSON.stringify({ email }));
      } else {
        localStorage.removeItem('hoperise_remember');
      }

      setSession(user);
      showToast(`Welcome, ${user.firstName}! Redirecting…`, 'success');

      setTimeout(() => {
        window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'donor-dashboard.html';
      }, 1200);
    }, 900);
  });

  /* Social login — redirect to 404 (not yet implemented) */
  document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = '404.html';
    });
  });
}

/* ── Forgot Password ─────────────────────────────────────────*/
function initForgotPassword() {
  const modal    = document.getElementById('forgotModal');
  const openBtn  = document.getElementById('forgotLink');
  const closeBtn = document.getElementById('forgotClose');
  const form     = document.getElementById('forgotForm');

  if (!modal) return;

  openBtn?.addEventListener('click', () => modal.classList.add('open'));
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));

  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail')?.value.trim();
    if (!email || !validateEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    modal.classList.remove('open');
    showToast('Reset link sent! Check your inbox.', 'success', 4000);
    form.reset();
  });
}

/* ── SIGNUP ──────────────────────────────────────────────────*/
function initSignupPage() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  initPwToggle();
  initPwStrength();
  initRoleSelector();

  form.querySelectorAll('.form-ctrl').forEach(el => {
    el.addEventListener('input', () => clearErr(el.id + 'Err'));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearAllErrors();

    const firstName = document.getElementById('firstName')?.value.trim();
    const lastName  = document.getElementById('lastName')?.value.trim();
    const username  = document.getElementById('username')?.value.trim();
    const email     = document.getElementById('signupEmail')?.value.trim();
    const password  = document.getElementById('signupPassword')?.value;
    const confirm   = document.getElementById('confirmPassword')?.value;
    const role      = document.getElementById('selectedRole')?.value || 'donor';
    const terms     = document.getElementById('agreeTerms')?.checked;

    let valid = true;

    if (!firstName) { showErr('firstNameErr', 'First name is required.'); valid = false; }
    if (!lastName)  { showErr('lastNameErr',  'Last name is required.'); valid = false; }
    if (!username)  { showErr('usernameErr',  'Username is required.'); valid = false; }
    if (username && username.length < 3) { showErr('usernameErr', 'Username must be at least 3 characters.'); valid = false; }

    if (!email) {
      showErr('signupEmailErr', 'Email is required.');
      valid = false;
    } else if (!validateEmail(email)) {
      showErr('signupEmailErr', 'Enter a valid email address.');
      valid = false;
    }

    if (!password) {
      showErr('signupPasswordErr', 'Password is required.');
      valid = false;
    } else if (password.length < 6) {
      showErr('signupPasswordErr', 'Password must be at least 6 characters.');
      valid = false;
    }

    if (password && confirm !== password) {
      showErr('confirmPasswordErr', 'Passwords do not match.');
      valid = false;
    }

    if (!terms) {
      showToast('Please agree to the Terms of Service.', 'error');
      valid = false;
    }

    if (!valid) return;

    const users = getUsers();
    if (users.find(u => u.email === email)) {
      showErr('signupEmailErr', 'An account with this email already exists.');
      return;
    }
    if (users.find(u => u.username === username)) {
      showErr('usernameErr', 'Username is already taken.');
      return;
    }

    const btn = form.querySelector('.btn-auth-primary');
    btn.classList.add('loading');

    setTimeout(() => {
      const newUser = {
        id: Date.now(),
        firstName,
        lastName,
        username,
        email,
        password,
        role,
        joinDate: new Date().toISOString().split('T')[0],
        avatar: firstName[0].toUpperCase() + lastName[0].toUpperCase(),
        totalDonated: 0,
        campaignsSupported: 0,
        livesImpacted: 0,
        monthlyContribution: 0
      };

      users.push(newUser);
      saveUsers(users);

      btn.classList.remove('loading');

      /* Show success */
      form.style.display = 'none';
      const success = document.getElementById('successScreen');
      if (success) success.classList.add('show');

      showToast('Account created successfully!', 'success');

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2500);
    }, 1000);
  });

  /* Social signup — redirect to 404 (not yet implemented) */
  document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = '404.html';
    });
  });
}

/* ── Auth Guard (for dashboards) ─────────────────────────────*/
function requireAuth(role) {
  const session = getSession();
  if (!session || session.role !== role) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

/* ── Logout ──────────────────────────────────────────────────*/
function logout() {
  clearSession();
  showToast('You have been logged out.', 'info');
  setTimeout(() => { window.location.href = 'login.html'; }, 800);
}

/* ── Init ────────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  seedUsers();

  const page = window.location.pathname.split('/').pop() || '';

  if (page === 'login.html' || page === '') {
    initLoginPage();
    initForgotPassword();
  }

  if (page === 'signup.html') {
    initSignupPage();
  }
});

/* ── Globals ─────────────────────────────────────────────────*/
window.requireAuth  = requireAuth;
window.logout       = logout;
window.showToast    = showToast;
window.getSession   = getSession;
window.clearSession = clearSession;
