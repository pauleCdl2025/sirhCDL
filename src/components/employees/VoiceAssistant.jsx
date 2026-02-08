import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import elevenLabsService from '../../services/elevenLabsService';

const VoiceAssistant = ({ isOpen, onClose, user }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [agentInfo, setAgentInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);
  const navigate = useNavigate();

  // Configuration de la reconnaissance vocale et connexion ElevenLabs
  useEffect(() => {
    // Vérifier la configuration ElevenLabs
    const checkElevenLabsConfig = async () => {
      try {
        setConnectionStatus('connecting');
        const configResult = await elevenLabsService.checkConfiguration();
        if (configResult.success) {
          const agentResult = await elevenLabsService.getAgentInfo();
          if (agentResult.success) {
            setAgentInfo(agentResult.agent);
            setIsConnected(true);
            setConnectionStatus('connected');
            console.log('Agent Wally connecté:', agentResult.agent.name);
          } else {
            setConnectionStatus('error');
            console.warn('Impossible de récupérer l\'agent:', agentResult.message);
          }
        } else {
          setConnectionStatus('error');
          console.warn('Configuration ElevenLabs non valide:', configResult.message);
        }
      } catch (error) {
        setConnectionStatus('error');
        console.error('Erreur lors de la vérification ElevenLabs:', error);
      }
    };

    checkElevenLabsConfig();

    // Configuration de la reconnaissance vocale
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        if (isConnected && agentInfo) {
          speak(`Bonjour, je suis ${agentInfo.name}, votre assistant RH. Comment puis-je vous aider ?`);
        } else {
          speak('Je vous écoute, comment puis-je vous aider ?');
        }
      };
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleVoiceCommand(finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        setIsListening(false);
        speak('Désolé, je n\'ai pas pu comprendre. Pouvez-vous répéter ?');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [isConnected, agentInfo]);

  // Fonction de synthèse vocale locale (fallback)
  const speak = useCallback((text) => {
    if (synthesisRef.current && voiceEnabled) {
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        console.error('Erreur de synthèse vocale');
      };
      
      synthesisRef.current.speak(utterance);
    }
  }, [voiceEnabled]);

  // Gestion des commandes vocales avec ElevenLabs
  const handleVoiceCommand = useCallback(async (command) => {
    setIsProcessing(true);
    
    try {
      let assistantResponse = '';
      let action = null;
      let audioBlob = null;

      // Si ElevenLabs est connecté, utiliser l'agent Wally
      if (isConnected && agentInfo) {
        console.log('Traitement avec agent Wally:', command);
        
        // Traiter la commande avec l'agent ElevenLabs
        const result = await elevenLabsService.processVoiceCommand(command, user);
        
        if (result.success) {
          assistantResponse = result.textResponse || 'Commande traitée avec succès.';
          audioBlob = result.audioBlob;
          setCurrentConversationId(result.conversationId);
          
          // Traiter les actions retournées par l'agent
          if (result.actions && result.actions.length > 0) {
            for (const agentAction of result.actions) {
              if (agentAction.type === 'navigate') {
                action = () => navigate(agentAction.target);
                break;
              } else if (agentAction.type === 'open_modal') {
                // Logique pour ouvrir des modales
                console.log('Action modal:', agentAction);
              }
            }
          }
        } else {
          assistantResponse = result.message || 'Désolé, je n\'ai pas pu traiter votre demande.';
        }
      } else {
        // Fallback vers la logique locale si ElevenLabs n'est pas disponible
        const lowerCommand = command.toLowerCase();
        
        // Commandes de navigation
        if (lowerCommand.includes('tableau de bord') || lowerCommand.includes('accueil')) {
          assistantResponse = 'Je vous amène au tableau de bord.';
          action = () => navigate('/employee-portal');
        }
        else if (lowerCommand.includes('documents') || lowerCommand.includes('mes documents')) {
          assistantResponse = 'Je vous amène à vos documents.';
          action = () => navigate('/employee-portal/documents');
        }
        else if (lowerCommand.includes('demandes') || lowerCommand.includes('mes demandes')) {
          assistantResponse = 'Je vous amène à vos demandes.';
          action = () => navigate('/employee-portal/requests');
        }
        else if (lowerCommand.includes('notes') || lowerCommand.includes('notes de service')) {
          assistantResponse = 'Je vous amène aux notes de service.';
          action = () => navigate('/employee-portal/notes');
        }
        else if (lowerCommand.includes('événements') || lowerCommand.includes('calendrier')) {
          assistantResponse = 'Je vous amène aux événements.';
          action = () => navigate('/employee-portal/events');
        }
        else if (lowerCommand.includes('sanctions') || lowerCommand.includes('mes sanctions')) {
          assistantResponse = 'Je vous amène à vos sanctions.';
          action = () => navigate('/employee-portal/sanctions');
        }
        else if (lowerCommand.includes('profil') || lowerCommand.includes('mon profil')) {
          assistantResponse = 'Je vous amène à votre profil.';
          action = () => navigate('/employee-portal/profile');
        }
        else if (lowerCommand.includes('déconnexion') || lowerCommand.includes('se déconnecter')) {
          assistantResponse = 'Je vais vous déconnecter.';
          action = () => {
            sessionStorage.removeItem('employeeUser');
            sessionStorage.removeItem('token');
            navigate('/EmployeeLogin');
          };
        }
        else if (lowerCommand.includes('aide') || lowerCommand.includes('que peux-tu faire')) {
          assistantResponse = 'Je peux vous aider à naviguer dans le portail, créer des demandes, consulter vos documents, et bien plus encore. Dites-moi ce que vous souhaitez faire !';
        }
        else if (lowerCommand.includes('bonjour') || lowerCommand.includes('salut')) {
          assistantResponse = `Bonjour ${user?.nom_prenom ? user.nom_prenom.split(' ')[0] : ''} ! Comment puis-je vous aider aujourd'hui ?`;
        }
        else {
          assistantResponse = 'Je n\'ai pas compris cette commande. Pouvez-vous reformuler ou dire "aide" pour connaître mes fonctionnalités ?';
        }
      }

      // Mettre à jour la conversation
      const newConversation = [
        ...conversation,
        { type: 'user', text: command, timestamp: new Date() },
        { type: 'assistant', text: assistantResponse, timestamp: new Date() }
      ];
      
      setConversation(newConversation);
      setResponse(assistantResponse);
      
      // Exécuter l'action si elle existe
      if (action) {
        setTimeout(action, 1000);
      }
      
      // Si on a un audio d'ElevenLabs, le lire directement
      if (audioBlob) {
        const audioURL = elevenLabsService.createAudioURL(audioBlob);
        const audio = new Audio(audioURL);
        audio.onended = () => {
          elevenLabsService.cleanupAudioURL(audioURL);
        };
        audio.play();
      } else {
        // Sinon, utiliser la synthèse vocale locale
        speak(assistantResponse);
      }
      
    } catch (error) {
      console.error('Erreur lors du traitement de la commande vocale:', error);
      const errorResponse = 'Désolé, une erreur s\'est produite. Veuillez réessayer.';
      
      const newConversation = [
        ...conversation,
        { type: 'user', text: command, timestamp: new Date() },
        { type: 'assistant', text: errorResponse, timestamp: new Date() }
      ];
      
      setConversation(newConversation);
      setResponse(errorResponse);
      speak(errorResponse);
    } finally {
      setIsProcessing(false);
    }
  }, [conversation, navigate, speak, user, isConnected, agentInfo]);

  // Démarrer/arrêter l'écoute
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // Activer/désactiver la voix
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      synthesisRef.current?.cancel();
    }
  };

  // Effacer la conversation
  const clearConversation = () => {
    setConversation([]);
    setTranscript('');
    setResponse('');
  };

  // Terminer la conversation ElevenLabs
  const endElevenLabsConversation = useCallback(async () => {
    if (currentConversationId) {
      try {
        await elevenLabsService.endConversation(currentConversationId);
        setCurrentConversationId(null);
        console.log('Conversation ElevenLabs terminée');
      } catch (error) {
        console.error('Erreur lors de la terminaison de la conversation:', error);
      }
    }
  }, [currentConversationId]);

  // Nettoyer lors de la fermeture
  useEffect(() => {
    if (!isOpen) {
      endElevenLabsConversation();
    }
  }, [isOpen, endElevenLabsConversation]);

  if (!isOpen) return null;

  return (
    <div className="voice-assistant-modal">
      <div className="voice-assistant-content">
        {/* En-tête */}
        <div className="voice-assistant-header">
          <h3>
            <i className="fas fa-microphone-alt"></i>
            {agentInfo ? `${agentInfo.name} - Assistant RH` : 'Assistant Vocal'}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Statut de connexion ElevenLabs */}
        <div className="elevenlabs-status">
          <div className={`status-badge ${connectionStatus}`}>
            <i className={`fas ${connectionStatus === 'connected' ? 'fa-check-circle' : connectionStatus === 'connecting' ? 'fa-spinner fa-spin' : 'fa-exclamation-triangle'}`}></i>
            <span>
              {connectionStatus === 'connected' ? 'Connecté à ElevenLabs' : 
               connectionStatus === 'connecting' ? 'Connexion en cours...' : 
               'Erreur de connexion'}
            </span>
          </div>
          {agentInfo && (
            <div className="agent-info">
              <strong>Agent:</strong> {agentInfo.name}
              {agentInfo.description && <span> - {agentInfo.description}</span>}
            </div>
          )}
        </div>

        {/* Contrôles principaux */}
        <div className="voice-controls">
          <button
            className={`voice-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            disabled={isProcessing || connectionStatus === 'error'}
          >
            <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
            {isListening ? 'Arrêter l\'écoute' : 'Commencer l\'écoute'}
          </button>
          
          <button
            className={`voice-btn ${voiceEnabled ? 'enabled' : ''}`}
            onClick={toggleVoice}
          >
            <i className={`fas ${voiceEnabled ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
            {voiceEnabled ? 'Voix activée' : 'Voix désactivée'}
          </button>
        </div>

        {/* Statut */}
        <div className="voice-status">
          {isListening && (
            <div className="status-indicator listening">
              <i className="fas fa-microphone-alt"></i>
              <span>Écoute en cours...</span>
            </div>
          )}
          {isSpeaking && (
            <div className="status-indicator speaking">
              <i className="fas fa-volume-up"></i>
              <span>Parle...</span>
            </div>
          )}
          {isProcessing && (
            <div className="status-indicator processing">
              <i className="fas fa-cog fa-spin"></i>
              <span>Traitement en cours...</span>
            </div>
          )}
        </div>

        {/* Transcription */}
        {transcript && (
          <div className="transcript-section">
            <h4>Vous avez dit :</h4>
            <div className="transcript-text">{transcript}</div>
          </div>
        )}

        {/* Réponse de l'assistant */}
        {response && (
          <div className="response-section">
            <h4>Réponse de l'assistant :</h4>
            <div className="response-text">{response}</div>
          </div>
        )}

        {/* Historique de la conversation */}
        {conversation.length > 0 && (
          <div className="conversation-section">
            <div className="conversation-header">
              <h4>Historique de la conversation</h4>
              <button className="clear-btn" onClick={clearConversation}>
                <i className="fas fa-trash"></i>
                Effacer
              </button>
            </div>
            <div className="conversation-list">
              {conversation.map((message, index) => (
                <div key={index} className={`conversation-message ${message.type}`}>
                  <div className="message-header">
                    <span className="message-type">
                      {message.type === 'user' ? 'Vous' : 'Assistant'}
                    </span>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-text">{message.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aide et commandes disponibles */}
        <div className="help-section">
          <h4>Commandes vocales disponibles :</h4>
          <div className="commands-list">
            <div className="command-group">
              <h5>Navigation :</h5>
              <ul>
                <li>"Tableau de bord" ou "Accueil"</li>
                <li>"Documents" ou "Mes documents"</li>
                <li>"Demandes" ou "Mes demandes"</li>
                <li>"Notes de service"</li>
                <li>"Événements" ou "Calendrier"</li>
                <li>"Profil" ou "Mon profil"</li>
              </ul>
            </div>
            <div className="command-group">
              <h5>Actions :</h5>
              <ul>
                <li>"Nouvelle demande"</li>
                <li>"Changer mot de passe"</li>
                <li>"Déconnexion"</li>
              </ul>
            </div>
            <div className="command-group">
              <h5>Informations :</h5>
              <ul>
                <li>"Aide" ou "Que peux-tu faire"</li>
                <li>"Bonjour" ou "Salut"</li>
              </ul>
            </div>
          </div>
          
          {isConnected && agentInfo && (
            <div className="elevenlabs-help">
              <h5>🎯 Agent ElevenLabs activé</h5>
              <p>Votre agent <strong>{agentInfo.name}</strong> est connecté et peut traiter des demandes complexes en langage naturel.</p>
              <p>Vous pouvez lui poser des questions ouvertes sur vos droits, procédures RH, ou toute autre question liée à votre travail.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
