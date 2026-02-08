// Configuration de base de données optimisée
// À intégrer dans votre configuration de base de données

// ========================================
// CONFIGURATION MYSQL OPTIMISÉE
// ========================================

const mysql = require('mysql2/promise');

const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sirh_db',
  
  // Configuration optimisée pour éviter les timeouts
  connectionLimit: 20,
  acquireTimeout: 60000,
  timeout: 60000,
  queueLimit: 0,
  
  // Configuration de performance
  multipleStatements: false,
  dateStrings: true,
  
  // Configuration de sécurité
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
};

const mysqlPool = mysql.createPool(mysqlConfig);

// Test de connexion
mysqlPool.getConnection()
  .then(connection => {
    console.log('✅ Connexion MySQL établie');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur connexion MySQL:', err);
  });

// ========================================
// CONFIGURATION MONGODB OPTIMISÉE
// ========================================

const mongoose = require('mongoose');

const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
  // Timeouts optimisés
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 300000,
  connectTimeoutMS: 30000,
  
  // Configuration de performance
  maxPoolSize: 20,
  minPoolSize: 5,
  
  // Configuration de sécurité
  ssl: process.env.MONGO_SSL === 'true',
  sslValidate: false
};

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sirh_db', mongoConfig)
  .then(() => {
    console.log('✅ Connexion MongoDB établie');
  })
  .catch(err => {
    console.error('❌ Erreur connexion MongoDB:', err);
  });

// ========================================
// MODÈLE EMPLOYÉ OPTIMISÉ
// ========================================

// Exemple avec Mongoose
const employeeSchema = new mongoose.Schema({
  matricule: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nom_prenom: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  telephone: String,
  poste_actuel: String,
  type_contrat: String,
  date_entree: Date,
  entity: String,
  departement: String,
  documents: [{
    filename: String,
    originalName: String,
    type: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  checklist: {
    contrat_signature: { type: Boolean, default: false },
    documents_verifies: { type: Boolean, default: false },
    acces_configure: { type: Boolean, default: false },
    formation_initiale: { type: Boolean, default: false },
    presentation_equipe: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  // Optimisations pour les performances
  collection: 'employees',
  strict: false
});

// Index composés pour les requêtes fréquentes
employeeSchema.index({ entity: 1, departement: 1 });
employeeSchema.index({ type_contrat: 1, date_entree: 1 });
employeeSchema.index({ createdAt: -1 });

const Employee = mongoose.model('Employee', employeeSchema);

// ========================================
// FONCTIONS D'ACCÈS AUX DONNÉES OPTIMISÉES
// ========================================

class EmployeeService {
  // Créer un employé avec gestion d'erreurs optimisée
  static async createEmployee(employeeData) {
    const startTime = Date.now();
    
    try {
      console.log('💾 Début sauvegarde employé...');
      
      const employee = new Employee(employeeData);
      const savedEmployee = await employee.save();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Employé sauvegardé en ${duration}ms`);
      
      return savedEmployee;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Erreur sauvegarde employé après ${duration}ms:`, error);
      throw error;
    }
  }
  
  // Récupérer tous les employés avec pagination
  static async getEmployees(page = 1, limit = 20, filters = {}) {
    const startTime = Date.now();
    
    try {
      const skip = (page - 1) * limit;
      const query = Employee.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(); // Pour de meilleures performances
      
      const [employees, total] = await Promise.all([
        query.exec(),
        Employee.countDocuments(filters)
      ]);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Employés récupérés en ${duration}ms`);
      
      return {
        employees,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Erreur récupération employés après ${duration}ms:`, error);
      throw error;
    }
  }
  
  // Rechercher un employé par matricule
  static async findByMatricule(matricule) {
    const startTime = Date.now();
    
    try {
      const employee = await Employee.findOne({ matricule }).lean();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Recherche matricule ${matricule} en ${duration}ms`);
      
      return employee;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Erreur recherche matricule après ${duration}ms:`, error);
      throw error;
    }
  }
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  mysqlPool,
  mongoose,
  Employee,
  EmployeeService,
  mysqlConfig,
  mongoConfig
};
