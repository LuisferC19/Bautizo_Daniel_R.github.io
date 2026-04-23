/* ═══════════════════════════════════════════════════════════
   FIREBASE-CONFIG.JS — Bautizo de Daniel
   ═══════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey:            "AIzaSyD8VNJzL7GhYZJ3hbUlXgKf-WOTdo5aDPA",
  authDomain:        "bautizo-daniel-2026-ea250.firebaseapp.com",
  projectId:         "bautizo-daniel-2026-ea250",
  storageBucket:     "bautizo-daniel-2026-ea250.firebasestorage.app",
  messagingSenderId: "683605274408",
  appId:             "1:683605274408:web:6527f5c463661f4e9cea1d"
};

const FIRESTORE_COLLECTION = 'fotos-bautizo-daniel';
let db = null;

(function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK no cargado.');
    return;
  }
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log(
      `%c✅ Firebase OK — Proyecto: ${firebaseConfig.projectId}`,
      'color:#4caf50; font-size:12px;'
    );
    loadPhotosFromFirebase();
    listenForNewPhotos();
  } catch (err) {
    console.error('❌ Error al inicializar Firebase:', err.message);
  }
})();

async function savePhotoToFirebase(secureUrl, publicId) {
  if (!db) return;
  try {
    await db.collection(FIRESTORE_COLLECTION).add({
      url:       secureUrl,
      publicId:  publicId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      event:     'bautizo-daniel-2026'
    });
    console.log('%c📸 Foto guardada en Firebase:', 'color:#7ba7d8;', publicId);
  } catch (err) {
    console.error('❌ Error al guardar foto:', err.message);
  }
}

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
      `%c📷 ${snap.size} foto(s) cargadas desde Firebase`,
      'color:#7ba7d8; font-size:12px;'
    );
  } catch (err) {
    console.error('❌ Error al cargar fotos:', err.message);
  }
}

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
            console.log('%c🆕 Nueva foto en tiempo real', 'color:#4caf50;');
          }
        }
      });
    }, err => {
      console.error('❌ Error en listener:', err.message);
    });
}