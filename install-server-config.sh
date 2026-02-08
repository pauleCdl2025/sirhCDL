#!/bin/bash

# Script d'installation des configurations serveur optimisées
# Pour résoudre les erreurs 504 d'onboarding

echo "🚀 Installation des configurations serveur optimisées..."
echo "=================================================="

# ========================================
# VÉRIFICATION DES PRÉREQUIS
# ========================================

echo "🔍 Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

echo "✅ Node.js $(node --version)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ npm $(npm --version)"

# ========================================
# INSTALLATION DES DÉPENDANCES
# ========================================

echo ""
echo "📦 Installation des dépendances..."

# Dépendances principales
npm install express multer cors path fs

# Dépendances optionnelles selon votre base de données
read -p "Quelle base de données utilisez-vous ? (mysql/mongodb/autre): " db_type

case $db_type in
    mysql)
        echo "📦 Installation des dépendances MySQL..."
        npm install mysql2
        ;;
    mongodb)
        echo "📦 Installation des dépendances MongoDB..."
        npm install mongoose
        ;;
    *)
        echo "⚠️ Aucune dépendance de base de données installée"
        ;;
esac

# ========================================
# CRÉATION DES DOSSIERS
# ========================================

echo ""
echo "📁 Création des dossiers nécessaires..."

# Créer le dossier uploads
mkdir -p uploads
echo "✅ Dossier uploads créé"

# Créer le dossier logs
mkdir -p logs
echo "✅ Dossier logs créé"

# ========================================
# CONFIGURATION DES VARIABLES D'ENVIRONNEMENT
# ========================================

echo ""
echo "⚙️ Configuration des variables d'environnement..."

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    cat > .env << EOF
# Configuration serveur
PORT=5001
NODE_ENV=development

# Configuration CORS
FRONTEND_URL=http://localhost:3000

# Configuration base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sirh_db
DB_SSL=false

# Configuration MongoDB (si utilisé)
MONGO_URI=mongodb://localhost:27017/sirh_db
MONGO_SSL=false

# Configuration uploads
MAX_FILE_SIZE=10485760
MAX_FILES=5
UPLOAD_TIMEOUT=300000

# Configuration timeouts
REQUEST_TIMEOUT=300000
RESPONSE_TIMEOUT=300000
EOF
    echo "✅ Fichier .env créé"
else
    echo "⚠️ Fichier .env existe déjà"
fi

# ========================================
# COPIE DES FICHIERS DE CONFIGURATION
# ========================================

echo ""
echo "📋 Copie des fichiers de configuration..."

# Copier la configuration serveur
if [ -f "server-config-example.js" ]; then
    cp server-config-example.js app.js
    echo "✅ Configuration serveur copiée vers app.js"
else
    echo "⚠️ Fichier server-config-example.js non trouvé"
fi

# Copier la configuration base de données
if [ -f "database-config-example.js" ]; then
    cp database-config-example.js config/database.js
    echo "✅ Configuration base de données copiée"
else
    echo "⚠️ Fichier database-config-example.js non trouvé"
fi

# ========================================
# CONFIGURATION DU PACKAGE.JSON
# ========================================

echo ""
echo "📦 Configuration du package.json..."

# Vérifier si package.json existe
if [ ! -f package.json ]; then
    cat > package.json << EOF
{
  "name": "sirh-server",
  "version": "1.0.0",
  "description": "Serveur SIRH optimisé",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "node test-server-config.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": ["sirh", "onboarding", "employees"],
  "author": "Votre nom",
  "license": "MIT"
}
EOF
    echo "✅ package.json créé"
else
    echo "⚠️ package.json existe déjà"
fi

# ========================================
# TEST DE LA CONFIGURATION
# ========================================

echo ""
echo "🧪 Test de la configuration..."

# Tester si le serveur peut démarrer
echo "🔍 Test de démarrage du serveur..."
timeout 10s node app.js &
SERVER_PID=$!

sleep 3

# Vérifier si le serveur répond
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Serveur répond correctement"
    kill $SERVER_PID 2>/dev/null
else
    echo "❌ Serveur ne répond pas"
    kill $SERVER_PID 2>/dev/null
fi

# ========================================
# CONFIGURATION NGINX (OPTIONNEL)
# ========================================

read -p "Voulez-vous configurer Nginx ? (y/n): " configure_nginx

if [ "$configure_nginx" = "y" ]; then
    echo ""
    echo "🌐 Configuration Nginx..."
    
    # Vérifier si Nginx est installé
    if command -v nginx &> /dev/null; then
        cat > /etc/nginx/sites-available/sirh << EOF
server {
    listen 80;
    server_name localhost;
    
    client_max_body_size 50M;
    client_body_timeout 300s;
    client_header_timeout 300s;
    
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
        
        # Activer le site
        ln -sf /etc/nginx/sites-available/sirh /etc/nginx/sites-enabled/
        
        # Tester la configuration
        nginx -t
        if [ $? -eq 0 ]; then
            systemctl reload nginx
            echo "✅ Configuration Nginx appliquée"
        else
            echo "❌ Erreur dans la configuration Nginx"
        fi
    else
        echo "⚠️ Nginx n'est pas installé"
    fi
fi

# ========================================
# FINALISATION
# ========================================

echo ""
echo "🎉 Installation terminée !"
echo "=========================="
echo ""
echo "📋 Prochaines étapes :"
echo "1. Configurez votre base de données dans le fichier .env"
echo "2. Démarrez le serveur : npm start"
echo "3. Testez l'onboarding depuis votre frontend"
echo "4. Surveillez les logs pour vérifier les performances"
echo ""
echo "📊 Monitoring disponible :"
echo "- Logs de performance dans la console"
echo "- Endpoint de santé : http://localhost:5001/api/health"
echo "- Endpoint ping : http://localhost:5001/api/ping"
echo ""
echo "🔧 En cas de problème :"
echo "- Vérifiez les logs du serveur"
echo "- Testez avec : node test-server-config.js"
echo "- Consultez le guide : SERVER_504_FIX_GUIDE.md"

echo ""
echo "✅ Configuration serveur optimisée installée avec succès !"







