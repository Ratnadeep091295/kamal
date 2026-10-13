'use strict';
/* =========================================================
   site.js — single script for every page.
   Merges the former locked-home.js (homepage) and refined.js
   (interior pages). The two form handlers target different
   selectors (data-email-form vs data-netlify) so they never
   both fire on one form.
   ========================================================= */
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.main-nav');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
function updateHeader() { header?.classList.toggle('scrolled', window.scrollY > 24); }
function setMenu(open, restoreFocus = false) {
  if (!menuButton || !nav) return;
  nav.classList.toggle('open', open);
  nav.inert = window.innerWidth <= 860 && !open;
  menuButton.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('menu-open', open);
  if (main) main.inert = open;
  if (footer) footer.inert = open;
  if (restoreFocus) menuButton.focus();
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
menuButton?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (!nav?.classList.contains('open')) return;
  if (event.key === 'Escape') { setMenu(false, true); return; }
  if (event.key !== 'Tab') return;
  const focusable = [menuButton, ...nav.querySelectorAll('a[href]')];
  const first = focusable[0], last = focusable.at(-1);
  if (event.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement))) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
});
window.addEventListener('resize', () => {
  setMenu(window.innerWidth <= 860 && Boolean(nav?.classList.contains('open')));
}, { passive: true });
setMenu(false);
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
const params = new URLSearchParams(location.search);
document.querySelectorAll('a[href]').forEach(a => {
  const raw = a.getAttribute('href');
  if (raw.startsWith('#') || /^(mailto:|tel:|https?:)/i.test(raw)) return;
  const url = new URL(raw, location.href);
  if (!url.pathname.endsWith('.html')) return;
  for (const key of ['type', 'layout']) {
    const value = params.get(key);
    if (key === 'type' && ['refined', 'industrial', 'editorial'].includes(value)) url.searchParams.set(key, value);
    if (key === 'layout' && ['rows', 'cards', 'feature'].includes(value)) url.searchParams.set(key, value);
  }
  a.setAttribute('href', url.pathname.split('/').at(-1) + url.search + url.hash);
});

/* Scroll-reveal (progressive; no-op when no .reveal elements exist). */
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

/* Email-draft forms (contact / careers / quote pages). */
const serviceNames = {"commercial-waste": "Construction & Demolition Waste", "aggregate": "Aggregates", "bulk": "Bulk Materials"};
document.querySelectorAll('form[data-email-form]').forEach(form => {
  const kind = form.dataset.emailForm;
  const category = serviceNames[params.get('service')];
  if (kind === 'quote' && category) {
    const serviceField = form.elements.namedItem('Service');
    if (serviceField) serviceField.value = category;
    else {
      const hidden = document.createElement('input');
      hidden.type = 'hidden'; hidden.name = 'Service'; hidden.value = category;
      form.append(hidden);
    }
  }
  const draftArea = document.createElement('div');
  draftArea.className = 'rf-form-draft'; draftArea.hidden = true;
  const draftLabel = document.createElement('label'); draftLabel.textContent = 'Your email draft';
  const draftText = document.createElement('textarea');
  draftText.readOnly = true; draftText.rows = 10; draftText.setAttribute('aria-label', 'Your email draft');
  draftLabel.append(draftText);
  const copy = document.createElement('button');
  copy.type = 'button'; copy.className = 'rf-link'; copy.textContent = 'Copy draft';
  draftArea.append(draftLabel, copy); form.append(draftArea);
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(draftText.value); copy.textContent = 'Draft copied'; }
    catch { draftText.focus(); draftText.select(); copy.textContent = 'Draft selected — copy with your keyboard'; }
  });
  form.addEventListener('submit', event => {
    event.preventDefault(); if (!form.reportValidity()) return;
    const recipient = form.dataset.recipient;
    const subjects = {quote: 'Transportation inquiry — Kamal Transport', careers: 'Career application — Kamal Transport', contact: 'General inquiry — Kamal Transport'};
    const subject = subjects[kind];
    const lines = [...new FormData(form).entries()].map(([key, value]) => `${key}: ${String(value).trim()}`).filter(line => !line.endsWith(': '));
    const body = `Hello Kamal Transport,\n\n${lines.join('\n\n')}\n\nThank you.`;
    draftText.value = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;
    draftArea.hidden = false;
    const status = form.querySelector('output'); status.hidden = false;
    status.textContent = `Your email draft is ready. Send it from your email app to ${recipient}${kind === 'careers' ? ' with your résumé attached' : ''}. If your app does not open, copy the draft below. Your request has not been sent yet.`;
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});

/* Netlify-style forms (fallback; corrected support number). */
document.querySelectorAll('form[data-netlify]').forEach(form => form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const successMessage = form.dataset.successMessage || 'Thank you. Your submission has been sent.';
  if (status) { status.textContent = 'Submitting…'; status.classList.add('show'); status.classList.remove('error'); }
  if (location.protocol === 'file:') {
    if (status) status.textContent = 'This form is complete and will submit when the site is published on its configured host.';
    return;
  }
  if (button) button.disabled = true;
  try {
    const response = await fetch(form.getAttribute('action') || '/', { method: 'POST', body: new FormData(form) });
    if (!response.ok) throw new Error('Submission failed');
    if (status) status.textContent = successMessage;
    form.reset();
  } catch (error) {
    if (status) {
      status.textContent = 'We could not send the form. Please call 1-888-664-3614 and our team will assist you.';
      status.classList.add('error');
    }
  } finally {
    if (button) button.disabled = false;
  }
}));
