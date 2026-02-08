import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RH_KNOWLEDGE_BASE, AGENT_UTILS } from '../../data/rhKnowledgeBase';
import elevenLabsService from '../../services/elevenLabsService';
import aiService from '../../services/aiService';
import AIBackgroundPanel from './AIBackgroundPanel';
import './ModernVoiceAssistant.css';

const ModernVoiceAssistant = ({ user, onClose }) => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentStatus, setAgentStatus] = useState('ready');
  const [elevenLabsStatus, setElevenLabsStatus] = useState('checking');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentQuery, setCurrentQuery] = useState('');
  const [responseText, setResponseText] = useState('');
  const [showWaveform, setShowWaveform] = useState(false);
  const [waveformData, setWaveformData] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState('voice');
  const [showAIPanel, setShowAIPanel] = useState(false); // 'voice' ou 'text'
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialiser l'assistant moderne
  const initializeAssistant = useCallback(async () => {
    try {
      // Vérifier ElevenLabs
      const configResult = await elevenLabsService.checkConfiguration();
      if (configResult.success) {
        setElevenLabsStatus('connected');
        console.log('🚀 Assistant moderne connecté à ElevenLabs');
      } else {
        setElevenLabsStatus('error');
        console.warn('⚠️ ElevenLabs non disponible, mode local activé');
      }

      // Configuration de la reconnaissance vocale avancée
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'fr-FR';
        recognitionRef.current.maxAlternatives = 3;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setAgentStatus('listening');
          setShowWaveform(true);
          startWaveformAnimation();
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setCurrentQuery(finalTranscript);
            handleVoiceCommand(finalTranscript);
          } else {
            setCurrentQuery(interimTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Erreur de reconnaissance vocale:', event.error);
          if (event.error !== 'no-speech') {
            stopListening();
          }
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            // Redémarrer automatiquement si toujours en mode écoute
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.warn('Redémarrage automatique échoué:', error);
              stopListening();
            }
          }
        };
      }

      // Initialiser l'audio context pour la visualisation
      initializeAudioContext();

      // Message de bienvenue automatique puis passage en mode écoute
      setTimeout(() => {
        const welcomeMessage = "Bonjour, je suis Wally votre assistant RH. Que puis-je faire pour vous aujourd'hui ?";
        setResponseText(welcomeMessage);
        
        // Ajouter le message de bienvenue au chat
        const welcomeChatMessage = {
          id: Date.now(),
          type: 'assistant',
          text: welcomeMessage,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages([welcomeChatMessage]);
        
        // Dire le message de bienvenue
        speakWithElevenLabs(welcomeMessage).then(() => {
          // Après avoir fini de parler, passer automatiquement en mode écoute
          setTimeout(() => {
            startListening();
          }, 1000); // Attendre 1 seconde après la fin du message
        });
      }, 1000);

    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setElevenLabsStatus('error');
    }
  }, []);

  // Initialisation de l'assistant
  useEffect(() => {
    initializeAssistant();
    // Initialiser le service d'IA
    aiService.initialize(RH_KNOWLEDGE_BASE);
    return () => {
      cleanup();
    };
  }, [initializeAssistant]);

  // Initialiser le contexte audio pour la visualisation
  const initializeAudioContext = () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      setWaveformData(new Array(analyserRef.current.frequencyBinCount).fill(0));
    } catch (error) {
      console.warn('Contexte audio non disponible:', error);
    }
  };

  // Démarrer l'animation de la forme d'onde
  const startWaveformAnimation = () => {
    if (!analyserRef.current) return;

    const updateWaveform = () => {
      if (!isListening) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      setWaveformData(Array.from(dataArray));
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    };

    updateWaveform();
  };

  // Arrêter l'animation de la forme d'onde
  const stopWaveformAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Parler avec ElevenLabs ou fallback local
  const speakWithElevenLabs = async (text) => {
    return new Promise((resolve) => {
      if (elevenLabsStatus === 'connected' && voiceEnabled) {
        try {
          setIsSpeaking(true);
          setAgentStatus('speaking');
          setResponseText(text);
          
          elevenLabsService.synthesizeText(text).then(audioResult => {
            if (audioResult.success) {
              const audioURL = elevenLabsService.createAudioURL(audioResult.audioBlob);
              const audio = new Audio(audioURL);
              
              audio.onended = () => {
                setIsSpeaking(false);
                setAgentStatus('ready');
                setResponseText('');
                elevenLabsService.cleanupAudioURL(audioURL);
                resolve(); // Résoudre la Promise quand l'audio est terminé
              };
              
              audio.play();
            } else {
              speakLocally(text).then(() => {
                resolve(); // Résoudre immédiatement pour le fallback local
              });
            }
          }).catch(error => {
            console.warn('Synthèse ElevenLabs échouée, fallback local');
            speakLocally(text).then(() => {
              resolve(); // Résoudre immédiatement pour le fallback local
            });
          });
        } catch (error) {
          console.warn('Synthèse ElevenLabs échouée, fallback local');
          speakLocally(text).then(() => {
            resolve(); // Résoudre immédiatement pour le fallback local
          });
        }
      } else {
        speakLocally(text).then(() => {
          resolve(); // Résoudre immédiatement pour le fallback local
        });
      }
    });
  };

  // Synthèse vocale locale (fallback)
  const speakLocally = (text) => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => {
          setIsSpeaking(true);
          setAgentStatus('speaking');
          setResponseText(text);
        };
        
        utterance.onend = () => {
          setIsSpeaking(false);
          setAgentStatus('ready');
          setResponseText('');
          resolve(); // Résoudre la Promise quand la parole est terminée
        };
        
        speechSynthesis.speak(utterance);
      } else {
        resolve(); // Résoudre immédiatement si pas de synthèse vocale
      }
    });
  };

  // Gérer les commandes vocales
  const handleVoiceCommand = async (command) => {
    setIsProcessing(true);
    setAgentStatus('processing');
    
    try {
      const response = await processCommandIntelligently(command);
      
      // Attendre que la réponse soit prononcée avant de continuer
      await speakWithElevenLabs(response.text);
      
      if (response.actions && response.actions.length > 0) {
        executeActions(response.actions);
      }
      
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      const errorResponse = "Désolé, je n'ai pas pu traiter votre demande. Pouvez-vous reformuler ?";
      await speakWithElevenLabs(errorResponse);
    } finally {
      setIsProcessing(false);
      setAgentStatus('ready');
    }
  };

  // Gérer les commandes textuelles
  const handleTextCommand = async (text) => {
    if (!text.trim()) return;
    
    // Ajouter le message utilisateur au chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    try {
      const response = await processCommandIntelligently(text);
      
      // Ajouter la réponse de l'assistant au chat
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Parler la réponse si en mode vocal
      if (chatMode === 'voice') {
        await speakWithElevenLabs(response.text);
      }
      
      if (response.actions && response.actions.length > 0) {
        executeActions(response.actions);
      }
      
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      const errorResponse = "Désolé, je n'ai pas pu traiter votre demande. Pouvez-vous reformuler ?";
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: errorResponse,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      
      if (chatMode === 'voice') {
        await speakWithElevenLabs(errorResponse);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Soumettre le message textuel
  const handleSubmitText = (e) => {
    e.preventDefault();
    handleTextCommand(inputText);
  };



  // Traitement intelligent des commandes
  const processCommandIntelligently = async (command) => {
    const lowerCommand = command.toLowerCase();
    
    // Recherche dans la base de connaissances
    const knowledgeResult = AGENT_UTILS.searchKnowledge(command);
    if (knowledgeResult) {
      return formatKnowledgeResponse(knowledgeResult);
    }

    // Commandes de navigation
    if (lowerCommand.includes('tableau de bord') || lowerCommand.includes('accueil')) {
      return {
        text: "Je vous amène au tableau de bord. C'est votre espace de travail principal !",
        actions: [{ type: 'navigate', target: '/employee-portal' }]
      };
    }
    
    if (lowerCommand.includes('documents') || lowerCommand.includes('mes documents')) {
      return {
        text: "Je vous amène à vos documents. Vous y trouverez tous vos fichiers importants !",
        actions: [{ type: 'navigate', target: '/employee-portal/documents' }]
      };
    }
    
    if (lowerCommand.includes('demandes') || lowerCommand.includes('mes demandes')) {
      return {
        text: "Je vous amène à vos demandes. Suivez l'état de vos requêtes en temps réel !",
        actions: [{ type: 'navigate', target: '/employee-portal/requests' }]
      };
    }
    
    if (lowerCommand.includes('notes') || lowerCommand.includes('notes de service')) {
      return {
        text: "Je vous amène aux notes de service. Restez informé des dernières actualités !",
        actions: [{ type: 'navigate', target: '/employee-portal/notes' }]
      };
    }
    
    if (lowerCommand.includes('événements') || lowerCommand.includes('calendrier')) {
      return {
        text: "Je vous amène aux événements. Consultez le calendrier des activités !",
        actions: [{ type: 'navigate', target: '/employee-portal/events' }]
      };
    }
    
    if (lowerCommand.includes('sanctions') || lowerCommand.includes('mes sanctions')) {
      return {
        text: "Je vous amène à vos sanctions. Consultez votre dossier disciplinaire !",
        actions: [{ type: 'navigate', target: '/employee-portal/sanctions' }]
      };
    }
    
    if (lowerCommand.includes('profil') || lowerCommand.includes('mon profil')) {
      return {
        text: "Je vous amène à votre profil. Gérez vos informations personnelles !",
        actions: [{ type: 'navigate', target: '/employee-portal/profile' }]
      };
    }

    // Commandes d'information RH
    if (lowerCommand.includes('congé') || lowerCommand.includes('vacance')) {
      const conges = RH_KNOWLEDGE_BASE.politiques.conges;
      return {
        text: `Voici nos politiques de congés : ${conges.annuels}, ${conges.maladie}, ${conges.maternite}, ${conges.paternite}, et ${conges.formation}.`
      };
    }
    
    if (lowerCommand.includes('salaire') || lowerCommand.includes('rémunération')) {
      const remuneration = RH_KNOWLEDGE_BASE.politiques.remuneration;
      return {
        text: `Notre politique de rémunération inclut : ${remuneration.salaire}, ${remuneration.primes}, et ${remuneration.avantages}.`
      };
    }
    
    if (lowerCommand.includes('horaire') || lowerCommand.includes('travail')) {
      const horaires = RH_KNOWLEDGE_BASE.politiques.horaires;
      return {
        text: `Nos horaires de travail : ${horaires.standard}, ${horaires.pause}, et ${horaires.flexibilite}.`
      };
    }

    // Commandes sur les procédures RH
    if (lowerCommand.includes('pointage') || lowerCommand.includes('pointeuse')) {
      const pointage = RH_KNOWLEDGE_BASE.procedures.pointage;
      return {
        text: `Voici les informations sur le pointage : ${pointage.obligation}, ${pointage.utilisation}, ${pointage.cartes}, ${pointage.avantages}.`
      };
    }
    
    if (lowerCommand.includes('recrutement') || lowerCommand.includes('embauche')) {
      const recrutement = RH_KNOWLEDGE_BASE.procedures.recrutement;
      return {
        text: `Voici les informations sur le recrutement : ${recrutement.etapes}, ${recrutement.integration}, ${recrutement.documents}, ${recrutement.delai}.`
      };
    }
    
    if (lowerCommand.includes('paie') || lowerCommand.includes('paiement')) {
      const paie = RH_KNOWLEDGE_BASE.procedures.paie;
      return {
        text: `Voici les informations sur la paie : ${paie.periode}, ${paie.transmission}, ${paie.traitement}, ${paie.validation}, ${paie.paiement}.`
      };
    }
    
    if (lowerCommand.includes('discipline') || lowerCommand.includes('sanction')) {
      const discipline = RH_KNOWLEDGE_BASE.procedures.discipline;
      return {
        text: `Voici les informations sur la discipline : ${discipline.procedure}, ${discipline.sanctions}, ${discipline.transmission}.`
      };
    }
    
    if (lowerCommand.includes('formation') || lowerCommand.includes('santymed')) {
      const formation = RH_KNOWLEDGE_BASE.procedures.formation;
      return {
        text: `Voici les informations sur la formation : ${formation.reglementaire}, ${formation.santymed}, ${formation.continue}.`
      };
    }

    // Commandes de culture d'entreprise
    if (lowerCommand.includes('bonjour') || lowerCommand.includes('salut')) {
      const greeting = AGENT_UTILS.getRandomGreeting();
      const humor = AGENT_UTILS.getRandomHumor();
      return {
        text: `${greeting} ${humor}`
      };
    }
    
    if (lowerCommand.includes('aide') || lowerCommand.includes('que peux-tu faire')) {
      return {
        text: "Je suis votre assistant RH moderne ! Je peux vous aider avec les politiques RH, la navigation dans le portail, les informations sur le Centre Diagnostic de Libreville, et bien plus encore. Dites-moi ce que vous souhaitez savoir !"
      };
    }
    
    if (lowerCommand.includes('merci') || lowerCommand.includes('au revoir')) {
      const encouragement = AGENT_UTILS.getRandomEncouragement();
      return {
        text: `De rien ! ${encouragement} N'hésitez pas si vous avez d'autres questions.`
      };
    }

    // Commande non reconnue
    return {
      text: "Je n'ai pas compris cette commande. Pouvez-vous reformuler ou dire 'aide' pour connaître mes fonctionnalités ? Je suis là pour vous aider avec tout ce qui concerne les ressources humaines du Centre Diagnostic de Libreville."
    };
  };

  // Formater les réponses de la base de connaissances
  const formatKnowledgeResponse = (knowledgeResult) => {
    switch (knowledgeResult.type) {
      case 'faq':
        return {
          text: `${knowledgeResult.question} : ${knowledgeResult.reponse}`
        };
      
      case 'politique':
        const policyData = knowledgeResult.data;
        let response = "Voici les informations sur cette politique : ";
        for (const [key, value] of Object.entries(policyData)) {
          response += `${key} : ${value}. `;
        }
        return { text: response };
      
      case 'service':
        return {
          text: `Le service ${knowledgeResult.service} : ${knowledgeResult.description}`
        };
      
      case 'formation':
        const formationData = knowledgeResult.data;
        let formationResponse = "Voici nos programmes de formation : ";
        for (const [key, value] of Object.entries(formationData)) {
          formationResponse += `${key} : ${value}. `;
        }
        return { text: formationResponse };
      
      case 'procedure':
        const procedureData = knowledgeResult.data;
        let procedureResponse = `Voici les informations sur la procédure ${knowledgeResult.categorie} : `;
        for (const [key, value] of Object.entries(procedureData)) {
          procedureResponse += `${key} : ${value}. `;
        }
        return { text: procedureResponse };
      
      default:
        return {
          text: "J'ai trouvé des informations pertinentes dans ma base de connaissances. Pouvez-vous préciser votre question ?"
        };
    }
  };

  // Exécuter les actions
  const executeActions = (actions) => {
    actions.forEach(action => {
      if (action.type === 'navigate') {
        setTimeout(() => {
          navigate(action.target);
        }, 2000);
      } else if (action.type === 'logout') {
        setTimeout(() => {
          sessionStorage.removeItem('employeeUser');
          sessionStorage.removeItem('token');
          navigate('/EmployeeLogin');
        }, 2000);
      }
    });
  };

  // Démarrer l'écoute
  const startListening = () => {
    if (recognitionRef.current && agentStatus === 'ready') {
      try {
        recognitionRef.current.start();
        console.log('🎤 Démarrage de l\'écoute moderne...');
      } catch (error) {
        console.error('Erreur lors du démarrage:', error);
        stopListening();
      }
    }
  };

  // Arrêter l'écoute
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setAgentStatus('ready');
        setShowWaveform(false);
        stopWaveformAnimation();
        setCurrentQuery('');
        console.log('🛑 Arrêt de l\'écoute moderne...');
      } catch (error) {
        console.error('Erreur lors de l\'arrêt:', error);
      }
    }
  };

  // Basculer la reconnaissance vocale
  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Nettoyer les ressources
  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  return (
    <div className="modern-voice-assistant">
      {/* Header moderne avec effet glassmorphism */}
      <div className="assistant-header">
        <div className="header-content">
          <div className="assistant-avatar">
            <div className="avatar-container">
              <div className="avatar-ring"></div>
              <div className="avatar-core">
                <span className="avatar-icon">🤖</span>
              </div>
            </div>
          </div>
          
          <div className="assistant-info">
            <h2 className="assistant-title">Assistant RH Moderne</h2>
            <p className="assistant-subtitle">Centre Diagnostic de Libreville</p>
            <div className="status-container">
              <div className={`status-pill ${agentStatus}`}>
                <span className="status-dot"></span>
                {agentStatus === 'ready' && 'Prêt'}
                {agentStatus === 'listening' && 'Écoute...'}
                {agentStatus === 'processing' && 'Traitement...'}
                {agentStatus === 'speaking' && 'Parle...'}
              </div>
            </div>
          </div>
        </div>
        
        <button className="close-button" onClick={onClose}>
          <span className="close-icon">×</span>
        </button>
      </div>

      {/* Contenu principal */}
      <div className="assistant-content">
        {/* Section de contrôle ultra-moderne */}
        <div className="control-section">
          <h2 className="control-title">🎤 Contrôle Vocal</h2>
          
          <div className="voice-controls">
            {/* Bouton vocal principal ultra-moderne */}
            <button
              className={`voice-button ${isListening ? 'listening' : ''}`}
              onClick={toggleVoiceRecognition}
              disabled={isProcessing || isSpeaking}
            >
              <span className="voice-icon">
                {isListening ? '🔴' : isProcessing ? '⏳' : isSpeaking ? '🔊' : '🎤'}
              </span>
            </button>

            {/* Boutons de contrôle secondaires */}
            <button
              className={`control-button ${voiceEnabled ? 'active' : 'inactive'}`}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              <span>🔊</span>
              <span>{voiceEnabled ? 'Voix Activée' : 'Voix Désactivée'}</span>
            </button>

            {/* Bouton d'IA en arrière-plan */}
            <button
              className="control-button ai-control-btn"
              onClick={() => setShowAIPanel(!showAIPanel)}
              title="Afficher l'IA en arrière-plan"
            >
              <span>🧠</span>
              <span>IA Wally</span>
            </button>
          </div>

          {/* Basculement entre modes vocal et textuel */}
          <div className="mode-toggle">
            <button
              className={`mode-button ${chatMode === 'voice' ? 'active' : ''}`}
              onClick={() => setChatMode('voice')}
            >
              <span>🎤 Mode Vocal</span>
            </button>
            <button
              className={`mode-button ${chatMode === 'text' ? 'active' : ''}`}
              onClick={() => setChatMode('text')}
            >
              <span>💬 Mode Texte</span>
            </button>
          </div>
        </div>

        {/* Interface de chat textuel ultra-moderne */}
        {chatMode === 'text' && (
          <div className="chat-section">
            <div className="chat-header">
              <h3>💬 Conversation avec Wally</h3>
            </div>
            
            <div className="chat-messages">
              {chatMessages.map((message) => (
                <div key={message.id} className={`chat-message ${message.type}`}>
                  <div className="message-content">
                    <span className="message-text">{message.text}</span>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message assistant typing">
                  <div className="message-content">
                    <span className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <form className="chat-input-form" onSubmit={handleSubmitText}>
              <div className="chat-input-container">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tapez votre question RH ici..."
                  className="chat-input"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  className="chat-send-button"
                  disabled={!inputText.trim() || isTyping}
                >
                  ➤
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Visualisation des ondes ultra-moderne */}
        {showWaveform && (
          <div className="waveform-section">
            <div className="waveform-container">
              {waveformData.map((value, index) => (
                <div
                  key={index}
                  className="waveform-bar"
                  style={{
                    height: `${(value / 255) * 100}%`,
                    animationDelay: `${index * 0.05}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* Affichage des requêtes et réponses ultra-moderne */}
        {currentQuery && (
          <div className="query-display">
            <div className="query-container">
              <span className="query-label">🎯 Vous avez dit :</span>
              <span className="query-text">{currentQuery}</span>
            </div>
          </div>
        )}

        {/* Affichage de la réponse ultra-moderne */}
        {responseText && (
          <div className="response-display">
            <div className="response-container">
              <span className="response-label">💬 Réponse :</span>
              <span className="response-text">{responseText}</span>
            </div>
          </div>
        )}

        {/* Section d'aide ultra-moderne */}
        <div className="help-section">
          <h3 className="help-title">🚀 Guide d'utilisation</h3>
          
          <div className="commands-grid">
            <div className="command-card">
              <div className="command-icon">🧭</div>
              <h4>Navigation</h4>
              <p>"Tableau de bord", "Mes documents", "Mes demandes"</p>
            </div>
            
            <div className="command-card">
              <div className="command-icon">📋</div>
              <h4>Informations RH</h4>
              <p>"Congés", "Salaire", "Horaires", "Formation"</p>
            </div>
            
            <div className="command-card">
              <div className="command-icon">⚙️</div>
              <h4>Procédures RH</h4>
              <p>"Pointage", "Recrutement", "Paie", "Discipline"</p>
            </div>
            
            <div className="command-card">
              <div className="command-icon">💬</div>
              <h4>Culture</h4>
              <p>"Bonjour", "Aide", "Que peux-tu faire ?"</p>
            </div>
          </div>
          
          <div className="usage-tip">
            <div className="tip-header">
              <span className="tip-icon">💡</span>
              <h4>Conseil d'utilisation</h4>
            </div>
            <p>
              Cliquez sur "🎤" pour activer le microphone, puis posez votre question RH. 
              L'assistant traitera votre demande et vous répondra vocalement. 
              Vous pouvez aussi utiliser le mode texte pour une interaction écrite.
            </p>
          </div>
        </div>
      </div>

      {/* Panneau d'IA en arrière-plan */}
      <AIBackgroundPanel
        isVisible={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        conversationHistory={chatMessages}
        currentQuery={currentQuery}
      />
    </div>
  );
};

export default ModernVoiceAssistant;
