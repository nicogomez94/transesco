const slides = [...document.querySelectorAll('.hero-slide')];
const tabs = [...document.querySelectorAll('.slide-tab')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeSlide = 0;
let slideTimer;

function restartProgress() {
  tabs.forEach((tab) => {
    const bar = tab.querySelector('i');
    if (!bar) return;
    bar.style.animation = 'none';
    void bar.offsetWidth;
    bar.style.animation = '';
  });
}

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => {
    const selected = position === activeSlide;
    if (!selected) slide.classList.remove('initial-motion');
    slide.classList.toggle('is-active', selected);
    slide.setAttribute('aria-hidden', String(!selected));
    slide.querySelectorAll('a').forEach((link) => { link.tabIndex = selected ? 0 : -1; });
  });
  tabs.forEach((tab, position) => {
    const selected = position === activeSlide;
    tab.classList.toggle('is-active', selected);
    if (selected) tab.setAttribute('aria-current', 'true');
    else tab.removeAttribute('aria-current');
  });
  restartProgress();
  resetSlideTimer();
}

function resetSlideTimer() {
  window.clearInterval(slideTimer);
  if (!reducedMotion.matches && !document.hidden) {
    slideTimer = window.setInterval(() => showSlide(activeSlide + 1), 7000);
  }
}

tabs.forEach((tab, index) => tab.addEventListener('click', () => showSlide(index)));
document.querySelector('.slide-prev').addEventListener('click', () => showSlide(activeSlide - 1));
document.querySelector('.slide-next').addEventListener('click', () => showSlide(activeSlide + 1));
document.addEventListener('visibilitychange', resetSlideTimer);
reducedMotion.addEventListener('change', resetSlideTimer);
showSlide(0);

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? interfaceText[window.currentLanguage].menuClose : interfaceText[window.currentLanguage].menuOpen);
});
nav.querySelector('[data-about-link]').addEventListener('click', (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  window.location.assign('/quienes-somos.html');
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', interfaceText[window.currentLanguage].menuOpen);
}));

const contactForm = document.querySelector('#contact-form');
const formStatus = contactForm.querySelector('.form-status');
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const labels = interfaceText[window.currentLanguage];
  const name = contactForm.elements.name.value.trim();
  const email = contactForm.elements.email.value.trim();
  const message = contactForm.elements.message.value.trim();
  formStatus.classList.remove('is-error');

  if (!name || !email || !message) {
    formStatus.textContent = labels.missing;
    formStatus.classList.add('is-error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formStatus.textContent = labels.email;
    formStatus.classList.add('is-error');
    return;
  }

  const inquiry = `${labels.message}\n${labels.name}: ${name}\n${labels.emailLabel}: ${email}\n\n${message}`;
  const whatsapp = window.open(`https://wa.me/5491133042528?text=${encodeURIComponent(inquiry)}`, '_blank');
  if (whatsapp) {
    whatsapp.opener = null;
    formStatus.textContent = labels.opened;
    contactForm.reset();
  } else {
    formStatus.textContent = labels.blocked;
    formStatus.classList.add('is-error');
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const heroObserver = new IntersectionObserver(([entry]) => {
  document.body.classList.toggle('on-hero', entry.isIntersecting);
}, { threshold: 0.35 });
heroObserver.observe(document.querySelector('.hero'));

if (window.matchMedia('(pointer: fine)').matches && !reducedMotion.matches) {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let pointerX = -100;
  let pointerY = -100;
  let ringX = -100;
  let ringY = -100;
  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    dot.style.left = `${pointerX}px`;
    dot.style.top = `${pointerY}px`;
  }, { passive: true });
  function animateRing() {
    ringX += (pointerX - ringX) * 0.18;
    ringY += (pointerY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  animateRing();
  document.querySelectorAll('a, button').forEach((element) => {
    element.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
    element.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();
