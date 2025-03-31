// StockManager - Gestion de l'authentification

const checkAuth = () => {
    return localStorage.getItem('loggedIn') === 'true';
};

const login = (username, password) => {
    // En production, vous devriez vérifier contre une API sécurisée
    // Ici, nous utilisons une vérification simple pour la démo
    if (username && password) {
        localStorage.setItem('loggedIn', 'true');
        return true;
    }
    return false;
};

const logout = () => {
    localStorage.removeItem('loggedIn');
};

const getCurrentUser = () => {
    // En production, vous devriez récupérer les infos utilisateur depuis une API
    return {
        id: 1,
        username: 'admin',
        name: 'Administrateur',
        role: 'admin'
    };
};

export { checkAuth, login, logout, getCurrentUser };