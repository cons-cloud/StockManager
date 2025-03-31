// Initialisation de la base de données IndexedDB
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('StockManagerDB', 3); // Version 3

        request.onerror = (event) => {
            console.error("Erreur d'ouverture de la base de données", event);
            reject("Erreur de base de données");
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            
            // Vérifier si la base est vide et insérer des données exemple
            checkEmptyDB(db).then(isEmpty => {
                if (isEmpty) {
                    insertSampleData(db);
                }
                resolve(db);
            });
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
            if (db.objectStoreNames.contains('categories')) {
                db.deleteObjectStore('categories');
            }

            // Créer les tables avec les nouveaux schémas
            const productsStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            productsStore.createIndex('reference', 'reference', { unique: true });
            productsStore.createIndex('category', 'category', { unique: false });
            productsStore.createIndex('quantity', 'quantity', { unique: false });

            const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
            inventoryStore.createIndex('productId', 'productId', { unique: false });
            inventoryStore.createIndex('date', 'date', { unique: false });
            inventoryStore.createIndex('type', 'type', { unique: false });

            const alertsStore = db.createObjectStore('alerts', { keyPath: 'id', autoIncrement: true });
            alertsStore.createIndex('productId', 'productId', { unique: false });
            alertsStore.createIndex('date', 'date', { unique: false });
            alertsStore.createIndex('read', 'read', { unique: false });

            const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
            
            const categoriesStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
            categoriesStore.createIndex('name', 'name', { unique: true });
        };
    });
};

// Vérifier si la base est vide
const checkEmptyDB = (db) => {
    return new Promise((resolve) => {
        const transaction = db.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const request = store.count();

        request.onsuccess = () => {
            resolve(request.result === 0);
        };
        request.onerror = () => resolve(true);
    });
};

// Insérer des données d'exemple
const insertSampleData = (db) => {
    const categories = [
        { name: "Informatique" },
        { name: "Bureautique" },
        { name: "Composants" },
        { name: "Périphériques" }
    ];

    const products = [
        {
            reference: "ORD-001",
            name: "Ordinateur portable EliteBook",
            category: "Informatique",
            description: "PC portable 15\" i7 16Go RAM 512Go SSD",
            quantity: 8,
            price: 1299.99,
            reorderThreshold: 5,
            criticalThreshold: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            reference: "SOUR-002",
            name: "Souris sans fil ergonomique",
            category: "Périphériques",
            description: "Souris sans fil avec recharge USB",
            quantity: 15,
            price: 39.99,
            reorderThreshold: 10,
            criticalThreshold: 5,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            reference: "CLAV-003",
            name: "Clavier mécanique gaming",
            category: "Périphériques",
            description: "Clavier mécanique RGB switches bleus",
            quantity: 3,
            price: 89.99,
            reorderThreshold: 5,
            criticalThreshold: 2,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            reference: "ECR-004",
            name: "Écran 24\" Full HD",
            category: "Informatique",
            description: "Écran LED 24 pouces 1920x1080",
            quantity: 6,
            price: 179.99,
            reorderThreshold: 4,
            criticalThreshold: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    const movements = [
        {
            productId: 1,
            productName: "Ordinateur portable EliteBook",
            productReference: "ORD-001",
            quantity: 10,
            type: "in",
            notes: "Commande initiale",
            date: new Date(2023, 5, 1),
            userId: 1
        },
        {
            productId: 1,
            productName: "Ordinateur portable EliteBook",
            productReference: "ORD-001",
            quantity: 2,
            type: "out",
            notes: "Vente à M. Dupont",
            date: new Date(2023, 5, 5),
            userId: 1
        },
        {
            productId: 2,
            productName: "Souris sans fil ergonomique",
            productReference: "SOUR-002",
            quantity: 20,
            type: "in",
            notes: "Commande initiale",
            date: new Date(2023, 5, 1),
            userId: 1
        },
        {
            productId: 2,
            productName: "Souris sans fil ergonomique",
            productReference: "SOUR-002",
            quantity: 5,
            type: "out",
            notes: "Vente en gros",
            date: new Date(2023, 5, 8),
            userId: 1
        },
        {
            productId: 3,
            productName: "Clavier mécanique gaming",
            productReference: "CLAV-003",
            quantity: 5,
            type: "in",
            notes: "Commande initiale",
            date: new Date(2023, 5, 2),
            userId: 1
        },
        {
            productId: 3,
            productName: "Clavier mécanique gaming",
            productReference: "CLAV-003",
            quantity: 2,
            type: "out",
            notes: "Vente en magasin",
            date: new Date(2023, 5, 10),
            userId: 1
        },
        {
            productId: 4,
            productName: "Écran 24\" Full HD",
            productReference: "ECR-004",
            quantity: 8,
            type: "in",
            notes: "Commande initiale",
            date: new Date(2023, 5, 3),
            userId: 1
        },
        {
            productId: 4,
            productName: "Écran 24\" Full HD",
            productReference: "ECR-004",
            quantity: 2,
            type: "out",
            notes: "Vente à Mme Martin",
            date: new Date(2023, 5, 7),
            userId: 1
        },
        {
            productId: 4,
            productName: "Écran 24\" Full HD",
            productReference: "ECR-004",
            quantity: 6,
            type: "adjustment",
            notes: "Inventaire physique - 2 unités endommagées",
            previousQuantity: 8,
            date: new Date(2023, 5, 9),
            userId: 1
        }
    ];

    const settings = [
        { key: "companyName", value: "Ma Société" },
        { key: "currency", value: "EUR" },
        { key: "lowStockAlert", value: true },
        { key: "alertFrequency", value: "daily" }
    ];

    // Insertion des données
    const transaction = db.transaction(
        ['categories', 'products', 'inventory', 'settings'], 
        'readwrite'
    );

    const categoriesStore = transaction.objectStore('categories');
    categories.forEach(cat => categoriesStore.add(cat));

    const productsStore = transaction.objectStore('products');
    products.forEach(prod => productsStore.add(prod));

    const inventoryStore = transaction.objectStore('inventory');
    movements.forEach(mov => inventoryStore.add(mov));

    const settingsStore = transaction.objectStore('settings');
    settings.forEach(setting => settingsStore.add(setting));

    transaction.oncomplete = () => {
        console.log("Données d'exemple insérées avec succès");
    };

    transaction.onerror = (event) => {
        console.error("Erreur lors de l'insertion des données", event);
    };
};

export { initDB };