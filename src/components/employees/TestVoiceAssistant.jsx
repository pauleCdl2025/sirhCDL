import React, { useState, useEffect, useRef } from 'react';
import './ModernVoiceAssistant.css';

const TestVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState('Assistant vocal de test - Cliquez pour commencer');
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    console.log('🔍 TestVoiceAssistant: Composant monté');
    
    // Test de disponibilité de la reconnaissance vocale
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      console.log('✅ Reconnaissance vocale disponible');
      setMessage('Reconnaissance vocale disponible - Cliquez pour tester');
    } else {
      console.log('❌ Reconnaissance vocale non disponible');
      setMessage('Reconnaissance vocale non disponible dans ce navigateur');
      setError('Navigateur non compatible');
    }

    return () => {
      console.log('🔍 TestVoiceAssistant: Composant démonté');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    try {
      console.log('🎤 Démarrage de l\'écoute...');
      setStatus('starting');
      setMessage('Démarrage de l\'écoute...');
      setError(null);

      // Créer une nouvelle instance de reconnaissance vocale
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configuration
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.maxAlternatives = 1;

      // Gestionnaires d'événements
      recognitionRef.current.onstart = () => {
        console.log('✅ Écoute démarrée');
        setIsListening(true);
        setStatus('listening');
        setMessage('🎤 Écoute en cours... Parlez maintenant');
      };

      recognitionRef.current.onresult = (event) => {
        console.log('📝 Résultat reçu:', event);
        const transcript = event.results[0][0].transcript;
        console.log('🗣️ Transcription:', transcript);
        setMessage(`🎯 Reçu: "${transcript}"`);
        setStatus('result');
        
        // Arrêter automatiquement après un résultat
        setTimeout(() => {
          stopListening();
        }, 2000);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('❌ Erreur de reconnaissance vocale:', event.error);
        setError(`Erreur: ${event.error}`);
        setStatus('error');
        setMessage(`❌ Erreur: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log('🛑 Écoute terminée');
        setIsListening(false);
        if (status !== 'error') {
          setStatus('ready');
          setMessage('Assistant vocal de test - Cliquez pour recommencer');
        }
      };

      // Démarrer l'écoute
      recognitionRef.current.start();
      
    } catch (error) {
      console.error('💥 Erreur lors du démarrage:', error);
      setError(error.message);
      setStatus('error');
      setMessage(`💥 Erreur: ${error.message}`);
    }
  };

  const stopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        console.log('🛑 Arrêt de l\'écoute');
      }
    } catch (error) {
      console.error('💥 Erreur lors de l\'arrêt:', error);
    }
  };

  const testMicrophone = () => {
    console.log('🎤 Test du microphone...');
    setMessage('🎤 Test du microphone...');
    
    // Test simple d'accès au microphone
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log('✅ Microphone accessible');
          setMessage('✅ Microphone accessible et fonctionnel');
          setStatus('ready');
          
          // Arrêter le stream
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(error => {
          console.error('❌ Erreur d\'accès au microphone:', error);
          setError(error.message);
          setMessage(`❌ Erreur microphone: ${error.message}`);
          setStatus('error');
        });
    } else {
      console.log('❌ getUserMedia non supporté');
      setMessage('❌ getUserMedia non supporté dans ce navigateur');
      setStatus('error');
    }
  };

  const resetAssistant = () => {
    console.log('🔄 Réinitialisation de l\'assistant...');
    setStatus('ready');
    setMessage('Assistant vocal de test - Cliquez pour commencer');
    setError(null);
    setIsListening(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  return (
    <div className="test-voice-assistant">
      <div className="test-header">
        <h2>🧪 Test Assistant Vocal Wally</h2>
        <p>Composant de test pour diagnostiquer les problèmes</p>
      </div>

      <div className="test-status">
        <div className={`status-indicator ${status}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {status === 'ready' && '🟢 Prêt'}
            {status === 'starting' && '🟡 Démarrage...'}
            {status === 'listening' && '🔴 Écoute...'}
            {status === 'result' && '🟢 Résultat reçu'}
            {status === 'error' && '🔴 Erreur'}
          </span>
        </div>
      </div>

      <div className="test-message">
        <p>{message}</p>
        {error && (
          <div className="error-message">
            <strong>Erreur:</strong> {error}
          </div>
        )}
      </div>

      <div className="test-controls">
        <button 
          onClick={startListening}
          disabled={isListening || status === 'starting'}
          className="test-button start"
        >
          {isListening ? '🎤 Écoute...' : '🎤 Démarrer l\'écoute'}
        </button>

        <button 
          onClick={stopListening}
          disabled={!isListening}
          className="test-button stop"
        >
          🛑 Arrêter
        </button>

        <button 
          onClick={testMicrophone}
          className="test-button test"
        >
          🎤 Tester Microphone
        </button>

        <button 
          onClick={resetAssistant}
          className="test-button reset"
        >
          🔄 Réinitialiser
        </button>
      </div>

      <div className="test-info">
        <h3>📋 Informations de débogage</h3>
        <ul>
          <li><strong>Navigateur:</strong> {navigator.userAgent}</li>
          <li><strong>Reconnaissance vocale:</strong> {'webkitSpeechRecognition' in window || 'SpeechRecognition' in window ? '✅ Disponible' : '❌ Non disponible'}</li>
          <li><strong>getUserMedia:</strong> {navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? '✅ Supporté' : '❌ Non supporté'}</li>
          <li><strong>HTTPS:</strong> {window.location.protocol === 'https:' ? '✅ Sécurisé' : '⚠️ Non sécurisé (peut causer des problèmes)'}</li>
        </ul>
      </div>

      <div className="test-logs">
        <h3>📝 Logs de la console</h3>
        <p>Ouvrez la console du navigateur (F12) pour voir les logs détaillés</p>
        <div className="log-tips">
          <h4>💡 Conseils de débogage:</h4>
          <ul>
            <li>Vérifiez que le microphone est autorisé</li>
            <li>Assurez-vous qu'aucune autre application n'utilise le microphone</li>
            <li>Testez dans Chrome ou Edge pour un meilleur support</li>
            <li>Vérifiez les erreurs dans l'onglet Console</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestVoiceAssistant;










