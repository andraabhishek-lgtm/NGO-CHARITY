/* ============================================================
   HealHope Foundation — Donation Logic
   ============================================================ */

'use strict';

// ── Multi-step donation form state ───────────────────────────
const donationState = {
  step: 1,
  amount: 0,
  frequency: 'one-time',
  purpose: '',
  donor: {},
  paymentMethod: '',
  receiptId: ''
};

// ── Step Navigation ──────────────────────────────────────────
function goToStep(step) {
  document.querySelectorAll('.donate-step').forEach((el, i) => {
    el.style.display = i + 1 === step ? 'block' : 'none';
  });

  document.querySelectorAll('.step-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i + 1 === step);
    dot.classList.toggle('done', i + 1 < step);
    dot.textContent = i + 1 < step ? '✓' : i + 1;
  });

  document.querySelectorAll('.step-line').forEach((line, i) => {
    line.classList.toggle('done', i + 1 < step);
  });

  donationState.step = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
  const current = donationState.step;

  if (current === 1) {
    // Validate amount
    const active = document.querySelector('.amount-btn.active');
    const custom = document.getElementById('customAmount');
    let amount = 0;

    if (active && active.dataset.amount !== 'custom') {
      amount = parseInt(active.dataset.amount) || 0;
    } else if (custom && custom.value) {
      amount = parseInt(custom.value) || 0;
    }

    if (!amount || amount < 10) {
      showToast('Please select or enter a donation amount (minimum ₹10).', 'error');
      return;
    }
    donationState.amount = amount;
    donationState.purpose = document.getElementById('donationPurpose')?.value || 'General Fund';
    updateSummary();
  }

  if (current === 2) {
    // Validate donor info
    const required = ['donorName', 'donorEmail', 'donorPhone'];
    let valid = true;
    required.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value.trim()) {
        el.classList.add('error');
        const err = el.parentElement.querySelector('.form-error');
        if (err) { err.textContent = 'This field is required.'; err.style.display = 'block'; }
        valid = false;
      }
    });
    if (!valid) { showToast('Please fill in all required fields.', 'error'); return; }

    const emailEl = document.getElementById('donorEmail');
    if (emailEl && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('error');
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    donationState.donor = {
      name: document.getElementById('donorName')?.value || '',
      email: document.getElementById('donorEmail')?.value || '',
      phone: document.getElementById('donorPhone')?.value || '',
      address: document.getElementById('donorAddress')?.value || '',
      message: document.getElementById('donorMessage')?.value || ''
    };
    updateSummary();
  }

  if (current === 3) {
    const activeMethod = document.querySelector('.pay-method.active');
    if (!activeMethod) { showToast('Please select a payment method.', 'error'); return; }
    donationState.paymentMethod = activeMethod.dataset.method || '';
  }

  if (current < 4) goToStep(current + 1);
}

function prevStep() {
  if (donationState.step > 1) goToStep(donationState.step - 1);
}

// ── Update Summary Panel ──────────────────────────────────────
function updateSummary() {
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('sumAmount', '₹' + donationState.amount.toLocaleString());
  setEl('sumPurpose', donationState.purpose || '—');
  setEl('sumFrequency', donationState.frequency === 'monthly' ? 'Monthly' : 'One-time');
  setEl('sumName', donationState.donor.name || '—');
  setEl('sumEmail', donationState.donor.email || '—');
  setEl('sumPhone', donationState.donor.phone || '—');
  setEl('sumMethod', donationState.paymentMethod || '—');
}

// ── Process Donation ──────────────────────────────────────────
function processDonation() {
  const btn = document.getElementById('donateSubmitBtn');
  if (!btn) return;

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  // Simulate payment processing
  setTimeout(() => {
    donationState.receiptId = generateReceiptId();
    saveDonationToStorage();
    showReceiptModal();
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-heart"></i> Donate Now';
  }, 2000);
}

function generateReceiptId() {
  return 'HHF-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
}

// ── Save to LocalStorage ──────────────────────────────────────
function saveDonationToStorage() {
  const donations = JSON.parse(localStorage.getItem('hh-donations') || '[]');
  donations.unshift({
    id: donationState.receiptId,
    date: new Date().toISOString(),
    amount: donationState.amount,
    purpose: donationState.purpose,
    frequency: donationState.frequency,
    donor: donationState.donor,
    method: donationState.paymentMethod,
    status: 'completed'
  });
  localStorage.setItem('hh-donations', JSON.stringify(donations));
}

// ── Show Receipt Modal ────────────────────────────────────────
function showReceiptModal() {
  const modal = document.getElementById('receiptModal');
  if (!modal) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('rcptId', donationState.receiptId);
  setEl('rcptDate', dateStr);
  setEl('rcptName', donationState.donor.name);
  setEl('rcptEmail', donationState.donor.email);
  setEl('rcptAmount', '₹' + donationState.amount.toLocaleString());
  setEl('rcptPurpose', donationState.purpose);
  setEl('rcptMethod', donationState.paymentMethod);

  modal.classList.add('open');
  goToStep(1);
  document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
}

// ── Download Receipt ──────────────────────────────────────────
function downloadReceipt() {
  const receiptData = `
HealHope Foundation
Official Donation Receipt
==========================================
Receipt ID  : ${donationState.receiptId}
Date        : ${new Date().toLocaleDateString('en-IN')}
------------------------------------------
Donor Name  : ${donationState.donor.name}
Email       : ${donationState.donor.email}
Phone       : ${donationState.donor.phone}
------------------------------------------
Amount      : ₹${donationState.amount.toLocaleString()}
Purpose     : ${donationState.purpose}
Frequency   : ${donationState.frequency}
Method      : ${donationState.paymentMethod}
Status      : CONFIRMED
==========================================
Thank you for your generous donation!
Your contribution helps save children's lives.

HealHope Foundation
support@healhope.org | +91 98765 43210
www.healhopefoundation.org
==========================================
  `.trim();

  const blob = new Blob([receiptData], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `receipt-${donationState.receiptId}.txt`;
  a.click();
  showToast('Receipt downloaded successfully!', 'success');
}

// ── Frequency Toggle ──────────────────────────────────────────
function setFrequency(freq) {
  donationState.frequency = freq;
  document.querySelectorAll('.freq-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.freq === freq);
  });
}

// ── Init Donation Page ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.donate-step')) return;

  goToStep(1);

  document.getElementById('customAmount')?.addEventListener('input', () => {
    updateDonateTotal();
    updateSummary();
  });

  document.querySelectorAll('.freq-btn').forEach(btn => {
    btn.addEventListener('click', () => setFrequency(btn.dataset.freq));
  });
});

// ── Expose globals ─────────────────────────────────────────────
window.nextStep = nextStep;
window.prevStep = prevStep;
window.processDonation = processDonation;
window.downloadReceipt = downloadReceipt;
window.setFrequency = setFrequency;
window.updateDonateTotal = updateDonateTotal;
