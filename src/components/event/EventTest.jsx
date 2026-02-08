import React, { useState } from 'react';
import { evenementService } from '../../services/api';

const EventTest = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testEventAPI = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      console.log('🧪 Test de l\'API des événements...');

      // Test 1: Récupérer tous les événements
      console.log('1️⃣ Test GET /evenements');
      try {
        const allEvents = await evenementService.getAll();
        console.log('GET /evenements - Données:', allEvents);
        setTestResult(prev => prev + '✅ GET /evenements: OK\n');
      } catch (error) {
        console.error('GET /evenements - Erreur:', error);
        setTestResult(prev => prev + `❌ GET /evenements: ${error.response?.status || 'Erreur'} - ${error.message}\n`);
      }

      // Test 2: Créer un événement de test
      console.log('2️⃣ Test POST /evenements');
      const testEvent = {
        name: 'Test Événement',
        date: '2024-12-25',
        location: 'Salle de test',
        description: 'Événement de test pour vérifier l\'API'
      };

      try {
        const createdEvent = await evenementService.create(testEvent);
        console.log('POST /evenements - Événement créé:', createdEvent);
        setTestResult(prev => prev + '✅ POST /evenements: OK\n');
        
        // Test 3: Supprimer l'événement de test
        if (createdEvent.id) {
          console.log('3️⃣ Test DELETE /evenements/:id');
          try {
            await evenementService.delete(createdEvent.id);
            setTestResult(prev => prev + '✅ DELETE /evenements/:id: OK\n');
          } catch (deleteError) {
            console.error('DELETE /evenements/:id - Erreur:', deleteError);
            setTestResult(prev => prev + `❌ DELETE /evenements/:id: ${deleteError.response?.status || 'Erreur'} - ${deleteError.message}\n`);
          }
        }
      } catch (createError) {
        console.error('POST /evenements - Erreur:', createError);
        setTestResult(prev => prev + `❌ POST /evenements: ${createError.response?.status || 'Erreur'} - ${createError.message}\n`);
      }

    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
      setTestResult(prev => prev + `❌ Erreur: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>🧪 Test de l'API des Événements</h5>
      </div>
      <div className="card-body">
        <button 
          className="btn btn-primary mb-3"
          onClick={testEventAPI}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Test en cours...
            </>
          ) : (
            'Lancer les tests'
          )}
        </button>

        {testResult && (
          <div className="mt-3">
            <h6>Résultats des tests:</h6>
            <pre className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTest;
