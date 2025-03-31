// StockManager - Gestion de la base de données IndexedDB

let db;

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('StockManagerDB', 2);

        request.onerror = (event) => {
            console.error("Erreur d'ouverture de la base de données", event);
            reject("Erreur de base de données");
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Supprimer les anciennes tables si elles existent
            if (db.objectStoreNames.contains('products')) {
                db.deleteObjectStore('products');
            }
            if (db.objectStoreNames.contains('inventory')) {
                db.deleteObjectStore('inventory');
            }
            if (db.objectStoreNames.contains('alerts')) {
                db.deleteObjectStore('alerts');
            }
            if (db.objectStoreNames.contains('settings')) {
                db.deleteObjectStore('settings');
            }

            // Créer les tables avec les nouveaux schémas
            const productsStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            productsStore.createIndex('reference', 'reference', { unique: true });
            productsStore.createIndex('category', 'category', { unique: false });

            const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
            inventoryStore.createIndex('productId', 'productId', { unique: false });
            inventoryStore.createIndex('date', 'date', { unique: false });
            inventoryStore.createIndex('type', 'type', { unique: false });

            const alertsStore = db.createObjectStore('alerts', { keyPath: 'id', autoIncrement: true });
            alertsStore.createIndex('productId', 'productId', { unique: false });
            alertsStore.createIndex('date', 'date', { unique: false });
            alertsStore.createIndex('read', 'read', { unique: false });

            const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });
            
            console.log("Structure de la base de données mise à jour");
        };
    });
};

// Méthodes CRUD pour les produits
const addProduct = (product) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');
        const request = store.add(product);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const getProduct = (id) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const updateProduct = (id, updates) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const product = getRequest.result;
            if (product) {
                const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
                const putRequest = store.put(updatedProduct);
                
                putRequest.onsuccess = () => resolve(putRequest.result);
                putRequest.onerror = (event) => reject(event.target.error);
            } else {
                reject("Produit non trouvé");
            }
        };

        getRequest.onerror = (event) => reject(event.target.error);
    });
};

const deleteProduct = (id) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

// Méthodes pour la gestion des stocks
const addInventoryMovement = (movement) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['inventory'], 'readwrite');
        const store = transaction.objectStore('inventory');
        const request = store.add(movement);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const getInventoryMovements = (productId = null) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['inventory'], 'readonly');
        const store = transaction.objectStore('inventory');
        const request = productId 
            ? store.index('productId').getAll(productId)
            : store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

// Méthodes pour la gestion des alertes
const addAlert = (alert) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['alerts'], 'readwrite');
        const store = transaction.objectStore('alerts');
        const request = store.add(alert);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const getAlerts = (onlyUnread = false) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['alerts'], 'readonly');
        const store = transaction.objectStore('alerts');
        const request = onlyUnread
            ? store.index('read').getAll(IDBKeyRange.only(false))
            : store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const markAlertAsRead = (id) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['alerts'], 'readwrite');
        const store = transaction.objectStore('alerts');
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const alert = getRequest.result;
            if (alert) {
                alert.read = true;
                const putRequest = store.put(alert);
                
                putRequest.onsuccess = () => resolve(putRequest.result);
                putRequest.onerror = (event) => reject(event.target.error);
            } else {
                reject("Alerte non trouvée");
            }
        };

        getRequest.onerror = (event) => reject(event.target.error);
    });
};

// Méthodes pour les paramètres
const getSetting = (key) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result?.value);
        request.onerror = (event) => reject(event.target.error);
    });
};

const setSetting = (key, value) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        const request = store.put({ id: key, value });

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

export { 
    initDB,
    addProduct, getProduct, getAllProducts, updateProduct, deleteProduct,
    addInventoryMovement, getInventoryMovements,
    addAlert, getAlerts, markAlertAsRead,
    getSetting, setSetting
};