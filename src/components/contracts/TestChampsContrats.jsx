import React, { useState } from 'react';
import { contratService, employeeService } from '../../services/api';

const TestChampsContrats = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runChampsTest = async () => {
    setIsLoading(true);
    const results = {
      timestamp: new Date().toLocaleString(),
      contrats: null,
      employees: null,
      champsManquants: [],
      champsPresents: [],
      exemplesContrats: [],
      solutions: []
    };

    try {
      // Test 1: Récupérer les contrats
      console.log('🔍 Test des champs des contrats...');
      const contrats = await contratService.getAll();
      results.contrats = contrats;
      
      if (contrats && contrats.length > 0) {
        const premierContrat = contrats[0];
        results.exemplesContrats.push(premierContrat);
        
        // Vérifier les champs essentiels
        const champsEssentiels = [
          'id', 'employee_id', 'type_contrat', 'poste', 'service', 
          'date_debut', 'date_fin', 'salaire'
        ];
        
        champsEssentiels.forEach(champ => {
          if (premierContrat[champ] !== undefined && premierContrat[champ] !== null) {
            results.champsPresents.push(`✅ ${champ}: ${premierContrat[champ]}`);
          } else {
            results.champsManquants.push(`❌ ${champ}: manquant`);
            results.solutions.push(`Ajouter le champ ${champ} dans la table contrats`);
          }
        });
        
        // Vérifier spécifiquement le poste et la date de fin
        if (!premierContrat.poste) {
          results.champsManquants.push('❌ poste: manquant');
          results.solutions.push('Ajouter la colonne poste dans la table contrats');
        }
        
        if (!premierContrat.date_fin) {
          results.champsManquants.push('❌ date_fin: manquant');
          results.solutions.push('Ajouter la colonne date_fin dans la table contrats');
        }
        
      } else {
        results.champsManquants.push('❌ Aucun contrat trouvé');
        results.solutions.push('Vérifier que la table contrats contient des données');
      }
    } catch (error) {
      console.error('❌ Erreur récupération contrats:', error);
      results.champsManquants.push(`❌ Erreur API: ${error.message}`);
      results.solutions.push('Vérifier que le serveur backend fonctionne');
    }

    try {
      // Test 2: Récupérer les employés
      const employees = await employeeService.getAll();
      results.employees = employees;
      
      if (employees && employees.length > 0) {
        const premierEmploye = employees[0];
        results.champsPresents.push(`✅ Premier employé: ${premierEmploye.nom_prenom || 'Nom non défini'}`);
      }
    } catch (error) {
      console.error('❌ Erreur récupération employés:', error);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🔍 Test : Champs des Contrats</h2>
      
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #90caf9',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: '#1565c0', marginTop: 0 }}>📋 Objectif du Test</h4>
        <p style={{ color: '#1565c0', margin: 0 }}>
          <strong>Vérifier que tous les champs nécessaires sont présents :</strong>
          <br />
          • <strong>poste</strong> - Le poste de l'employé
          <br />
          • <strong>date_fin</strong> - La date de fin du contrat
          <br />
          • <strong>nom_employe</strong> - Le nom de l'employé (via liaison)
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runChampsTest}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isLoading ? 'Test en cours...' : '🔍 Tester les Champs'}
        </button>
        
        <button 
          onClick={clearResults}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Effacer
        </button>
      </div>

      {testResults && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginTop: 0, color: '#495057' }}>
            📊 Résultats du Test - {testResults.timestamp}
          </h3>

          {/* Champs présents */}
          {testResults.champsPresents.length > 0 && (
            <div style={{ 
              backgroundColor: '#d4edda', 
              padding: '15px', 
              borderRadius: '5px',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: '#155724', marginTop: 0 }}>✅ Champs Présents</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {testResults.champsPresents.map((champ, index) => (
                  <li key={index} style={{ color: '#155724' }}>{champ}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Champs manquants */}
          {testResults.champsManquants.length > 0 && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              padding: '15px', 
              borderRadius: '5px',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: '#721c24', marginTop: 0 }}>❌ Champs Manquants</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {testResults.champsManquants.map((champ, index) => (
                  <li key={index} style={{ color: '#721c24' }}>{champ}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Solutions recommandées */}
          {testResults.solutions.length > 0 && (
            <div style={{ 
              backgroundColor: '#d1ecf1', 
              padding: '15px', 
              borderRadius: '5px',
              border: '1px solid #bee5eb'
            }}>
              <h4 style={{ color: '#0c5460', marginTop: 0 }}>💡 Solutions Recommandées</h4>
              <ol style={{ color: '#0c5460', margin: 0, paddingLeft: '20px' }}>
                {testResults.solutions.map((solution, index) => (
                  <li key={index}>{solution}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Exemples de contrats */}
          {testResults.exemplesContrats.length > 0 && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              padding: '15px', 
              borderRadius: '5px',
              border: '1px solid #ffeaa7',
              marginTop: '20px'
            }}>
              <h4 style={{ color: '#856404', marginTop: 0 }}>📋 Exemple de Contrat</h4>
              <pre style={{ 
                backgroundColor: 'white', 
                padding: '10px', 
                borderRadius: '3px',
                border: '1px solid #ffeaa7',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {JSON.stringify(testResults.exemplesContrats[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Instructions de résolution */}
      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h4>📋 Instructions de Résolution</h4>
        <ol>
          <li><strong>Lancer le test:</strong> Utilisez le bouton "Tester les Champs" pour identifier les problèmes</li>
          <li><strong>Analyser les résultats:</strong> Regardez les champs manquants et les solutions recommandées</li>
          <li><strong>Corriger la base de données:</strong> Ajoutez les colonnes manquantes si nécessaire</li>
          <li><strong>Mettre à jour les données:</strong> Insérez des valeurs pour les nouveaux champs</li>
          <li><strong>Relancer le test:</strong> Vérifiez que tous les champs sont présents</li>
        </ol>
      </div>

      {/* Scripts SQL pour corriger les champs manquants */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h4>📝 Scripts SQL de Correction</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <h5 style={{ color: '#495057' }}>Ajouter la colonne poste si manquante</h5>
          <pre style={{ 
            backgroundColor: 'white', 
            padding: '10px', 
            borderRadius: '3px',
            border: '1px solid #dee2e6',
            fontSize: '12px',
            overflow: 'auto'
          }}>
{`-- Vérifier si la colonne poste existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'contrats' AND column_name = 'poste';

-- Ajouter la colonne poste si elle n'existe pas
ALTER TABLE contrats ADD COLUMN IF NOT EXISTS poste VARCHAR(255);

-- Mettre à jour les contrats existants avec une valeur par défaut
UPDATE contrats SET poste = 'Poste non défini' WHERE poste IS NULL;`}
          </pre>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h5 style={{ color: '#495057' }}>Ajouter la colonne date_fin si manquante</h5>
          <pre style={{ 
            backgroundColor: 'white', 
            padding: '10px', 
            borderRadius: '3px',
            border: '1px solid #dee2e6',
            fontSize: '12px',
            overflow: 'auto'
          }}>
{`-- Vérifier si la colonne date_fin existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'contrats' AND column_name = 'date_fin';

-- Ajouter la colonne date_fin si elle n'existe pas
ALTER TABLE contrats ADD COLUMN IF NOT EXISTS date_fin DATE;

-- Mettre à jour les contrats existants avec une valeur par défaut
UPDATE contrats SET date_fin = date_debut + INTERVAL '1 year' WHERE date_fin IS NULL;`}
          </pre>
        </div>

        <div>
          <h5 style={{ color: '#495057' }}>Insérer des données de test complètes</h5>
          <pre style={{ 
            backgroundColor: 'white', 
            padding: '10px', 
            borderRadius: '3px',
            border: '1px solid #dee2e6',
            fontSize: '12px',
            overflow: 'auto'
          }}>
{`-- Insérer un employé de test
INSERT INTO employees (nom_prenom, email, matricule) 
VALUES ('Marie Martin', 'marie@exemple.com', 'EMP002')
ON CONFLICT (matricule) DO NOTHING;

-- Insérer un contrat de test avec tous les champs
INSERT INTO contrats (
  employee_id, type_contrat, poste, service, 
  date_debut, date_fin, salaire
) VALUES (
  (SELECT id FROM employees WHERE matricule = 'EMP002'),
  'CDI', 'Chef de Projet', 'Management',
  '2024-01-01', '2026-12-31', 65000
);`}
          </pre>
        </div>
      </div>

      {/* Vérifications manuelles */}
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #ffeaa7',
        marginTop: '20px'
      }}>
        <h4>🔍 Vérifications Manuelles</h4>
        <ul>
          <li><strong>Structure de la table:</strong> Vérifiez que les colonnes <code>poste</code> et <code>date_fin</code> existent</li>
          <li><strong>Données:</strong> Vérifiez que les contrats ont des valeurs pour ces champs</li>
          <li><strong>API:</strong> Vérifiez que l'endpoint <code>/api/contrats</code> retourne ces champs</li>
          <li><strong>Affichage:</strong> Vérifiez que les contrats affichent bien le poste et la date de fin</li>
        </ul>
      </div>

      {/* Résumé des champs requis */}
      <div style={{ 
        backgroundColor: '#d4edda', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #c3e6cb',
        marginTop: '20px'
      }}>
        <h4 style={{ color: '#155724', marginTop: 0 }}>📋 Champs Requis pour les Contrats</h4>
        <ul style={{ color: '#155724', margin: 0, paddingLeft: '20px' }}>
          <li><strong>id</strong> - Identifiant unique du contrat</li>
          <li><strong>employee_id</strong> - Référence vers l'employé</li>
          <li><strong>type_contrat</strong> - Type de contrat (CDI, CDD, etc.)</li>
          <li><strong>poste</strong> - Poste occupé par l'employé</li>
          <li><strong>service</strong> - Service/département</li>
          <li><strong>date_debut</strong> - Date de début du contrat</li>
          <li><strong>date_fin</strong> - Date de fin du contrat</li>
          <li><strong>salaire</strong> - Salaire de l'employé</li>
        </ul>
      </div>
    </div>
  );
};

export default TestChampsContrats;








