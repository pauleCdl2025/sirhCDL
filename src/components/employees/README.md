# EmployeePortal Component

## Description

Le composant `EmployeePortal` est un portail complet pour les employés qui leur permet d'accéder à toutes les fonctionnalités de leur espace personnel.

## Fonctionnalités

### 🏠 Tableau de bord

- Vue d'ensemble des informations importantes
- Événements à venir
- Demandes récentes
- Notes de service récentes
- Statistiques personnelles

### 📄 Documents

- Consultation des documents personnels
- Téléchargement des fiches de paie
- Accès aux contrats et attestations
- Demande de nouveaux documents

### 📝 Demandes

- Création de nouvelles demandes (congés, documents, autres)
- Suivi du statut des demandes
- Historique complet des demandes
- Annulation des demandes en attente

### 📋 Notes de service

- Consultation des notes publiques
- Filtrage par catégorie
- Recherche dans le contenu

### 📅 Événements

- Calendrier des événements à venir
- Détails des événements (lieu, description, date)
- Vue d'ensemble des activités de l'entreprise

### ⚖️ Sanctions

- Consultation des sanctions disciplinaires
- Détails des sanctions
- Statut des procédures

### 👤 Profil

- Informations personnelles
- Informations professionnelles
- Gestion de la sécurité du compte
  - Changement de mot de passe sécurisé
  - Indicateur de force du mot de passe en temps réel
  - Validation des critères de sécurité

### 🎤 Assistant Vocal ElevenLabs

- **Agent Wally intégré** - Assistant RH intelligent d'ElevenLabs
- Reconnaissance vocale en français avancée
- Navigation vocale intelligente dans le portail
- Traitement des demandes complexes en langage naturel
- Synthèse vocale haute qualité avec voix ElevenLabs
- Historique des conversations avec l'agent
- Interface intuitive avec bouton flottant
- **Fallback automatique** vers la logique locale si ElevenLabs n'est pas disponible

## Utilisation

```jsx
import EmployeePortal from './components/employees/EmployeePortal';

function App() {
  return (
    <BrowserRouter>
      <EmployeePortal />
    </BrowserRouter>
  );
}
```

## Prérequis

### Services requis

Le composant nécessite les services suivants dans `src/services/api.js` :

- `employeeService` - Gestion des employés
- `requestService` - Gestion des demandes
- `sanctionService` - Gestion des sanctions
- `evenementService` - Gestion des événements
- `noteService` - Gestion des notes de service

### Authentification

L'utilisateur doit être connecté avec des données stockées dans `sessionStorage` sous la clé `employeeUser`.

## Structure des données

### Données utilisateur

```javascript
{
  id: number,
  nom_prenom: string,
  email: string,
  entity: string,
  poste_actuel: string,
  date_embauche: string,
  type_contrat: string,
  // ... autres champs
}
```

### Demandes

```javascript
{
  id: number,
  type: 'leave' | 'document' | 'other',
  status: 'pending' | 'approved' | 'rejected',
  start_date?: string,
  end_date?: string,
  reason: string,
  request_details?: string,
  // ... autres champs
}
```

### Événements

```javascript
{
  id: number,
  name: string,
  date: string,
  location: string,
  description: string,
  formatted_date?: string
}
```

## Gestion des erreurs

Le composant gère automatiquement :

- Les erreurs de chargement des données
- Les erreurs d'authentification
- Les erreurs de soumission des formulaires
- L'affichage des messages d'erreur appropriés

## Responsive Design

Le composant est entièrement responsive et s'adapte aux différentes tailles d'écran :

- Desktop : Sidebar fixe à gauche
- Tablet : Sidebar adaptative
- Mobile : Navigation en mode hamburger

## Tests

Le composant inclut des tests unitaires complets qui couvrent :

- `EmployeePortal.test.js` : Tests du composant principal
  - Le chargement initial
  - La navigation entre onglets
  - La gestion des erreurs
  - La déconnexion
- `ChangePasswordModal.test.js` : Tests du composant de changement de mot de passe
  - Affichage/masquage de la modal
  - Validation des formulaires
  - Gestion des erreurs

## Configuration de l'Agent ElevenLabs

### Prérequis

1. **Clé API ElevenLabs** : Obtenez votre clé API depuis [ElevenLabs](https://elevenlabs.io/)
2. **Agent configuré** : Votre agent "Wally" doit être configuré dans ElevenLabs

### Guide d'Installation

1. Créez un fichier `.env` à la racine du projet
2. Ajoutez votre clé API :

   ```bash
   REACT_APP_ELEVENLABS_API_KEY=votre-clé-api-ici
   ```

3. Redémarrez l'application

### Personnalisation

- **Agent ID** : Modifiez `AGENT_ID` dans `elevenLabsService.js`
- **Voix** : Changez `VOICE_ID` pour utiliser une autre voix
- **Modèle** : Ajustez `MODEL_ID` selon vos besoins

## Styles

Les styles sont définis dans `src/styles/EmployeePortal.css` avec :

- Variables CSS pour la cohérence des couleurs
- Animations et transitions fluides
- Design moderne et professionnel
- Support des thèmes clairs/sombres

## Dépendances

- React 16.8+
- React Router DOM
- Formik (pour les formulaires)
- Yup (pour la validation des formulaires)
- Axios (pour les appels API)
- Font Awesome (pour les icônes)
- react-speech-recognition (pour la reconnaissance vocale)
- Web Speech API (pour la synthèse vocale)
- **ElevenLabs API** (pour l'agent vocal intelligent)

## Maintenance

### Ajout de nouvelles fonctionnalités

1. Créer le nouvel onglet dans la sidebar
2. Ajouter la logique dans le composant principal
3. Créer les composants enfants nécessaires
4. Ajouter les styles CSS correspondants
5. Mettre à jour les tests

### Modification des services

1. Mettre à jour l'interface dans `api.js`
2. Adapter les appels dans le composant
3. Gérer les nouveaux formats de données
4. Mettre à jour les tests

## Support

Pour toute question ou problème avec ce composant, consultez :

- La documentation des services API
- Les tests unitaires pour des exemples d'utilisation
- Le fichier CSS pour la personnalisation des styles
