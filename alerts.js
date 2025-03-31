import { 
    getAlerts, 
    markAlertAsRead, 
    getProduct,
    getAllProducts
} from './database.js';

class AlertManager {
    static async checkStockLevels() {
        try {
            const products = await getAllProducts();
            const alerts = [];
            
            for (const product of products) {
                if (!product.reorderThreshold) product.reorderThreshold = 10;
                if (!product.criticalThreshold) product.criticalThreshold = 5;
                
                if (product.quantity <= product.criticalThreshold) {
                    alerts.push({
                        productId: product.id,
                        type: 'stock',
                        level: 'critical',
                        title: `Stock critique: ${product.name}`,
                        message: `Stock actuel: ${product.quantity} (Seuil critique: ${product.criticalThreshold})`,
                        read: false,
                        date: new Date()
                    });
                } else if (product.quantity <= product.reorderThreshold) {
                    alerts.push({
                        productId: product.id,
                        type: 'stock',
                        level: 'warning',
                        title: `Stock bas: ${product.name}`,
                        message: `Stock actuel: ${product.quantity} (Seuil d'alerte: ${product.reorderThreshold})`,
                        read: false,
                        date: new Date()
                    });
                }
            }
            
            // Enregistrer les alertes en base de données
            for (const alert of alerts) {
                await addAlert(alert);
            }
            
            return alerts;
            
        } catch (error) {
            console.error("Erreur lors de la vérification des stocks:", error);
            return [];
        }
    }

    static async getActiveAlerts() {
        try {
            const alerts = await getAlerts(true);
            
            // Récupérer les détails des produits
            const alertsWithProducts = await Promise.all(
                alerts.map(async alert => {
                    if (alert.productId) {
                        const product = await getProduct(alert.productId);
                        return { ...alert, product };
                    }
                    return alert;
                })
            );
            
            return alertsWithProducts;
            
        } catch (error) {
            console.error("Erreur lors de la récupération des alertes:", error);
            return [];
        }
    }

    static async markAlertAsRead(alertId) {
        try {
            await markAlertAsRead(alertId);
            return true;
        } catch (error) {
            console.error("Erreur lors du marquage de l'alerte comme lue:", error);
            return false;
        }
    }

    static async markAllAlertsAsRead() {
        try {
            const alerts = await getAlerts(true);
            await Promise.all(alerts.map(alert => markAlertAsRead(alert.id)));
            return true;
        } catch (error) {
            console.error("Erreur lors du marquage de toutes les alertes comme lues:", error);
            return false;
        }
    }
}

// Vérification périodique des stocks (toutes les heures)
setInterval(() => AlertManager.checkStockLevels(), 3600000);

export default AlertManager;