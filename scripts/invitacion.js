/* ═══════════════════════════════════════════════════
   INVITACION.JS — Lógica principal
   Bautizo de Daniel De Angel Rosales · 25 Abril 2026
   ═══════════════════════════════════════════════════ */

/* ─── CONFIGURACIÓN ─────────────────────────────── */
const CONFIG = {
  eventDate:      new Date(2026, 3, 25, 10, 0, 0),
  whatsappNumber: '522482406624',
  mapUrls: {
    misa:      'https://maps.google.com/maps?q=19.26819198361658,-98.38267078623882&z=17&output=embed',
    recepcion: 'https://maps.google.com/maps?q=19.270454989668,-98.38424258092742&z=17&output=embed'
  },
  babyName: 'Daniel De Angel Rosales'
};

/* ─── MODO DE PRUEBA ────────────────────────────── */
/* Pon false antes de publicar el día del evento     */
const TEST_MODE = true;

/* ─── REFERENCIAS DOM ───────────────────────────── */
const darkModeToggle = document.getElementById('darkModeToggle');
const rsvpForm       = document.getElementById('rsvpForm');
const rsvpSuccess    = document.getElementById('rsvpSuccess');
const photosLocked   = document.getElementById('photosLocked');
const photosUnlocked = document.getElementById('photosUnlocked');
const mapModal       = document.getElementById('mapModal');
const mapFrame       = document.getElementById('mapFrame');
const particlesEl    = document.getElementById('particles');
const music          = document.getElementById('music');

/* ═══════════════════════════════════════════════════
   🎵 AUTOPLAY DE MÚSICA
   Intenta reproducir al cargar; si el navegador lo
   bloquea, arranca en el primer gesto del usuario.
   ═══════════════════════════════════════════════════ */
(function initAutoplay() {
  if (!music) return;
  music.volume = 0.7;
  const p = music.play();
  if (p !== undefined) {
    p.catch(() => {
      const start = () => {
        music.play().catch(() => {});
        ['click','touchstart','keydown','scroll'].forEach(ev =>
          document.removeEventListener(ev, start));
      };
      ['click','touchstart','keydown','scroll'].forEach(ev =>
        document.addEventListener(ev, start, { once: true, passive: true }));
    });
  }
})();

/* ═══════════════════════════════════════════════════
   LIGHTBOX — declarado PRIMERO para que todo lo que
   llame a addPhotoToGallery pueda usarlo sin error
   ═══════════════════════════════════════════════════ */
const LB = {
  photos:  [],
  current: 0,
  el:      null,
  img:     null,
  counter: null,
  startX:  0,
};

