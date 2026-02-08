const matriculeService = (pool) => {
  // Générer un matricule unique basé sur l'année et un compteur séquentiel
  const generateUniqueMatricule = async () => {
    const client = await pool.connect();
    
    try {
      const year = new Date().getFullYear();
      
      // Trouver le dernier matricule de l'année en cours
      const result = await client.query(`
        SELECT matricule 
        FROM employees 
        WHERE matricule LIKE $1 
        ORDER BY matricule DESC 
        LIMIT 1
      `, [`CDL-${year}-%`]);
      
      let nextNumber = 1;
      
      if (result.rows.length > 0) {
        const lastMatricule = result.rows[0].matricule;
        const lastNumber = parseInt(lastMatricule.split('-')[2]);
        nextNumber = lastNumber + 1;
      }
      
      // Formater le numéro avec 4 chiffres (ex: 0001, 0002, etc.)
      const formattedNumber = nextNumber.toString().padStart(4, '0');
      const matricule = `CDL-${year}-${formattedNumber}`;
      
      return matricule;
    } catch (error) {
      console.error('Erreur lors de la génération du matricule:', error);
      throw new Error('Impossible de générer un matricule unique');
    } finally {
      client.release();
    }
  };

  // Vérifier si un matricule existe déjà
  const isMatriculeUnique = async (matricule) => {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id FROM employees WHERE matricule = $1',
        [matricule]
      );
      
      return result.rows.length === 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du matricule:', error);
      throw new Error('Impossible de vérifier l\'unicité du matricule');
    } finally {
      client.release();
    }
  };

  // Réserver un matricule (pour éviter les conflits lors de la création)
  const reserveMatricule = async (matricule) => {
    const client = await pool.connect();
    
    try {
      // Vérifier d'abord si le matricule existe déjà
      const existingResult = await client.query(
        'SELECT id FROM employees WHERE matricule = $1',
        [matricule]
      );
      
      if (existingResult.rows.length > 0) {
        return false; // Le matricule existe déjà
      }
      
      // Insérer un enregistrement temporaire pour réserver le matricule
      const result = await client.query(`
        INSERT INTO employees (matricule, nom_prenom, statut_employe, created_at)
        VALUES ($1, 'TEMP_RESERVATION', 'En cours', NOW())
        RETURNING id
      `, [matricule]);
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Erreur lors de la réservation du matricule:', error);
      throw new Error('Impossible de réserver le matricule');
    } finally {
      client.release();
    }
  };

  // Libérer un matricule réservé
  const releaseMatricule = async (matricule) => {
    const client = await pool.connect();
    
    try {
      await client.query(`
        DELETE FROM employees 
        WHERE matricule = $1 AND nom_prenom = 'TEMP_RESERVATION'
      `, [matricule]);
    } catch (error) {
      console.error('Erreur lors de la libération du matricule:', error);
    } finally {
      client.release();
    }
  };

  return {
    generateUniqueMatricule,
    isMatriculeUnique,
    reserveMatricule,
    releaseMatricule
  };
};

module.exports = matriculeService;

