import React, { useState } from 'react';
import { contratService, employeeService } from '../../services/api';

const TestRapide = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runQuickTest = async () => {
    setIsLoading(true);
    const results = {
      timestamp: new Date().toLocaleString(),
      contrats: null,
      employees: null,
      liaison: null,
      errors: []
    };

    try {
      // Test 1: Contrats
      console.log('🔍 Test rapide - Contrats...');
      const contrats = await contratService.getAll();
      results.contrats = {
        count: contrats?.length || 0,
        sample: contrats?.slice(0, 2) || [],
        hasEmployeeId: contrats?.length > 0 ? !!contrats[0]?.employee_id : false,
        hasNomEmploye: contrats?.length > 0 ? !!contrats[0]?.nom_employe : false
      };
      console.log('✅ Contrats récupérés:', results.contrats);
    } catch (error) {
      console.error('❌ Erreur contrats:', error);
      results.errors.push(`Contrats: ${error.message}`);
    }

    try {
      // Test 2: Employés
      console.log('🔍 Test rapide - Employés...');
      const employees = await employeeService.getAll();
      results.employees = {
        count: employees?.length || 0,
        sample: employees?.slice(0, 2) || [],
        hasId: employees?.length > 0 ? !!employees[0]?.id : false,
        hasNomPrenom: employees?.length > 0 ? !!employees[0]?.nom_prenom : false
      };
      console.log('✅ Employés récupérés:', results.employees);
    } catch (error) {
      console.error('❌ Erreur employés:', error);
      results.errors.push(`Employés: ${error.message}`);
    }

    // Test 3: Liaison
    if (results.contrats?.count > 0 && results.employees?.count > 0) {
      try {
        const contrats = await contratService.getAll();
        const employees = await employeeService.getAll();
        
        const contratsAvecNoms = contrats.map(contrat => {
          const employee = employees.find(emp => emp.id === contrat.employee_id);
          return {
            ...contrat,
            nom_employe: employee ? employee.nom_prenom : 'Nom non défini'
          };
        });
        
        const contratsValides = contratsAvecNoms.filter(c => c.nom_employe !== 'Nom non défini');
        
        results.liaison = {
          total: contratsAvecNoms.length,
          valides: contratsValides.length,
          invalides: contratsAvecNoms.length - contratsValides.length,
          tauxReussite: contratsAvecNoms.length > 0 ? (contratsValides.length / contratsAvecNoms.length * 100).toFixed(1) : 0
        };
        
        console.log('✅ Liaison testée:', results.liaison);
      } catch (error) {
        console.error('❌ Erreur liaison:', error);
        results.errors.push(`Liaison: ${error.message}`);
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>⚡ Test Rapide - État des Données</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runQuickTest}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isLoading ? 'Test en cours...' : 'Lancer Test Rapide'}
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

          {/* Résumé global */}
          <div style={{ 
            backgroundColor: '#e9ecef', 
            padding: '15px', 
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <h4 style={{ marginTop: 0, color: '#495057' }}>📈 Résumé Global</h4>
            {testResults.errors.length === 0 ? (
              <p style={{ color: '#28a745', fontWeight: 'bold', margin: 0 }}>
                ✅ Tous les tests sont passés avec succès !
              </p>
            ) : (
              <p style={{ color: '#dc3545', fontWeight: 'bold', margin: 0 }}>
                ❌ {testResults.errors.length} erreur(s) détectée(s)
              </p>
            )}
          </div>

          {/* Détails des contrats */}
          {testResults.contrats && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#495057' }}>📋 Contrats</h4>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '15px', 
                borderRadius: '5px',
                border: '1px solid #dee2e6'
              }}>
                <p><strong>Total:</strong> {testResults.contrats.count}</p>
                <p><strong>employee_id présent:</strong> {testResults.contrats.hasEmployeeId ? '✅ Oui' : '❌ Non'}</p>
                <p><strong>nom_employe présent:</strong> {testResults.contrats.hasNomEmploye ? '✅ Oui' : '❌ Non'}</p>
                
                {testResults.contrats.sample.length > 0 && (
                  <div>
                    <p><strong>Exemple:</strong></p>
                    <pre style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '10px', 
                      borderRadius: '3px',
                      fontSize: '12px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(testResults.contrats.sample[0], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Détails des employés */}
          {testResults.employees && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#495057' }}>👥 Employés</h4>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '15px', 
                borderRadius: '5px',
                border: '1px solid #dee2e6'
              }}>
                <p><strong>Total:</strong> {testResults.employees.count}</p>
                <p><strong>id présent:</strong> {testResults.employees.hasId ? '✅ Oui' : '❌ Non'}</p>
                <p><strong>nom_prenom présent:</strong> {testResults.employees.hasNomPrenom ? '✅ Oui' : '❌ Non'}</p>
                
                {testResults.employees.sample.length > 0 && (
                  <div>
                    <p><strong>Exemple:</strong></p>
                    <pre style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '10px', 
                      borderRadius: '3px',
                      fontSize: '12px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(testResults.employees.sample[0], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Résultats de la liaison */}
          {testResults.liaison && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#495057' }}>🔗 Liaison Contrats-Employés</h4>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '15px', 
                borderRadius: '5px',
                border: '1px solid #dee2e6'
              }}>
                <p><strong>Total contrats:</strong> {testResults.liaison.total}</p>
                <p><strong>Contrats avec noms valides:</strong> {testResults.liaison.valides}</p>
                <p><strong>Contrats sans noms:</strong> {testResults.liaison.invalides}</p>
                <p><strong>Taux de réussite:</strong> {testResults.liaison.tauxReussite}%</p>
                
                <div style={{ 
                  backgroundColor: testResults.liaison.tauxReussite > 80 ? '#d4edda' : 
                                testResults.liaison.tauxReussite > 50 ? '#fff3cd' : '#f8d7da',
                  padding: '10px',
                  borderRadius: '5px',
                  marginTop: '10px'
                }}>
                  <p style={{ 
                    color: testResults.liaison.tauxReussite > 80 ? '#155724' : 
                           testResults.liaison.tauxReussite > 50 ? '#856404' : '#721c24',
                    margin: 0,
                    fontWeight: 'bold'
                  }}>
                    {testResults.liaison.tauxReussite > 80 ? '🎉 Excellente qualité de liaison' :
                     testResults.liaison.tauxReussite > 50 ? '⚠️ Qualité de liaison acceptable' :
                     '🚨 Problème critique de liaison'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Erreurs détectées */}
          {testResults.errors.length > 0 && (
            <div>
              <h4 style={{ color: '#dc3545' }}>❌ Erreurs Détectées</h4>
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

          {/* Recommandations */}
          <div style={{ 
            backgroundColor: '#d1ecf1', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #bee5eb',
            marginTop: '20px'
          }}>
            <h4 style={{ color: '#0c5460', marginTop: 0 }}>💡 Recommandations</h4>
            {testResults.errors.length === 0 ? (
              <p style={{ color: '#0c5460', margin: 0 }}>
                ✅ Tous les composants fonctionnent correctement. Les noms des employés devraient s'afficher dans ContractManagement.
              </p>
            ) : (
              <ul style={{ color: '#0c5460', margin: 0, paddingLeft: '20px' }}>
                <li>Vérifiez que le serveur backend fonctionne sur le port 5001</li>
                <li>Vérifiez que les routes API retournent les bonnes données</li>
                <li>Vérifiez la structure des tables en base de données</li>
                <li>Utilisez le composant DiagnosticNomsEmployes pour un diagnostic plus approfondi</li>
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h4>📋 Instructions</h4>
        <ol>
          <li><strong>Lancer le test:</strong> Cliquez sur "Lancer Test Rapide" pour vérifier l'état des données</li>
          <li><strong>Analyser les résultats:</strong> Regardez le résumé global et les détails de chaque composant</li>
          <li><strong>Suivre les recommandations:</strong> Appliquez les solutions suggérées selon les erreurs détectées</li>
          <li><strong>Diagnostic approfondi:</strong> Si des erreurs persistent, utilisez DiagnosticNomsEmployes</li>
        </ol>
      </div>
    </div>
  );
};

export default TestRapide;
