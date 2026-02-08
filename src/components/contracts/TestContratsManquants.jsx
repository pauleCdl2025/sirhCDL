import React, { useState } from 'react';
import { contratService, employeeService } from '../../services/api';

const TestContratsManquants = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runQuickTest = async () => {
    setIsLoading(true);
    const results = {
      timestamp: new Date().toLocaleString(),
      backendStatus: '❓ Non testé',
      contratsCount: 0,
      employeesCount: 0,
      errors: [],
      solutions: []
    };

    try {
      // Test 1: Contrats
      console.log('🔍 Test des contrats...');
      const contrats = await contratService.getAll();
      results.contratsCount = contrats?.length || 0;
      
      if (results.contratsCount === 0) {
        results.errors.push('❌ Aucun contrat trouvé');
        results.solutions.push('Vérifier que le serveur backend fonctionne');
        results.solutions.push('Vérifier que la table contrats contient des données');
      } else {
        results.backendStatus = '✅ Backend fonctionne - Contrats trouvés';
      }
    } catch (error) {
      console.error('❌ Erreur contrats:', error);
      results.errors.push(`❌ Erreur API: ${error.message}`);
      results.solutions.push('Démarrer le serveur backend');
      results.solutions.push('Vérifier la configuration de l\'URL API');
    }

    try {
      // Test 2: Employés
      console.log('🔍 Test des employés...');
      const employees = await employeeService.getAll();
      results.employeesCount = employees?.length || 0;
      
      if (results.employeesCount === 0) {
        results.errors.push('❌ Aucun employé trouvé');
        results.solutions.push('Vérifier que la table employees contient des données');
      }
    } catch (error) {
      console.error('❌ Erreur employés:', error);
      results.errors.push(`❌ Erreur API employés: ${error.message}`);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🚨 Test : Aucun Contrat Trouvé</h2>
      
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #ffeaa7',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: '#856404', marginTop: 0 }}>⚠️ Problème Identifié</h4>
        <p style={{ color: '#856404', margin: 0 }}>
          <strong>Cause :</strong> Aucun contrat n'est trouvé dans la base de données ou l'API.
          <br />
          <strong>Impact :</strong> Impossible d'afficher les noms des employés car il n'y a pas de contrats à lier.
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runQuickTest}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#6c757d' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isLoading ? 'Test en cours...' : '🔍 Lancer le Test'}
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

          {/* Statut du backend */}
          <div style={{ 
            backgroundColor: '#e9ecef', 
            padding: '15px', 
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: '#495057', marginTop: 0 }}>⚙️ Statut du Backend</h4>
            <p style={{ margin: 0 }}><strong>État:</strong> {testResults.backendStatus}</p>
            <p style={{ margin: 0 }}><strong>Contrats trouvés:</strong> {testResults.contratsCount}</p>
            <p style={{ margin: 0 }}><strong>Employés trouvés:</strong> {testResults.employeesCount}</p>
          </div>

          {/* Erreurs détectées */}
          {testResults.errors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#dc3545' }}>❌ Problèmes Détectés</h4>
              <div style={{ 
                backgroundColor: '#f8d7da', 
                padding: '15px', 
                borderRadius: '5px',
                border: '1px solid #f5c6cb'
              }}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {testResults.errors.map((error, index) => (
                    <li key={index} style={{ color: '#721c24' }}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Solutions recommandées */}
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
          <li><strong>Démarrer le serveur backend:</strong>
            <ul>
              <li>Ouvrir un terminal dans le dossier <code>backend</code></li>
              <li>Exécuter <code>npm start</code></li>
              <li>Vérifier que le serveur démarre sur le port 5001</li>
            </ul>
          </li>
          <li><strong>Vérifier la base de données:</strong>
            <ul>
              <li>Se connecter à PostgreSQL</li>
              <li>Exécuter <code>SELECT COUNT(*) FROM contrats;</code></li>
              <li>Si le résultat est 0, insérer des données de test</li>
            </ul>
          </li>
          <li><strong>Tester l'API directement:</strong>
            <ul>
              <li>Ouvrir <code>http://localhost:5000/api/contrats</code> dans le navigateur</li>
              <li>Vérifier que l'endpoint retourne des données</li>
            </ul>
          </li>
          <li><strong>Relancer le test:</strong> Utiliser le bouton "Lancer le Test" pour vérifier</li>
        </ol>
      </div>

      {/* Scripts SQL utiles */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h4>📝 Scripts SQL Utiles</h4>
        <pre style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          borderRadius: '3px',
          border: '1px solid #dee2e6',
          fontSize: '12px',
          overflow: 'auto'
        }}>
{`-- Vérifier les tables
\\dt

-- Compter les contrats
SELECT COUNT(*) FROM contrats;

-- Compter les employés
SELECT COUNT(*) FROM employees;

-- Insérer des données de test
INSERT INTO employees (nom_prenom, email, matricule) 
VALUES ('Jean Dupont', 'jean@exemple.com', 'EMP001');

INSERT INTO contrats (employee_id, type_contrat, poste, service, date_debut, salaire) 
VALUES (1, 'CDI', 'Développeur', 'IT', '2024-01-01', 50000);`}
        </pre>
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
          <li><strong>Console du navigateur:</strong> Regardez les erreurs réseau</li>
          <li><strong>Onglet Network:</strong> Vérifiez les appels à <code>/api/contrats</code></li>
          <li><strong>Terminal backend:</strong> Vérifiez les logs du serveur</li>
          <li><strong>Base de données:</strong> Vérifiez que les tables existent et contiennent des données</li>
        </ul>
      </div>
    </div>
  );
};

export default TestContratsManquants;
