
/* ─── Referencias DOM ────────────────────────── */
const envelope     = document.getElementById('envelope');
const scene        = document.getElementById('envelopeScene');
const overlay      = document.getElementById('pageOverlay');
const particlesEl  = document.getElementById('particles');

/* ─── Guard de apertura ───────────────────────── */
let opened = false;

/* ══════════════════════════════════════════════
   APERTURA DEL SOBRE
   ══════════════════════════════════════════════ */
envelope.addEventListener('click', () => {
  if (opened) return;
  opened = true;

  /* 1. Abrir solapa */
  scene.classList.add('opening');

  /* 2. Hacer volar el sobre */
  setTimeout(() => scene.classList.add('flying'), 1450);

  /* 3. Fade de transición */
  setTimeout(() => overlay.classList.add('fade-in'), 2250);

  /* 4. Redirigir a la invitación */
  setTimeout(() => {
    window.location.href = 'invitacion.html';
  }, 3000);
});

/* ══════════════════════════════════════════════
   PARTÍCULAS DORADAS Y PLATEADAS
   ══════════════════════════════════════════════ */
const ctx = particlesEl.getContext('2d');

function resizeCanvas() {
  particlesEl.width  = window.innerWidth;
  particlesEl.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(true); }

  reset(initial) {
    this.x       = Math.random() * particlesEl.width;
    this.y       = initial
      ? Math.random() * particlesEl.height
      : particlesEl.height + 10;
    this.size    = Math.random() * 2.5 + .6;
    this.speedY  = -(Math.random() * .7 + .25);
    this.speedX  = (Math.random() - .5) * .35;
    this.opacity = Math.random() * .65 + .2;
    this.isGold  = Math.random() > .45;
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    if (this.y < -10) this.reset(false);
    if (this.x < 0 || this.x > particlesEl.width) {
      this.x = Math.random() * particlesEl.width;
    }
  }

  draw() {
    const color = this.isGold
      ? `rgba(201,168,76,${this.opacity})`
      : `rgba(184,200,216,${this.opacity * .65})`;

    ctx.save();
    ctx.fillStyle   = color;
    ctx.shadowBlur  = 7;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    /* Brillo interior */
    ctx.fillStyle = `rgba(255,255,255,${this.opacity * .45})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * .38, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const PARTICLE_COUNT = window.innerWidth < 768 ? 55 : 115;
const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

(function animateParticles() {
  ctx.clearRect(0, 0, particlesEl.width, particlesEl.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
})();

/* ══════════════════════════════════════════════
   CURSOR POINTER EXPLÍCITO
   ══════════════════════════════════════════════ */
envelope.style.cursor = 'pointer';

/* ══════════════════════════════════════════════
   CONSOLA DE BIENVENIDA
   ══════════════════════════════════════════════ */
console.log(
  '%c Mi bautizo de Daniel De angel Rosales ',
  'color:#c9a84c; font-size:20px; font-weight:bold'
);
console.log(
  '%c✦ Sobre cargado correctamente',
  'color:#3a6ec7; font-size:13px'
);
