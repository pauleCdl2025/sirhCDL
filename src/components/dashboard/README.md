# 📊 Composants de Graphiques Statistiques RH

Ce dossier contient les composants pour afficher des graphiques statistiques connectés à votre base de données RH.

## 🚀 Composants Disponibles

### 1. **StatisticsCharts.jsx** - Version Production
Composant principal qui se connecte à votre base de données via l'API.

**Fonctionnalités :**
- 📊 Graphique en anneau : Répartition des employés par département
- 📋 Graphique en barres : Statut des contrats (expirés, critiques, en alerte, OK)
- 📈 Graphique linéaire : Évolution des effectifs sur 12 mois
- 🏥 Graphique en barres : Types d'absences
- 🔑 Indicateurs clés : Métriques importantes en temps réel

**Connexion API :**
- Récupère les données depuis `/api/employees`
- Récupère les contrats depuis `/api/employees/alerts/expiring-contracts`
- Récupère les départements depuis `/api/departments` (optionnel)
- Récupère les absences depuis `/api/absences` (optionnel)

### 2. **StatisticsChartsDemo.jsx** - Version Démonstration
Version avec des données simulées pour tester l'affichage sans API.

**Utilisation :**
- Parfait pour le développement et les tests
- Affiche des données réalistes
- Pas besoin de connexion à la base de données

## 🎨 Design et Styling

### **Couleurs Officielles :**
- **Primary** : `#3a7bd5` (bleu)
- **Secondary** : `#00d1b2` (turquoise)
- **Gradient** : `linear-gradient(135deg, #3a7bd5, #00d1b2)`

### **Responsive Design :**
- Grille adaptative qui s'ajuste à toutes les tailles d'écran
- Animations d'entrée fluides
- Hover effects interactifs

## 📱 Utilisation

### **Installation des Dépendances :**
```bash
npm install chart.js react-chartjs-2
```

### **Import dans votre App :**
```jsx
// Version production (avec API)
import StatisticsCharts from './components/dashboard/StatisticsCharts';

// Version démo (sans API)
import StatisticsChartsDemo from './components/dashboard/StatisticsChartsDemo';
```

### **Utilisation dans un composant :**
```jsx
function Dashboard() {
  return (
    <div>
      <h1>Mon Tableau de Bord</h1>
      <StatisticsCharts />
      {/* ou */}
      <StatisticsChartsDemo />
    </div>
  );
}
```

## 🔧 Configuration

### **Variables d'Environnement :**
```env
REACT_APP_API_URL=http://localhost:5001/api
```

### **Authentification :**
Le composant utilise automatiquement le token stocké dans `sessionStorage.getItem('token')`.

## 📊 Types de Graphiques

### **1. Graphique en Anneau (Doughnut)**
- **Données** : Répartition des employés par département
- **Couleurs** : Palette automatique avec vos couleurs officielles
- **Interactivité** : Légende cliquable, tooltips

### **2. Graphique en Barres (Bar)**
- **Données** : Statut des contrats et types d'absences
- **Couleurs** : Rouge (expiré), Orange (critique), Bleu (alerte), Vert (OK)
- **Échelles** : Axe Y avec pas de 1, grille personnalisée

### **3. Graphique Linéaire (Line)**
- **Données** : Évolution des effectifs sur 12 mois
- **Style** : Ligne avec remplissage, points interactifs
- **Animation** : Courbe lisse avec tension

## 🎯 Personnalisation

### **Modifier les Couleurs :**
```css
/* Dans StatisticsCharts.css */
.charts-header {
  background: linear-gradient(135deg, #VOTRE_COULEUR1, #VOTRE_COULEUR2);
}
```

### **Ajouter de Nouveaux Graphiques :**
```jsx
// Dans StatisticsCharts.jsx
const getNewChartData = () => {
  return {
    labels: ['Label1', 'Label2'],
    datasets: [{
      label: 'Nouveau Graphique',
      data: [10, 20],
      backgroundColor: ['#3a7bd5', '#00d1b2']
    }]
  };
};
```

## 🚨 Gestion des Erreurs

### **États Gérés :**
- ✅ **Chargement** : Spinner animé avec message
- ❌ **Erreur** : Affichage des erreurs avec possibilité de retry
- 📊 **Données** : Affichage conditionnel selon la disponibilité

### **Fallbacks :**
- Si une API n'est pas disponible, le composant continue de fonctionner
- Données par défaut pour les départements et absences
- Gestion gracieuse des erreurs réseau

## 📱 Responsive Design

### **Breakpoints :**
- **Desktop** : Grille 2-3 colonnes
- **Tablet** : Grille 2 colonnes
- **Mobile** : Grille 1 colonne
- **Small Mobile** : Optimisations spécifiques

### **Adaptations :**
- Hauteur des graphiques ajustée automatiquement
- Tailles de police adaptatives
- Espacement optimisé pour chaque écran

## 🔄 Mise à Jour des Données

### **Rafraîchissement Automatique :**
- Données mises à jour toutes les 5 minutes
- Possibilité de rafraîchir manuellement
- Gestion des états de chargement

### **Optimisations :**
- Mémoisation des calculs de statistiques
- Nettoyage des intervalles au démontage
- Gestion des composants montés/démontés

## 🎨 Thèmes et Personnalisation

### **Mode Sombre :**
```css
/* Ajouter dans StatisticsCharts.css */
.statistics-charts-container.dark {
  background: #1a1a1a;
  color: white;
}

.chart-card.dark {
  background: #2d2d2d;
  border-color: #444;
}
```

### **Animations Personnalisées :**
```css
/* Modifier les délais d'animation */
.chart-card:nth-child(1) { animation-delay: 0.2s; }
.chart-card:nth-child(2) { animation-delay: 0.4s; }
```

## 📈 Ajout de Nouvelles Métriques

### **Exemple d'Indicateur :**
```jsx
// Ajouter dans les key-metrics
<div className="metric-item">
  <div className="metric-value">
    {stats.employees.filter(e => e.statut === 'actif').length}
  </div>
  <div className="metric-label">Employés Actifs</div>
</div>
```

## 🚀 Déploiement

### **Build de Production :**
```bash
npm run build
```

### **Optimisations :**
- Tree-shaking automatique de Chart.js
- Code splitting pour les composants
- Lazy loading possible pour les graphiques

---

**Auteur :** Assistant IA  
**Version :** 1.0.0  
**Dernière mise à jour :** Décembre 2024








