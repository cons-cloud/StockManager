import { 
    addProduct, 
    getProduct, 
    getAllProducts, 
    updateProduct, 
    deleteProduct 
} from './database.js';

class ProductManager {
    static async addProduct(productData) {
        try {
            // Validation des données
            if (!productData.name || !productData.reference) {
                throw new Error("Le nom et la référence sont obligatoires");
            }
            
            // Valeurs par défaut
            const product = {
                name: productData.name,
                reference: productData.reference,
                category: productData.category || 'autre',
                description: productData.description || '',
                quantity: productData.quantity || 0,
                price: productData.price || 0,
                reorderThreshold: productData.reorderThreshold || 10,
                criticalThreshold: productData.criticalThreshold || 5,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const productId = await addProduct(product);
            
            // Vérifier si une alerte doit être générée
            if (product.quantity <= product.criticalThreshold || product.quantity <= product.reorderThreshold) {
                await AlertManager.checkStockLevels();
            }
            
            return productId;
            
        } catch (error) {
            console.error("Erreur lors de l'ajout du produit:", error);
            throw error;
        }
    }

    static async getProduct(id) {
        try {
            return await getProduct(id);
        } catch (error) {
            console.error("Erreur lors de la récupération du produit:", error);
            throw error;
        }
    }

    static async getAllProducts() {
        try {
            const products = await getAllProducts();
            return products.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error("Erreur lors de la récupération des produits:", error);
            return [];
        }
    }

    static async updateProduct(id, changes) {
        try {
            changes.updatedAt = new Date();
            await updateProduct(id, changes);
            
            // Si la quantité a changé, vérifier les alertes
            if (changes.quantity !== undefined) {
                const product = await getProduct(id);
                if (product.quantity <= product.criticalThreshold || product.quantity <= product.reorderThreshold) {
                    await AlertManager.checkStockLevels();
                }
            }
            
            return true;
            
        } catch (error) {
            console.error("Erreur lors de la mise à jour du produit:", error);
            throw error;
        }
    }

    static async deleteProduct(id) {
        try {
            await deleteProduct(id);
            return true;
        } catch (error) {
            console.error("Erreur lors de la suppression du produit:", error);
            throw error;
        }
    }

    static async searchProducts(query) {
        try {
            const products = await this.getAllProducts();
            const searchTerm = query.toLowerCase();
            
            return products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.reference.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.description?.toLowerCase().includes(searchTerm)
            );
            
        } catch (error) {
            console.error("Erreur lors de la recherche de produits:", error);
            return [];
        }
    }
}

export default ProductManager;