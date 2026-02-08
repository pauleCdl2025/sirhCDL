import React, { useState } from 'react';
import { contratService, employeeService } from '../../services/api';

const DiagnosticContratsManquants = () => {
  const [diagnostic, setDiagnostic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackendCheck, setShowBackendCheck] = useState(false);

  const runDiagnostic = async () => {
    setIsLoading(true);
    const results = {
      timestamp: new Date().toLocaleString(),
      backendStatus: null,
      databaseStatus: null,
      apiStatus: null,
      contratsCount: 0,
      employeesCount: 0,
      errors: [],
      warnings: [],
      solutions: []
    };

    try {
      // Test 1: Vérifier si l'API répond
      console.log('🔍 Test 1: Vérification de l\'API...');
      const contrats = await contratService.getAll();
      results.contratsCount = contrats?.length || 0;
      
      if (results.contratsCount === 0) {
        results.warnings.push('⚠️ Aucun contrat trouvé dans l\'API');
        results.solutions.push('Vérifier que la table contrats contient des données');
        results.solutions.push('Vérifier que la route backend /api/contrats fonctionne');
      } else {
        results.apiStatus = '✅ API fonctionne et retourne des contrats';
      }
    } catch (error) {
      console.error('❌ Erreur API contrats:', error);
      results.errors.push(`❌ Erreur API: ${error.message}`);
      results.solutions.push('Vérifier que le serveur backend fonctionne');
      results.solutions.push('Vérifier la configuration de l\'URL API');
    }

    try {
      // Test 2: Vérifier les employés
      console.log('🔍 Test 2: Vérification des employés...');
      const employees = await employeeService.getAll();
      results.employeesCount = employees?.length || 0;
      
      if (results.employeesCount === 0) {
        results.warnings.push('⚠️ Aucun employé trouvé dans l\'API');
        results.solutions.push('Vérifier que la table employees contient des données');
      } else {
        results.apiStatus = results.apiStatus ? `${results.apiStatus} et employés` : '✅ API fonctionne et retourne des employés';
      }
    } catch (error) {
      console.error('❌ Erreur API employés:', error);
      results.errors.push(`❌ Erreur API employés: ${error.message}`);
    }

    // Test 3: Vérifier la configuration
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    results.backendStatus = `URL API configurée: ${apiUrl}`;

    setDiagnostic(results);
    setIsLoading(false);
  };

  const clearDiagnostic = () => {
    setDiagnostic(null);
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const checkBackendStatus = async () => {
    setShowBackendCheck(true);
    const result = await testBackendConnection();
    console.log('🔍 Test connexion backend:', result);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🚨 Diagnostic : Aucun Contrat Trouvé</h2>
      
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #ffeaa7',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: '#856404', marginTop: 0 }}>⚠️ Problème Identifié</h4>
        <p style={{ color: '#856404', margin: 0 }}>
          Aucun contrat n'a été trouvé lors du chargement de l'application. 
          Ce diagnostic vous aidera à identifier et résoudre le problème.
        </p>
      </div>

      {/* Boutons d'action */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={runDiagnostic}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? '🔄 Diagnostic en cours...' : '🔍 Lancer le Diagnostic'}
        </button>
        
        <button 
          onClick={checkBackendStatus}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔌 Tester Connexion Backend
        </button>

        {diagnostic && (
          <button 
            onClick={clearDiagnostic}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🧹 Effacer les Résultats
          </button>
        )}
      </div>

      {/* Résultats du diagnostic */}
      {diagnostic && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #dee2e6',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: '#495057' }}>📊 Résultats du Diagnostic</h3>
          <p><strong>Timestamp:</strong> {diagnostic.timestamp}</p>
          <p><strong>URL API:</strong> {diagnostic.backendStatus}</p>
          <p><strong>Contrats trouvés:</strong> {diagnostic.contratsCount}</p>
          <p><strong>Employés trouvés:</strong> {diagnostic.employeesCount}</p>
          {diagnostic.apiStatus && <p><strong>Statut API:</strong> {diagnostic.apiStatus}</p>}

          {/* Erreurs */}
          {diagnostic.errors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#721c24' }}>❌ Erreurs Détectées</h4>
              <div style={{ 
                backgroundColor: '#f8d7da', 
                padding: '15px', 
                borderRadius: '5px',
                border: '1px solid #f5c6cb'
              }}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {diagnostic.errors.map((error, index) => (
                    <li key={index} style={{ color: '#721c24' }}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Avertissements */}
          {diagnostic.warnings.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#856404' }}>⚠️ Avertissements</h4>
              <div style={{ 
                backgroundColor: '#fff3cd', 
                padding: '15px', 
                borderRadius: '5px',
                border: '1px solid #ffeaa7'
              }}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {diagnostic.warnings.map((warning, index) => (
                    <li key={index} style={{ color: '#856404' }}>{warning}</li>
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
              {diagnostic.solutions.map((solution, index) => (
                <li key={index}>{solution}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Solutions complètes */}
      <div style={{ 
        backgroundColor: '#d4edda', 
        padding: '20px', 
        borderRadius: '10px',
        border: '1px solid #c3e6cb',
        marginTop: '20px'
      }}>
        <h3 style={{ color: '#155724', marginTop: 0 }}>🛠️ Guide de Résolution Complet</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#155724' }}>Étape 1: Vérifier le Serveur Backend</h4>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #c3e6cb'
          }}>
            <p><strong>Problème:</strong> Le serveur backend ne fonctionne pas</p>
            <p><strong>Solution:</strong></p>
            <ol>
              <li>Ouvrir un terminal dans le dossier <code>backend</code></li>
              <li>Exécuter <code>npm install</code> si nécessaire</li>
              <li>Exécuter <code>npm start</code></li>
              <li>Vérifier que le serveur démarre sur le port 5001</li>
            </ol>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#155724' }}>Étape 2: Vérifier la Base de Données</h4>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #c3e6cb'
          }}>
            <p><strong>Problème:</strong> La table contrats est vide ou n'existe pas</p>
            <p><strong>Solution:</strong></p>
            <ol>
              <li>Se connecter à la base de données PostgreSQL</li>
              <li>Exécuter <code>SELECT COUNT(*) FROM contrats;</code></li>
              <li>Si le résultat est 0, insérer des données de test</li>
              <li>Si la table n'existe pas, exécuter le script de création</li>
            </ol>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#155724' }}>Étape 3: Vérifier les Routes API</h4>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #c3e6cb'
          }}>
            <p><strong>Problème:</strong> La route <code>/api/contrats</code> ne fonctionne pas</p>
            <p><strong>Solution:</strong></p>
            <ol>
              <li>Vérifier que <code>contratRoutes.js</code> est bien importé dans <code>server.js</code></li>
              <li>Vérifier que la route est bien configurée : <code>app.use('/api/contrats', contratRoutes);</code></li>
              <li>Tester l'endpoint directement : <code>http://localhost:5000/api/contrats</code></li>
            </ol>
          </div>
        </div>
      </div>

      {/* Instructions finales */}
      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h4>📋 Instructions Finales</h4>
        <ol>
          <li><strong>Lancer le diagnostic:</strong> Utilisez le bouton "Lancer le Diagnostic" pour identifier les problèmes</li>
          <li><strong>Tester la connexion backend:</strong> Utilisez "Tester Connexion Backend" pour vérifier le serveur</li>
          <li><strong>Suivre les solutions par étape:</strong> Appliquez les solutions dans l'ordre indiqué</li>
          <li><strong>Relancer le diagnostic:</strong> Vérifiez que les problèmes sont résolus</li>
        </ol>
      </div>
    </div>
  );
};

export default DiagnosticContratsManquants;



