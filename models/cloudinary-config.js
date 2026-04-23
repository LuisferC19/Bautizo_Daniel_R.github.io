/* ═══════════════════════════════════════════════════════════
   CLOUDINARY-CONFIG.JS
   Configuración para subida de fotos del bautizo de Daniel
   ═══════════════════════════════════════════════════════════ */

const CLOUDINARY_CONFIG = {

  cloudName:    'dhqdix4fi',
  uploadPreset: 'bautizo_fotos',
  folder:       'bautizo-daniel',

  thumbnailTransform: 'c_fill,w_400,h_400,q_auto,f_auto',

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
  /* Solo marcamos como inválido si están vacíos o son undefined */
  const invalidos = ['', undefined, null];

  if (
    invalidos.includes(CLOUDINARY_CONFIG.cloudName) ||
    invalidos.includes(CLOUDINARY_CONFIG.uploadPreset)
  ) {
    console.warn('⚠️  Cloudinary: cloudName o uploadPreset están vacíos.');
  } else {
    console.log(
      `%c✅ Cloudinary OK — Cloud: ${CLOUDINARY_CONFIG.cloudName} | Preset: ${CLOUDINARY_CONFIG.uploadPreset}`,
      'color:#4caf50; font-size:12px;'
    );
  }
})();