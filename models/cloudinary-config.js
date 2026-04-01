/* ═══════════════════════════════════════════════════════════
   CLOUDINARY-CONFIG.JS
   Configuración para subida de fotos del bautizo de Daniel
   ═══════════════════════════════════════════════════════════ */

const CLOUDINARY_CONFIG = {

  /* ─── TUS DATOS DE CLOUDINARY ──────────────────────────── */
  cloudName:    'dhqdix4fi',
  uploadPreset: 'bautizo_fotos',

  /* ─── CARPETA donde se guardarán las fotos ─────────────── */
  folder: 'bautizo-daniel',

  /* ─── TRANSFORMACIONES para miniaturas en galería ──────── */
  thumbnailTransform: 'c_fill,w_400,h_400,q_auto,f_auto',

  /* ─── Helpers para generar URLs ────────────────────────── */
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
  /* Solo bloquea si los valores están vacíos o son literalmente 'TU_CLOUD_NAME' */
  const placeholders = ['TU_CLOUD_NAME', 'TU_UPLOAD_PRESET', '', undefined, null];

  if (
    placeholders.includes(CLOUDINARY_CONFIG.cloudName) ||
    placeholders.includes(CLOUDINARY_CONFIG.uploadPreset)
  ) {
    console.warn(
      '%c⚠️  Cloudinary no configurado.\n' +
      'Abre models/cloudinary-config.js y reemplaza\n' +
      'TU_CLOUD_NAME y TU_UPLOAD_PRESET con tus datos reales.',
      'color:#e8b86d; font-size:12px; background:#1a0a00; padding:4px;'
    );
  } else {
    console.log(
      `%c✅ Cloudinary OK — Cloud: ${CLOUDINARY_CONFIG.cloudName} | Preset: ${CLOUDINARY_CONFIG.uploadPreset}`,
      'color:#4caf50; font-size:12px;'
    );
  }
})();