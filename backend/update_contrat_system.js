const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rh_portal',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function updateContratSystem() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Mise à jour du système de contrats...');
    
    // 1. Ajouter les colonnes manquantes à la table contrats
    console.log('📝 Ajout des colonnes manquantes...');
    await client.query(`
      ALTER TABLE contrats 
      ADD COLUMN IF NOT EXISTS last_sent TIMESTAMP WITH TIME ZONE;
    `);
    
    await client.query(`
      ALTER TABLE contrats 
      ADD COLUMN IF NOT EXISTS sent_to_employee INTEGER;
    `);
    
    await client.query(`
      ALTER TABLE contrats 
      ADD COLUMN IF NOT EXISTS send_message TEXT;
    `);
    
    await client.query(`
      ALTER TABLE contrats 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);
    
    await client.query(`
      ALTER TABLE contrats 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);
    
    await client.query(`
      ALTER TABLE contrats 
      ADD COLUMN IF NOT EXISTS employee_id INTEGER;
    `);
    
    await client.query(`
      ALTER TABLE contrats 
      ADD COLUMN IF NOT EXISTS salaire DECIMAL(10,2);
    `);
    
    await client.query(`
      ALTER TABLE contrats 
      ADD COLUMN IF NOT EXISTS periode_essai INTEGER DEFAULT 3;
    `);
    
    await client.query(`
      ALTER TABLE contrats 
      ADD COLUMN IF NOT EXISTS contrat_file VARCHAR(500);
    `);
    
    console.log('✅ Colonnes ajoutées avec succès');
    
    // 2. Créer la table d'historique
    console.log('📚 Création de la table d\'historique...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS contrat_history (
        id SERIAL PRIMARY KEY,
        contrat_id INTEGER NOT NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        user_name VARCHAR(255),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_contrat_history_contrat 
          FOREIGN KEY (contrat_id) 
          REFERENCES contrats(id) 
          ON DELETE CASCADE
      );
    `);
    
    // 3. Créer les index
    console.log('🔍 Création des index...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contrat_history_contrat_id ON contrat_history(contrat_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contrat_history_timestamp ON contrat_history(timestamp);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contrat_history_action ON contrat_history(action);
    `);
    
    console.log('✅ Index créés avec succès');
    
    // 4. Créer la fonction et le trigger pour updated_at
    console.log('⚡ Création du trigger de mise à jour...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_contrats_updated_at ON contrats;
    `);
    
    await client.query(`
      CREATE TRIGGER update_contrats_updated_at
        BEFORE UPDATE ON contrats
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('✅ Trigger créé avec succès');
    
    // 5. Mettre à jour les contrats existants
    console.log('🔄 Mise à jour des contrats existants...');
    await client.query(`
      UPDATE contrats 
      SET 
        created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
        updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP),
        periode_essai = COALESCE(periode_essai, 3)
      WHERE created_at IS NULL OR updated_at IS NULL OR periode_essai IS NULL;
    `);
    
    console.log('✅ Contrats existants mis à jour');
    
    // 6. Vérifier la structure finale
    console.log('🔍 Vérification de la structure...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'contrats' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Structure de la table contrats:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${row.column_default ? `default: ${row.column_default}` : ''}`);
    });
    
    console.log('\n🎉 Système de contrats mis à jour avec succès !');
    console.log('\n📋 Prochaines étapes:');
    console.log('  1. Redémarrer votre serveur backend');
    console.log('  2. Tester l\'envoi de contrats depuis l\'interface');
    console.log('  3. Vérifier que l\'historique fonctionne');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  updateContratSystem()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { updateContratSystem };











