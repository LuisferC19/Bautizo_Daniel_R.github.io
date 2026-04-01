/* ═══════════════════════════════════════════════════════════
   FIREBASE-CONFIG.JS
   Galería de fotos en tiempo real — Bautizo de Daniel
   ═══════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey:            "AIzaSyAlTriuaFBlLXGf-CeeRetkDw3XAl2_xhA",
  authDomain:        "bautizo-daniel-2026.firebaseapp.com",
  projectId:         "bautizo-daniel-2026",
  storageBucket:     "bautizo-daniel-2026.firebasestorage.app",
  messagingSenderId: "576481218435",
  appId:             "1:576481218435:web:b48b67626e0f2e95f530b6",
  measurementId:     "G-ZVVWNBVEME"
};

/* ─── Nombre de la colección en Firestore ────────────────── */
const FIRESTORE_COLLECTION = 'fotos-bautizo-daniel';

/* ─── Variable global de la base de datos ────────────────── */
let db = null;

/* ═══════════════════════════════════════════════════════════
   INICIALIZACIÓN DE FIREBASE
   ═══════════════════════════════════════════════════════════ */
(function initFirebase() {

  /* ── Verificar que Firebase SDK esté cargado ── */
  if (typeof firebase === 'undefined') {
    console.error(
      '❌ Firebase SDK no está cargado.\n' +
      'Verifica que los scripts de Firebase estén activos en invitacion.html.'
    );
    return;
  }

  try {
    /* ── Inicializar (evitar doble init si ya existe) ── */
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    db = firebase.firestore();
    console.log(
      `%c✅ Firebase OK — Proyecto: ${firebaseConfig.projectId}`,
      'color:#4caf50; font-size:12px;'
    );

    /* ── Cargar fotos existentes ── */
    loadPhotosFromFirebase();

    /* ── Escuchar nuevas fotos en tiempo real ── */
    listenForNewPhotos();

  } catch (err) {
    console.error('❌ Error al inicializar Firebase:', err.message);
  }

})();

/* ═══════════════════════════════════════════════════════════
   GUARDAR FOTO EN FIRESTORE
   Llamada desde invitacion.js después de subir a Cloudinary
   ═══════════════════════════════════════════════════════════ */
async function savePhotoToFirebase(secureUrl, publicId) {
  if (!db) {
    console.warn('Firebase no disponible — la foto solo se muestra localmente.');
    return;
  }

  try {
    await db.collection(FIRESTORE_COLLECTION).add({
      url:       secureUrl,
      publicId:  publicId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      event:     'bautizo-daniel-2026'
    });
    console.log('%c📸 Foto guardada en Firebase:', 'color:#7ba7d8;', publicId);
  } catch (err) {
    console.error('❌ Error al guardar foto en Firebase:', err.message);
  }
}

/* ═══════════════════════════════════════════════════════════
   CARGAR FOTOS EXISTENTES AL ABRIR LA PÁGINA
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

    console.log(`%c📷 ${snap.size} fotos cargadas desde Firebase`, 'color:#7ba7d8; font-size:12px;');

  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn(
        '⚠️  Firebase necesita un índice compuesto.\n' +
        'Sigue el enlace que aparece en la consola para crearlo.'
      );
    } else {
      console.error('❌ Error al cargar fotos:', err.message);
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   ESCUCHAR NUEVAS FOTOS EN TIEMPO REAL
   ═══════════════════════════════════════════════════════════ */
function listenForNewPhotos() {
  if (!db) return;

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
            console.log('%c🆕 Nueva foto en tiempo real', 'color:#4caf50; font-size:12px;');
          }
        }
      });
    }, err => {
      console.error('❌ Error en listener Firebase:', err.message);
    });
}