function initLightbox() {
  if (document.getElementById('lightbox')) return;
  const lb = document.createElement('div');
  lb.id        = 'lightbox';
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lb-close" id="lbClose">✕</button>
    <div class="lightbox-img-wrap">
      <button class="lb-arrow left"  id="lbPrev">&#8592;</button>
      <img id="lbImg" src="" alt="Foto del bautizo" />
      <button class="lb-arrow right" id="lbNext">&#8594;</button>
    </div>
    <div class="lb-counter" id="lbCounter"></div>
  `;
  document.body.appendChild(lb);
  LB.el      = lb;
  LB.img     = document.getElementById('lbImg');
  LB.counter = document.getElementById('lbCounter');

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => moveLightbox(-1));
  document.getElementById('lbNext').addEventListener('click', () => moveLightbox(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  moveLightbox(-1);
    if (e.key === 'ArrowRight') moveLightbox(1);
    if (e.key === 'Escape')     closeLightbox();
  });

  lb.addEventListener('touchstart', e => { LB.startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend',   e => {
    const diff = LB.startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) moveLightbox(diff > 0 ? 1 : -1);
  });
}

function openLightbox(index) {
  initLightbox();
  LB.current = index;
  updateLightboxImg();
  LB.el.classList.add('active');
  document.body.classList.add('lb-open');
}

function closeLightbox() {
  if (LB.el) LB.el.classList.remove('active');
  document.body.classList.remove('lb-open');
}

function moveLightbox(dir) {
  LB.current = (LB.current + dir + LB.photos.length) % LB.photos.length;
  updateLightboxImg();
}

function updateLightboxImg() {
  const p = LB.photos[LB.current];
  if (!p) return;
  LB.img.src = p.url;
  LB.counter.textContent = `${LB.current + 1} / ${LB.photos.length}`;
}

/* ═══════════════════════════════════════════════════
   AÑADIR FOTO A LA GALERÍA
   ═══════════════════════════════════════════════════ */
function addPhotoToGallery(url, publicId) {
  const gallery = document.getElementById('photosGallery');
  const emptyEl = document.getElementById('galleryEmpty');
  if (emptyEl) emptyEl.remove();

  /* Evitar duplicados */
  if (gallery.querySelector(`[data-pid="${publicId}"]`)) return;

  /* Registrar en el array del lightbox */
  LB.photos.unshift({ url, publicId });

  const item = document.createElement('div');
  item.className   = 'gallery-item scroll-fade';
  item.dataset.pid = publicId;

  const img   = document.createElement('img');
  img.src     = url;
  img.alt     = `Foto del bautizo de ${CONFIG.babyName}`;
  img.loading = 'lazy';
  img.addEventListener('error', () => { img.src = url; }); /* retry en móvil */
  item.appendChild(img);

  item.addEventListener('click', () => {
    const idx = LB.photos.findIndex(p => p.publicId === publicId);
    openLightbox(idx >= 0 ? idx : 0);
  });

  gallery.prepend(item);
  setTimeout(() => item.classList.add('visible'), 50);
}

/* ═══════════════════════════════════════════════════
   MODO OSCURO / CLARO
   ═══════════════════════════════════════════════════ */
const prefersDark  = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme   = localStorage.getItem('bautizo-daniel-theme');
const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initialTheme);

darkModeToggle.addEventListener('click', () => {
  const cur  = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('bautizo-daniel-theme', next);
  darkModeToggle.style.transition = 'transform .4s ease';
  darkModeToggle.style.transform  = 'scale(.8) rotate(360deg)';
  setTimeout(() => darkModeToggle.style.transform = '', 430);
  createRippleEffect(darkModeToggle);
});

window.addEventListener('scroll', () => {
  darkModeToggle.classList.toggle('scrolled', window.scrollY > 200);
});

function createRippleEffect(el) {
  const r = el.getBoundingClientRect();
  const d = document.createElement('div');
  Object.assign(d.style, {
    position:'fixed',
    left:`${r.left + r.width/2}px`, top:`${r.top + r.height/2}px`,
    width:'0', height:'0', borderRadius:'50%',
    background:'rgba(232,184,109,.22)',
    transform:'translate(-50%,-50%)',
    pointerEvents:'none', zIndex:'999',
    transition:'all .8s ease-out'
  });
  document.body.appendChild(d);
  setTimeout(() => { d.style.width = d.style.height = '1000px'; d.style.opacity = '0'; }, 10);
  setTimeout(() => d.remove(), 830);
}

/* ═══════════════════════════════════════════════════
   CONTADOR REGRESIVO PRINCIPAL
   ═══════════════════════════════════════════════════ */
function updateCountdown() {
  const diff = CONFIG.eventDate.getTime() - Date.now();

  if (diff <= 0) {
    const sub = document.querySelector('.section-subtitle');
    if (sub) sub.textContent = '¡El gran día llegó! 🎉';
    ['days','hours','minutes','seconds'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '0';
    });
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff %  3600000) / 60000);
  const s = Math.floor((diff %    60000) / 1000);

  animateNumber('days', d);
  animateNumber('hours', h);
  animateNumber('minutes', m);
  animateNumber('seconds', s);
}

function animateNumber(id, val) {
  const el = document.getElementById(id);
  if (!el || parseInt(el.textContent) === val) return;
  el.style.transform = 'scale(1.3)';
  el.textContent = val;
  setTimeout(() => el.style.transform = '', 300);
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* ═══════════════════════════════════════════════════
   GALERÍA — BLOQUEO / DESBLOQUEO
   ═══════════════════════════════════════════════════ */
function checkPhotoAccess() {
  const diff = CONFIG.eventDate.getTime() - Date.now();

  if (diff <= 0 || TEST_MODE) {
    photosLocked.classList.add('hidden');
    photosUnlocked.classList.remove('hidden');
    if (TEST_MODE) loadTestPhotos();
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff %  3600000) / 60000);
  const s = Math.floor((diff %    60000) / 1000);

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('pDays', d); set('pHours', h); set('pMinutes', m); set('pSeconds', s);
}

setInterval(checkPhotoAccess, 1000);
checkPhotoAccess();

function TEST_unlockGallery() {
  photosLocked.classList.add('hidden');
  photosUnlocked.classList.remove('hidden');
  loadTestPhotos();
}

function loadTestPhotos() {
  const galleryEmpty = document.getElementById('galleryEmpty');
  if (!galleryEmpty) return;

  const testPhotos = [
    { url: 'imagenes/foto1.jpg', id: 'local-1' },
    { url: 'imagenes/foto2.jpg', id: 'local-2' },
    { url: 'imagenes/foto3.jpg', id: 'local-3' },
    { url: 'imagenes/foto4.jpg', id: 'local-4' },
    { url: 'imagenes/foto5.jpg', id: 'local-5' },
    { url: 'imagenes/foto6.jpg', id: 'local-6' },
  ];

  galleryEmpty.remove();
  testPhotos.forEach(({ url, id }) => addPhotoToGallery(url, id));
  console.log('%c6 fotos locales cargadas', 'color:#7ba7d8;font-size:13px');
}

/* ═══════════════════════════════════════════════════
   CLOUDINARY — SUBIDA DE FOTOS
   ═══════════════════════════════════════════════════ */
function openPhotoUpload() {
  if (typeof CLOUDINARY_CONFIG === 'undefined') {
    alert('⚙️ Cloudinary no está configurado.\nEdita models/cloudinary-config.js');
    return;
  }
  if (typeof cloudinary === 'undefined') {
    alert('⚙️ El script de Cloudinary no está cargado. Verifica tu conexión.');
    return;
  }

  const widget = cloudinary.createUploadWidget(
    {
      cloudName:    CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
      folder:       `bautizo-${CONFIG.babyName.toLowerCase().replace(/\s+/g,'-')}`,
      sources:      ['local', 'camera'],
      multiple:     true,
      maxFiles:     10,
      clientAllowedFormats: ['jpg','jpeg','png','webp','heic'],
      maxFileSize:  12000000,
      showSkipCropButton: true,
      styles: {
        palette: {
          window:          '#F0F6FF',
          windowBorder:    '#E8B86D',
          tabIcon:         '#7BA7D8',
          menuIcons:       '#5A7898',
          textDark:        '#2D4870',
          textLight:       '#FFFFFF',
          link:            '#4A6FA5',
          action:          '#E8B86D',
          inactiveTabIcon: '#AAC8EE',
          error:           '#F44336',
          inProgress:      '#7BA7D8',
          complete:        '#4CAF50',
          sourceBg:        '#FAFCFF'
        }
      }
    },
    (error, result) => {
      if (error) { console.error('❌ Cloudinary error:', error); return; }
      if (result?.event === 'success') {
        const { secure_url, public_id } = result.info;
        addPhotoToGallery(secure_url, public_id);
        if (typeof savePhotoToFirebase === 'function') {
          savePhotoToFirebase(secure_url, public_id);
        }
      }
    }
  );
  widget.open();
}

/* ═══════════════════════════════════════════════════
   MAPAS — MODAL AMPLIADO
   ═══════════════════════════════════════════════════ */
function openLocationModal(type) {
  mapFrame.src = CONFIG.mapUrls[type] || '';
  mapModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLocationModal() {
  mapModal.classList.add('hidden');
  mapFrame.src = '';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLocationModal();
});

/* ═══════════════════════════════════════════════════
   RSVP → WhatsApp
   ═══════════════════════════════════════════════════ */
rsvpForm.addEventListener('submit', e => {
  e.preventDefault();
  const nombre   = document.getElementById('guestName').value.trim();
  const cantidad = document.getElementById('guestCount').value;

  if (!nombre || !cantidad) { alert('Por favor completa todos los campos.'); return; }

  const msg = encodeURIComponent(
    `¡Hola! \n\n` +
    `Confirmo mi asistencia al bautizo de *${CONFIG.babyName}* \n\n` +
    `Mi nombre es: ${nombre}\n` +
    `Seremos ${cantidad} personas.\n\n` +
    `¡Nos vemos el 25 de abril! `
  );
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`, '_blank');

  setTimeout(() => {
    rsvpForm.style.display = 'none';
    rsvpSuccess.classList.remove('hidden');
    rsvpSuccess.scrollIntoView({ behavior:'smooth', block:'center' });
    createConfetti();
  }, 500);
});

