const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function testEnhancedContrats() {
  try {
    console.log('🔍 Test des contrats améliorés...\n');
    
    // Vérifier la structure mise à jour
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'contrats' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Structure de la table contrats:');
    structure.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
    });
    
    // Vérifier les contrats récents avec toutes les informations
    const recentContrats = await pool.query(`
      SELECT 
        c.numero_contrat,
        c.type_contrat,
        c.titre_poste,
        c.departement,
        c.salaire_brut,
        c.salaire_net,
        c.type_remuneration,
        c.mode_paiement,
        c.periode_essai,
        c.lieu_travail,
        c.horaires_travail,
        c.superieur_hierarchique,
        c.date_debut,
        c.date_fin,
        c.statut,
        e.nom_prenom,
        e.matricule
      FROM contrats c
      JOIN employees e ON c.employee_id = e.id
      ORDER BY c.created_at DESC 
      LIMIT 3
    `);
    
    console.log('\n📋 Derniers contrats avec informations complètes:');
    recentContrats.rows.forEach((contrat, index) => {
      console.log(`\n${index + 1}. Contrat ${contrat.numero_contrat}:`);
      console.log(`   Employee: ${contrat.nom_prenom} (${contrat.matricule})`);
      console.log(`   Type: ${contrat.type_contrat}`);
      console.log(`   Poste: ${contrat.titre_poste}`);
      console.log(`   Département: ${contrat.departement}`);
      console.log(`   Salaire net: ${contrat.salaire_net || 'Non renseigné'}`);
      console.log(`   Type rémunération: ${contrat.type_remuneration || 'Non renseigné'}`);
      console.log(`   Mode paiement: ${contrat.mode_paiement || 'Non renseigné'}`);
      console.log(`   Période d'essai: ${contrat.periode_essai || 'Non renseignée'} jours`);
      console.log(`   Lieu travail: ${contrat.lieu_travail || 'Non renseigné'}`);
      console.log(`   Horaires: ${contrat.horaires_travail || 'Non renseignés'}`);
      console.log(`   Supérieur: ${contrat.superieur_hierarchique || 'Non renseigné'}`);
      console.log(`   Statut: ${contrat.statut}`);
    });
    
    // Statistiques
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_contrats,
        COUNT(CASE WHEN numero_contrat IS NOT NULL THEN 1 END) as avec_numero,
        COUNT(CASE WHEN titre_poste IS NOT NULL THEN 1 END) as avec_poste,
        COUNT(CASE WHEN departement IS NOT NULL THEN 1 END) as avec_departement,
        COUNT(CASE WHEN salaire_net IS NOT NULL THEN 1 END) as avec_salaire,
        COUNT(CASE WHEN type_remuneration IS NOT NULL THEN 1 END) as avec_remuneration
      FROM contrats
    `);
    
    console.log('\n📊 Statistiques des contrats:');
    console.log(`- Total contrats: ${stats.rows[0].total_contrats}`);
    console.log(`- Avec numéro: ${stats.rows[0].avec_numero}`);
    console.log(`- Avec poste: ${stats.rows[0].avec_poste}`);
    console.log(`- Avec département: ${stats.rows[0].avec_departement}`);
    console.log(`- Avec salaire: ${stats.rows[0].avec_salaire}`);
    console.log(`- Avec type rémunération: ${stats.rows[0].avec_remuneration}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

testEnhancedContrats();







