/* ═══════════════════════════════════════════════════════════
   CLOUDINARY-CONFIG.JS
   Configuración para subida de fotos del bautizo de Daniel
   ═══════════════════════════════════════════════════════════

   ¿CÓMO OBTENER ESTOS DATOS?
   1. Ve a https://cloudinary.com y crea una cuenta gratuita
   2. En tu Dashboard verás el "Cloud name" — cópialo en cloudName
   3. Para el uploadPreset:
      Settings (ícono de engrane) → Upload → "Upload presets"
      → Add upload preset
      · Signing Mode: UNSIGNED  ← obligatorio para web sin backend
      · Folder: bautizo-daniel  (opcional pero recomendado)
      · Guarda y copia el nombre del preset abajo
   ═══════════════════════════════════════════════════════════ */

const CLOUDINARY_CONFIG = {

  /* ─── ✏️  REEMPLAZA CON TU CLOUD NAME ─────────────────────
     Cloudinary.com → Dashboard → "Cloud name" (arriba a la izq.)
     Ejemplo: si ves  Cloud name: mi-nube-abc123
              escribe cloudName: 'mi-nube-abc123'
  ──────────────────────────────────────────────────────────── */
  cloudName: 'dhqdix4fi',         // 👈 Ej: 'mi-nube-abc123'

  /* ─── ✏️  REEMPLAZA CON TU UPLOAD PRESET ──────────────────
     Settings → Upload → Upload presets → nombre que le diste
     DEBE ser tipo UNSIGNED para funcionar en el navegador
  ──────────────────────────────────────────────────────────── */
  uploadPreset: 'bautizo_fotos',   // 👈 Ej: 'bautizo_fotos'

  /* ─── Carpeta donde se guardarán las fotos ─────────────── */
  folder: 'bautizo-daniel',

  /* ─── Transformaciones para miniaturas en galería ─────── */
  thumbnailTransform: 'c_fill,w_400,h_400,q_auto,f_auto',

  /* ─── Helpers para generar URLs (no modificar) ──────────── */
  get baseUrl() {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload`;
  },
  thumbnailUrl(publicId) {
    return `${this.baseUrl}/${this.thumbnailTransform}/${publicId}`;
  },
  fullUrl(publicId) {
    return `${this.baseUrl}/q_auto,f_auto/${publicId}`;
  }

};

/* ─── Verificación al cargar ─────────────────────────────── */
(function verifyCloudinaryConfig() {
  const placeholders = ['dhqdix4fi', 'bautizo_fotos', '', undefined, null];

  if (
    placeholders.includes(CLOUDINARY_CONFIG.cloudName) ||
    placeholders.includes(CLOUDINARY_CONFIG.uploadPreset)
  ) {
    console.warn(
      '%c⚠️  Cloudinary no configurado.\n' +
      'Abre models/cloudinary-config.js y reemplaza\n' +
      'dhqdix4fi y bautizo_fotos con tus datos reales.',
      'color:#e8b86d; font-size:12px; background:#1a0a00; padding:4px;'
    );
  } else {
    console.log(
      `%c✅ Cloudinary OK — Cloud: ${CLOUDINARY_CONFIG.cloudName} | Preset: ${CLOUDINARY_CONFIG.uploadPreset}`,
      'color:#4caf50; font-size:12px;'
    );
  }
})();