document.querySelectorAll('.form-group input, .form-group select').forEach(input => {
  ['blur','input'].forEach(ev =>
    input.addEventListener(ev, () => {
      const g = input.closest('.form-group');
      if (input.value.trim() && input.checkValidity()) {
        g.classList.add('valid');   g.classList.remove('invalid');
      } else if (input.value.trim()) {
        g.classList.add('invalid'); g.classList.remove('valid');
      } else {
        g.classList.remove('valid','invalid');
      }
    })
  );
});

/* ═══════════════════════════════════════════════════
   CONFETI
   ═══════════════════════════════════════════════════ */
function createConfetti() {
  const colors = ['#e8b86d','#7ba7d8','#f5d49a','#d0c4f0','#f4c2d4','#b8e8d8','#aac8ee'];
  for (let i = 0; i < 90; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      const s = Math.random() * 10 + 5;
      Object.assign(c.style, {
        position:'fixed', width:`${s}px`, height:`${s}px`,
        background: colors[Math.floor(Math.random()*colors.length)],
        left:`${Math.random()*window.innerWidth}px`, top:'-20px',
        borderRadius: Math.random() > .5 ? '50%' : '2px',
        zIndex:'9999', pointerEvents:'none',
        transform:`rotate(${Math.random()*360}deg)`,
      });
      document.body.appendChild(c);
      const dur = Math.random()*3+2;
      c.animate([
        { transform:`translate(0,0) rotate(0deg) scale(1)`, opacity:1 },
        { transform:`translate(${(Math.random()-.5)*300}px,${window.innerHeight+100}px) rotate(${Math.random()*720}deg) scale(.4)`, opacity:0 }
      ], { duration:dur*1000, easing:'cubic-bezier(.25,.46,.45,.94)' });
      setTimeout(() => c.remove(), dur*1000);
    }, i*28);
  }
}

