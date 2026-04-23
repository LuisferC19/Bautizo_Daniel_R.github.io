/* ═══════════════════════════════════════════════════════════
   FIREBASE-CONFIG.JS
   Galería de fotos en tiempo real — Bautizo de Daniel
   ═══════════════════════════════════════════════════════════

   ⚠️  IMPORTANTE — Por qué NO usamos "import { initializeApp }"
   ──────────────────────────────────────────────────────────────
   Firebase ofrece dos formas de usarse:
     A) ES Modules (import/export) → requiere bundler (Vite, Webpack)
     B) Compat scripts (los <script> en el HTML) → funciona directo
        en el navegador sin ninguna herramienta extra ✅

   Este proyecto usa la versión B (compat), que es la que ya
   tienes cargada en invitacion.html con estos dos scripts:
     <script src=".../firebase-app-compat.js"></script>
     <script src=".../firebase-firestore-compat.js"></script>

   Por eso aquí usamos  firebase.initializeApp()  y  firebase.firestore()
   en lugar de los imports — ambas APIs hacen exactamente lo mismo.
   ═══════════════════════════════════════════════════════════ */

/* ─── Datos reales de tu proyecto Firebase ───────────────── */
const firebaseConfig = {
  apiKey:            "AIzaSyD8VNJzL7GhYZJ3hbUlXgKf-WOTdo5aDPA",
  authDomain:        "bautizo-daniel-2026-ea250.firebaseapp.com",
  projectId:         "bautizo-daniel-2026-ea250",
  storageBucket:     "bautizo-daniel-2026-ea250.firebasestorage.app",
  messagingSenderId: "683605274408",
  appId:             "1:683605274408:web:6527f5c463661f4e9cea1d"
};

/* ─── Nombre de la colección en Firestore ────────────────────
   Es el "nombre de tabla" donde se guardan las fotos.
   Si lo cambias aquí, cámbialo también en las reglas de
   Firestore en la consola de Firebase.
─────────────────────────────────────────────────────────────── */
const FIRESTORE_COLLECTION = 'fotos-bautizo-daniel';

/* ─── Variable global de la base de datos ────────────────── */
let db = null;

/* ═══════════════════════════════════════════════════════════
   INICIALIZACIÓN
   ═══════════════════════════════════════════════════════════ */
(function initFirebase() {

  /* Verificar que los scripts compat estén cargados en el HTML */
  if (typeof firebase === 'undefined') {
    console.error(
      '❌ Firebase SDK no cargado.\n' +
      'Asegúrate de que invitacion.html tenga estos dos scripts ANTES de firebase-config.js:\n' +
      '  <script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js"></script>\n' +
      '  <script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js"></script>'
    );
    return;
  }

  try {
    /* Evitar doble inicialización si la página recarga parcialmente */
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    db = firebase.firestore();

    console.log(
      `%c✅ Firebase OK — Proyecto: ${firebaseConfig.projectId}`,
      'color:#4caf50; font-size:12px;'
    );

    /* Cargar fotos ya subidas al abrir la página */
    loadPhotosFromFirebase();

    /* Escuchar fotos nuevas en tiempo real */
    listenForNewPhotos();

  } catch (err) {
    console.error('❌ Error al inicializar Firebase:', err.message);
  }

})();

/* ═══════════════════════════════════════════════════════════
   GUARDAR FOTO EN FIRESTORE
   Llamada automáticamente desde invitacion.js
   después de que Cloudinary sube la imagen con éxito.
   ═══════════════════════════════════════════════════════════ */
async function savePhotoToFirebase(secureUrl, publicId) {
  if (!db) {
    console.warn('⚠️  Firebase no disponible — la foto se muestra solo localmente.');
    return;
  }

  try {
    await db.collection(FIRESTORE_COLLECTION).add({
      url:       secureUrl,   // URL pública de Cloudinary
      publicId:  publicId,    // ID interno de Cloudinary (para evitar duplicados)
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      event:     'bautizo-daniel-2026'
    });
    console.log('%c📸 Foto guardada en Firestore:', 'color:#7ba7d8;', publicId);
  } catch (err) {
    console.error('❌ Error al guardar foto en Firestore:', err.message);
  }
}

/* ═══════════════════════════════════════════════════════════
   CARGAR FOTOS EXISTENTES AL ABRIR LA PÁGINA
   Trae las últimas 60 fotos ordenadas de más nueva a más vieja.
   ═══════════════════════════════════════════════════════════ */
async function loadPhotosFromFirebase() {
  if (!db) return;

  try {
    const snap = await db
      .collection(FIRESTORE_COLLECTION)
      .where('event', '==', 'bautizo-daniel-2026')
      .orderBy('timestamp', 'desc')
      .limit(60)
      .get();

    snap.forEach(doc => {
      const d = doc.data();
      if (d.url && d.publicId && typeof addPhotoToGallery === 'function') {
        addPhotoToGallery(d.url, d.publicId);
      }
    });

    console.log(
      `%c📷 ${snap.size} foto(s) cargada(s) desde Firestore`,
      'color:#7ba7d8; font-size:12px;'
    );

  } catch (err) {
    /* ── Error más común: falta el índice compuesto ──────────
       Firebase mostrará en esta consola un enlace azul.
       Haz click en él → se crea el índice en ~2 minutos → listo.
       Solo se hace una vez en la vida del proyecto.
    ─────────────────────────────────────────────────────────── */
    if (err.code === 'failed-precondition') {
      console.warn(
        '%c⚠️  Firestore necesita un índice compuesto.\n' +
        'Busca el enlace azul arriba en esta consola y haz click en él.\n' +
        'El índice se crea en ~2 minutos y solo se hace una vez.',
        'color:#e8b86d; font-size:12px;'
      );
    } else {
      console.error('❌ Error al cargar fotos:', err.message);
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   ESCUCHAR FOTOS NUEVAS EN TIEMPO REAL
   Cuando alguien sube una foto, aparece en todas las pantallas
   abiertas sin necesidad de recargar la página.
   ═══════════════════════════════════════════════════════════ */
function listenForNewPhotos() {
  if (!db) return;

  /* Solo escuchamos fotos que lleguen A PARTIR de este momento
     (no volvemos a mostrar las que ya cargó loadPhotosFromFirebase) */
  const startTime = firebase.firestore.Timestamp.now();

  db.collection(FIRESTORE_COLLECTION)
    .where('event', '==', 'bautizo-daniel-2026')
    .where('timestamp', '>', startTime)
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const d = change.doc.data();
          if (d.url && d.publicId && typeof addPhotoToGallery === 'function') {
            addPhotoToGallery(d.url, d.publicId);
            console.log('%c🆕 Nueva foto recibida en tiempo real', 'color:#4caf50; font-size:12px;');
          }
        }
      });
    }, err => {
      console.error('❌ Error en listener de Firestore:', err.message);
    });
}