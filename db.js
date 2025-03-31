import { initDB } from './schema.js';

// Initialisation
const db = await initDB();

// Exemple d'utilisation
const transaction = db.transaction(['products'], 'readonly');
const store = transaction.objectStore('products');
const request = store.getAll();

request.onsuccess = () => {
    console.log("Produits:", request.result);
};