/* ═══════════════════════════════════════════════════
   SCROLL ANIMATIONS
   ═══════════════════════════════════════════════════ */
function initScrollAnimations() {
  const els = document.querySelectorAll('.scroll-fade');

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('visible');
    } else {
      obs.observe(el);
    }
  });
}
initScrollAnimations();

window.addEventListener('scroll', () => {
  document.querySelectorAll('.scroll-fade:not(.visible)').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 40) {
      el.classList.add('visible');
    }
  });
}, { passive: true });

/* ═══════════════════════════════════════════════════
   EFECTO 3D EN TARJETAS
   ═══════════════════════════════════════════════════ */
document.querySelectorAll('.card-3d').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top)  - r.height/2) / 18;
    const ry = ((r.width/2) - (e.clientX - r.left)) / 18;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(12px) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)';
  });
});

/* ═══════════════════════════════════════════════════
   PARTÍCULAS FLOTANTES
   ═══════════════════════════════════════════════════ */
const pCtx = particlesEl.getContext('2d');

function resizeCanvas() {
  particlesEl.width  = window.innerWidth;
  particlesEl.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const PARTICLE_COLORS = [
  [232,184,109],[170,200,238],[208,196,240],[244,194,212],[184,232,216],
];

class Particle {
  constructor() { this.reset(true); }
  reset(init) {
    this.x       = Math.random() * particlesEl.width;
    this.y       = init ? Math.random() * particlesEl.height : particlesEl.height + 10;
    this.size    = Math.random() * 2.3 + .5;
    this.speedY  = -(Math.random() * .6 + .2);
    this.speedX  = (Math.random() - .5) * .3;
    this.opacity = Math.random() * .55 + .2;
    this.rgb     = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
  }
  update() {
    this.y += this.speedY; this.x += this.speedX;
    if (this.y < -10) this.reset(false);
    if (this.x < 0 || this.x > particlesEl.width) this.x = Math.random() * particlesEl.width;
  }
  draw() {
    const [r,g,b] = this.rgb;
    const color   = `rgba(${r},${g},${b},${this.opacity})`;
    pCtx.save();
    pCtx.fillStyle = color; pCtx.shadowBlur = 6; pCtx.shadowColor = color;
    pCtx.beginPath(); pCtx.arc(this.x, this.y, this.size, 0, Math.PI*2); pCtx.fill();
    pCtx.fillStyle = `rgba(255,255,255,${this.opacity*.4})`;
    pCtx.beginPath(); pCtx.arc(this.x, this.y, this.size*.4, 0, Math.PI*2); pCtx.fill();
    pCtx.restore();
  }
}

const pArr = Array.from({ length: window.innerWidth < 768 ? 50 : 100 }, () => new Particle());
(function animP() {
  pCtx.clearRect(0,0,particlesEl.width,particlesEl.height);
  pArr.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animP);
})();

/* ─── Protección de imágenes ─────────────────────── */
document.addEventListener('contextmenu', e => { if (e.target.tagName==='IMG') e.preventDefault(); });
document.addEventListener('dragstart',   e => { if (e.target.tagName==='IMG') e.preventDefault(); });

/* ─── Consola ────────────────────────────────────── */
console.log('%c Bautizo de Daniel De Angel Rosales', 'color:#e8b86d;font-size:20px;font-weight:bold');
console.log('%c✦ 25 de Abril · 2026', 'color:#7ba7d8;font-size:14px');
console.log(
  TEST_MODE ? '%cModo prueba ACTIVO — pon TEST_MODE=false antes de publicar'
            : '%cInvitación lista para producción',
  TEST_MODE ? 'color:#f44336;font-size:12px' : 'color:#4caf50;font-size:12px'
);