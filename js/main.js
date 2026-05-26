/* ============================================================
   HopeRise Foundation — Main JavaScript
   ============================================================ */
'use strict';

// ── Page Loader ──────────────────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hide');
      setTimeout(() => loader.remove(), 500);
    }, 1000);
  }
});

// ── Navbar ───────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link
  const links = navbar.querySelectorAll('.nav-link');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && (href === path || (path === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  // Mobile menu
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('navMobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('.nav-link, .btn').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

// ── Scroll Reveal ─────────────────────────────────────────────
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
}

// ── Animated Counters ────────────────────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = target * ease;

    if (target >= 1000000) {
      el.textContent = prefix + (value / 1000000).toFixed(1) + 'M' + suffix.replace('+','') + (suffix.includes('+') ? '+' : '');
    } else if (target >= 1000) {
      el.textContent = prefix + Math.floor(value).toLocaleString() + suffix;
    } else if (Number.isInteger(target)) {
      el.textContent = prefix + Math.floor(value) + suffix;
    } else {
      el.textContent = prefix + value.toFixed(1) + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (target >= 1000000) {
        el.textContent = prefix + (target / 1000000).toFixed(1) + 'M' + (suffix.includes('+') ? '+' : '');
      } else {
        el.textContent = prefix + (Number.isInteger(target) ? target.toLocaleString() : target) + suffix;
      }
    }
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-counter]').forEach(el => obs.observe(el));
}

// ── Progress Bars ────────────────────────────────────────────
function initProgressBars() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fill = e.target.querySelector('.progress-fill');
        if (fill) fill.style.width = (fill.dataset.width || '0') + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.progress-bar').forEach(bar => obs.observe(bar));
}

// ── Scroll to Top ─────────────────────────────────────────────
function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Toast ─────────────────────────────────────────────────────
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
    toast.style.transform = 'translateX(-40px)';
    toast.style.transition = 'all .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Newsletter ────────────────────────────────────────────────
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Thank you for subscribing! Welcome to the HopeRise community.', 'success');
      form.reset();
    } else {
      showToast('Please enter a valid email address.', 'error');
    }
  });
}

// ── Smooth Section Links ──────────────────────────────────────
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ── Partners Track ────────────────────────────────────────────
function initPartnersTrack() {
  const track = document.querySelector('.partners-track');
  if (!track) return;
  track.innerHTML += track.innerHTML;
}

// ── Amount Selector ───────────────────────────────────────────
function initAmountSelector() {
  document.querySelectorAll('.amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ── Payment Methods ───────────────────────────────────────────
function initPaymentMethods() {
  document.querySelectorAll('.pay-method').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ── Role Selector ─────────────────────────────────────────────
function initRoleSelector() {
  document.querySelectorAll('.role-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.role-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const roleInput = document.getElementById('selectedRole');
      if (roleInput) roleInput.value = opt.dataset.role || '';
    });
  });
}

// ── Login Tabs ────────────────────────────────────────────────
function initLoginTabs() {
  document.querySelectorAll('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.login-panel').forEach(p => {
        p.style.display = p.id === target ? 'block' : 'none';
      });
    });
  });
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
  if (e.target.classList.contains('modal-close')) e.target.closest('.modal-overlay')?.classList.remove('open');
});

// ── Sidebar (Dashboard) ───────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const main = document.getElementById('dashMain');
  if (!sidebar) return;
  if (window.innerWidth >= 992) {
    sidebar.classList.toggle('collapsed');
    if (main) main.classList.toggle('sidebar-collapsed');
  } else {
    sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('active');
  }
}
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (overlay) overlay.classList.remove('active');
}
function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.add('mobile-open');
  if (overlay) overlay.classList.add('active');
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initReveal();
  initCounters();
  initProgressBars();
  initScrollTop();
  initNewsletter();
  initSmoothLinks();
  initPartnersTrack();
  initAmountSelector();
  initPaymentMethods();
  initRoleSelector();
  initLoginTabs();
});

// ── Globals ───────────────────────────────────────────────────
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.openSidebar = openSidebar;
