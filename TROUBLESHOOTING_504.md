# Guide de Dépannage - Erreur 504 Gateway Timeout

## 🔍 Diagnostic de l'Erreur 504

L'erreur 504 (Gateway Timeout) indique que le serveur prend trop de temps à répondre. Voici un guide complet pour diagnostiquer et résoudre ce problème.

## 📋 Vérifications Préliminaires

### 1. **Connexion Internet**
- ✅ Vérifiez votre connexion internet
- ✅ Testez l'accès à d'autres sites web
- ✅ Vérifiez que vous n'êtes pas en mode hors ligne

### 2. **Serveur de Développement**
- ✅ Vérifiez que votre serveur backend est démarré
- ✅ Vérifiez les logs du serveur pour des erreurs
- ✅ Testez l'endpoint `/health` ou `/ping` directement

### 3. **Configuration du Serveur**
- ✅ Vérifiez les timeouts côté serveur
- ✅ Vérifiez la configuration de la base de données
- ✅ Vérifiez les ressources système (CPU, RAM, disque)

## 🛠️ Solutions Implémentées

### 1. **Diagnostic Automatique**
Le système inclut maintenant un diagnostic automatique qui vérifie :
- **Connexion réseau** : Test de connectivité
- **Santé du serveur** : Vérification de l'API
- **Performance** : Tests de temps de réponse

### 2. **Retry Automatique**
- Retry automatique avec backoff exponentiel
- Maximum 3 tentatives
- Délais progressifs : 1s, 2s, 4s

### 3. **Timeout Étendu**
- Timeout augmenté à 60 secondes pour l'onboarding
- Configuration centralisée dans `apiConfig.js`

## 🔧 Solutions Côté Serveur

### 1. **Augmentation des Timeouts**
```javascript
// Dans votre serveur Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Timeout pour les requêtes
app.use((req, res, next) => {
  req.setTimeout(120000); // 2 minutes
  res.setTimeout(120000);
  next();
});
```

### 2. **Optimisation de la Base de Données**
```sql
-- Vérifiez les requêtes lentes
SHOW PROCESSLIST;

-- Optimisez les index
EXPLAIN SELECT * FROM employees WHERE matricule = 'CDL-2025-0001';

-- Vérifiez la taille des tables
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'your_database';
```

### 3. **Configuration Nginx (si utilisé)**
```nginx
# Augmenter les timeouts
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

# Augmenter la taille des uploads
client_max_body_size 50M;
```

## 🚀 Solutions Côté Client

### 1. **Optimisation des Uploads**
- Compressez les images avant envoi
- Limitez la taille des fichiers
- Utilisez des formats optimisés (WebP pour les images)

### 2. **Gestion des Erreurs**
```javascript
// Exemple d'utilisation du retry handler
import { retryHandler } from '../utils/retryHandler';

try {
  const response = await retryHandler.onboardingWithRetry(formData, onProgress);
  // Traitement du succès
} catch (error) {
  // Gestion des erreurs avec messages personnalisés
  console.error('Erreur après retry:', error);
}
```

### 3. **Diagnostic Manuel**
```javascript
// Test manuel de la connectivité
import { serverHealthCheck } from '../utils/serverHealthCheck';

const diagnostic = await serverHealthCheck.runFullDiagnostic();
console.log('Résultats du diagnostic:', diagnostic);
```

## 📊 Monitoring et Surveillance

### 1. **Métriques à Surveiller**
- Temps de réponse moyen
- Taux d'erreur 504
- Utilisation CPU/RAM du serveur
- Taille des uploads

### 2. **Logs à Vérifier**
```bash
# Logs du serveur
tail -f /var/log/your-app/error.log | grep "504"

# Logs de la base de données
tail -f /var/log/mysql/slow-query.log

# Logs Nginx
tail -f /var/log/nginx/error.log | grep "504"
```

## 🆘 Actions Immédiates

### Si l'erreur 504 persiste :

1. **Redémarrez le serveur**
   ```bash
   sudo systemctl restart your-app
   ```

2. **Vérifiez les ressources**
   ```bash
   top
   df -h
   free -h
   ```

3. **Testez la base de données**
   ```bash
   mysql -u username -p -e "SELECT 1;"
   ```

4. **Vérifiez les logs**
   ```bash
   journalctl -u your-app -f
   ```

## 📞 Support

Si le problème persiste après avoir essayé toutes ces solutions :

1. **Collectez les informations de diagnostic**
2. **Sauvegardez les logs d'erreur**
3. **Notez les étapes de reproduction**
4. **Contactez l'équipe technique**

## 🔄 Prévention

### 1. **Monitoring Proactif**
- Surveillez les métriques de performance
- Configurez des alertes pour les timeouts
- Testez régulièrement les endpoints critiques

### 2. **Optimisation Continue**
- Optimisez les requêtes de base de données
- Mettez en cache les données fréquemment utilisées
- Utilisez la compression pour les uploads

### 3. **Tests de Charge**
- Testez avec des volumes de données réalistes
- Simulez des scénarios de charge élevée
- Identifiez les goulots d'étranglement

---

**Note** : Ce guide est mis à jour régulièrement. Consultez la documentation technique pour les dernières recommandations.







