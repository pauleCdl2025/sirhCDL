import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.centre-diagnostic.com';

class AuthService {
    // Connexion pour les médecins
    async loginMedecin(email, token) {
        try {
            const response = await axios.post(`${API_BASE_URL}/medical/login`, {
                email,
                token
            });

            if (response.data.success) {
                // Stocker les informations de l'utilisateur
                const userData = response.data.user;
                
                                                                                                                                                                                                                                                                                                                        // Stocker dans sessionStorage
                sessionStorage.setItem('medecin_user', JSON.stringify(userData));
                
                return userData;
            } else {
                throw new Error(response.data.message || 'Échec de la connexion');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            throw error;
        }
    }

    // Déconnexion pour les médecins
    logoutMedecin() {
        // Supprimer les données utilisateur
        sessionStorage.removeItem('medecin_user');
        localStorage.removeItem('medecin_user');
    }

    // Vérifier si un médecin est connecté
    isMedecinAuthenticated() {
        return !!sessionStorage.getItem('medecin_user');
    }

    // Récupérer les informations du médecin connecté
    getCurrentMedecin() {
        const userData = sessionStorage.getItem('medecin_user');
        return userData ? JSON.parse(userData) : null;
    }

    // Demande de réinitialisation du token
    async requestTokenReset(email) {
        try {
            const response = await axios.post(`${API_BASE_URL}/medical/reset-token`, { email });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation:', error);
            throw error;
        }
    }
}

export default new AuthService();