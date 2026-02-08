# 📊 Export et Restauration de la Base de Données RH_PORTAL

Ce dossier contient des scripts pour exporter et restaurer votre base de données PostgreSQL `rh_portal`.

## 🚀 Scripts Disponibles

### 1. `quick_export.js` - Export Rapide
**Utilisation recommandée pour un export simple et rapide.**

```bash
cd backend
node quick_export.js
```

**Ce que fait ce script :**
- Exporte la base complète en format SQL
- Crée automatiquement un dossier `exports/`
- Nomme le fichier avec un timestamp
- Affiche la taille du fichier généré

### 2. `export_database.js` - Export Avancé
**Utilisation recommandée pour des options d'export avancées.**

```bash
cd backend
node export_database.js
```

**Options disponibles :**
1. **Export complet en SQL** (recommandé) - Structure + données
2. **Export en format custom** - Format binaire, plus rapide
3. **Export en répertoire** - Pour les gros volumes
4. **Export des données uniquement** - Sans structure
5. **Export de la structure uniquement** - Sans données
6. **Lister les tables** - Voir la structure
7. **Informations sur la base** - Taille, etc.
8. **Export complet** - Tous les formats

### 3. `restore_database.js` - Restauration
**Pour restaurer une base de données depuis un fichier d'export.**

```bash
cd backend
node restore_database.js
```

**Ce que fait ce script :**
- Liste les fichiers d'export disponibles
- Permet de choisir le fichier à restaurer
- Crée une nouvelle base de données
- Restaure toutes les données
- Vérifie la restauration

## 📋 Prérequis

### 1. PostgreSQL Installé
Assurez-vous que PostgreSQL est installé sur votre système :
- **Windows** : Téléchargez depuis [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS** : `brew install postgresql`
- **Linux** : `sudo apt-get install postgresql` (Ubuntu/Debian)

### 2. Outils en ligne de commande
Les scripts utilisent :
- `pg_dump` - Pour l'export
- `psql` - Pour la restauration

### 3. Accès à la base
Vérifiez que vous pouvez vous connecter à votre base :
```bash
psql -h localhost -U postgres -d rh_portal
```

## 🔧 Configuration

### Modifier les paramètres de connexion
Si vos paramètres de base de données sont différents, modifiez le fichier `db.js` ou les scripts :

```javascript
const DB_CONFIG = {
  user: 'postgres',           // Votre utilisateur
  host: 'localhost',          // Votre hôte
  database: 'rh_portal',      // Nom de votre base
  password: 'Cdl202407',      // Votre mot de passe
  port: 5432                  // Votre port
};
```

## 📁 Structure des Exports

```
backend/
├── exports/                          # Dossier créé automatiquement
│   ├── rh_portal_export_2024-01-15T10-30-00.sql
│   ├── rh_portal_export_2024-01-15T10-30-00.backup
│   └── rh_portal_export_2024-01-15T10-30-00/     # Format directory
├── quick_export.js                   # Export rapide
├── export_database.js                # Export avancé
└── restore_database.js               # Restauration
```

## 🚨 Sécurité

### ⚠️ ATTENTION
- **Sauvegardez** vos fichiers d'export dans un endroit sûr
- **Ne partagez pas** les fichiers contenant des données sensibles
- **Testez** la restauration sur un environnement de test avant la production
- **Vérifiez** les permissions des fichiers d'export

### 🔐 Chiffrement (Optionnel)
Pour plus de sécurité, vous pouvez chiffrer vos exports :

```bash
# Chiffrer un fichier d'export
gpg -c rh_portal_export.sql

# Déchiffrer pour la restauration
gpg -d rh_portal_export.sql.gpg > rh_portal_export.sql
```

## 📊 Formats d'Export

### 1. **SQL (Plain Text)**
- **Extension** : `.sql`
- **Avantages** : Lisible, portable, compatible
- **Inconvénients** : Plus volumineux
- **Utilisation** : Restauration, migration, sauvegarde

### 2. **Custom (Binaire)**
- **Extension** : `.backup`
- **Avantages** : Plus rapide, plus compact
- **Inconvénients** : Spécifique à PostgreSQL
- **Utilisation** : Sauvegarde locale, transfert rapide

### 3. **Directory**
- **Extension** : Dossier
- **Avantages** : Parallélisation, gros volumes
- **Inconvénients** : Plus complexe
- **Utilisation** : Très grosses bases

## 🔄 Exemples d'Utilisation

### Export quotidien automatisé
```bash
# Créer un script cron (Linux/macOS)
0 2 * * * cd /path/to/backend && node quick_export.js >> export.log 2>&1

# Tâche planifiée Windows
schtasks /create /tn "Export DB" /tr "node quick_export.js" /sc daily /st 02:00
```

### Export avec compression
```bash
# Export + compression gzip
node quick_export.js && gzip exports/*.sql

# Export + compression zip
node quick_export.js && zip -r exports/backup.zip exports/
```

## 🆘 Dépannage

### Erreur "pg_dump not found"
```bash
# Ajouter PostgreSQL au PATH Windows
set PATH=%PATH%;C:\Program Files\PostgreSQL\14\bin

# macOS/Linux
export PATH=$PATH:/usr/local/pgsql/bin
```

### Erreur de connexion
```bash
# Vérifier que PostgreSQL fonctionne
sudo systemctl status postgresql

# Vérifier les paramètres de connexion
psql -h localhost -U postgres -d rh_portal
```

### Erreur de permissions
```bash
# Vérifier les permissions de l'utilisateur
psql -U postgres -c "\du"

# Accorder les permissions nécessaires
GRANT ALL PRIVILEGES ON DATABASE rh_portal TO postgres;
```

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez** que PostgreSQL est installé et fonctionne
2. **Testez** la connexion manuellement avec `psql`
3. **Vérifiez** les paramètres de connexion dans `db.js`
4. **Consultez** les logs d'erreur pour plus de détails

## 🔗 Liens Utiles

- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [psql Documentation](https://www.postgresql.org/docs/current/app-psql.html)
- [Téléchargement PostgreSQL](https://www.postgresql.org/download/)












