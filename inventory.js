import { 
    addInventoryMovement, 
    getInventoryMovements,
    getProduct,
    updateProduct
} from './database.js';

class InventoryManager {
    static async addStockMovement(productId, quantity, type, notes = '') {
        try {
            // Validation
            if (!['in', 'out', 'adjustment'].includes(type)) {
                throw new Error("Type de mouvement invalide");
            }
            
            const product = await getProduct(productId);
            if (!product) throw new Error("Produit non trouvé");
            
            // Créer le mouvement
            const movement = {
                productId,
                productName: product.name,
                productReference: product.reference,
                quantity: Math.abs(quantity),
                type,
                notes,
                date: new Date(),
                userId: 1 // À remplacer par l'ID de l'utilisateur connecté
            };
            
            // Mettre à jour le stock du produit
            let newQuantity = product.quantity;
            
            switch (type) {
                case 'in':
                    newQuantity += quantity;
                    break;
                case 'out':
                    newQuantity = Math.max(0, newQuantity - quantity);
                    break;
                case 'adjustment':
                    newQuantity = quantity;
                    break;
            }
            
            await updateProduct(productId, { quantity: newQuantity });
            await addInventoryMovement(movement);
            
            // Vérifier si une alerte doit être générée
            if (newQuantity <= product.criticalThreshold || newQuantity <= product.reorderThreshold) {
                await AlertManager.checkStockLevels();
            }
            
            return movement;
            
        } catch (error) {
            console.error("Erreur lors de l'ajout du mouvement de stock:", error);
            throw error;
        }
    }

    static async getInventoryHistory(productId = null) {
        try {
            let movements = await getInventoryMovements(productId);
            
            // Trier par date (du plus récent au plus ancien)
            movements.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            return movements;
            
        } catch (error) {
            console.error("Erreur lors de la récupération de l'historique:", error);
            return [];
        }
    }

    static async getCurrentStock() {
        try {
            const products = await getAllProducts();
            return products.map(p => ({
                id: p.id,
                reference: p.reference,
                name: p.name,
                category: p.category,
                quantity: p.quantity,
                price: p.price,
                reorderThreshold: p.reorderThreshold,
                criticalThreshold: p.criticalThreshold,
                value: (p.price || 0) * (p.quantity || 0)
            }));
            
        } catch (error) {
            console.error("Erreur lors de la récupération du stock actuel:", error);
            return [];
        }
    }

    static async exportStockToCSV() {
        try {
            const stock = await this.getCurrentStock();
            let csv = 'Référence;Nom;Catégorie;Quantité;Seuil alerte;Seuil critique;Valeur\n';
            
            stock.forEach(item => {
                csv += `"${item.reference}";"${item.name}";"${item.category}";${item.quantity};${item.reorderThreshold};${item.criticalThreshold};${item.value.toFixed(2)}\n`;
            });
            
            return csv;
            
        } catch (error) {
            console.error("Erreur lors de l'export CSV:", error);
            throw error;
        }
    }
}

export default InventoryManager;