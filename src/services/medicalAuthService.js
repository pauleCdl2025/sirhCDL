import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.centre-diagnostic.com';

class MedicalAuthService {
    // Connexion pour les médecins
    async login(email, token) {
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
    logout() {
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

    // Valider une étape du dossier médical
    async validateStep(stepData) {
        try {
            const medecin = this.getCurrentMedecin();
            const response = await axios.post(`${API_BASE_URL}/medical/validate-step`, {
                ...stepData,
                medecinId: medecin.id
            });

            return response.data;
        } catch (error) {
            console.error('Erreur lors de la validation d\'étape:', error);
            throw error;
        }
    }

    // Télécharger un document
    async uploadDocument(documentData) {
        try {
            const medecin = this.getCurrentMedecin();
            const formData = new FormData();
            
            // Ajouter tous les champs du document
            Object.keys(documentData).forEach(key => {
                formData.append(key, documentData[key]);
            });
            
            // Ajouter l'ID du médecin
            formData.append('medecinId', medecin.id);

            const response = await axios.post(`${API_BASE_URL}/medical/upload-document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Erreur lors du téléchargement du document:', error);
            throw error;
        }
    }
}

export default new MedicalAuthService();