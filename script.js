// NAVBAR SCROLL
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// MOBILE MENU
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.overlay');
const closeMenu = document.querySelector('.close-menu');

function openMenu() { mobileMenu.classList.add('active'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeMenuFn() { mobileMenu.classList.remove('active'); overlay.classList.remove('active'); document.body.style.overflow = ''; }

mobileToggle.addEventListener('click', openMenu);
closeMenu.addEventListener('click', closeMenuFn);
overlay.addEventListener('click', closeMenuFn);
document.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', closeMenuFn));

// SCROLL ANIMATIONS
const fadeEls = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
fadeEls.forEach(el => observer.observe(el));

// COUNTER ANIMATION
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    let current = 0;
    const increment = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = current.toLocaleString() + suffix;
    }, 25);
  });
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { animateCounters(); statsObserver.unobserve(entry.target); }
  });
}, { threshold: 0.3 });

const statsSection = document.querySelector('.hero-stats');
if (statsSection) statsObserver.observe(statsSection);

// BRANDS CAROUSEL DUPLICATE
const brandsTrack = document.querySelector('.brands-track');
if (brandsTrack) {
  const items = brandsTrack.innerHTML;
  brandsTrack.innerHTML += items;
}

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// WHATSAPP HANDLER
function openWhatsApp(phone, name) {
  const message = encodeURIComponent(`Halo ${name}, saya tertarik dengan produk Lion Automotive Part. Bisa dibantu?`);
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}
