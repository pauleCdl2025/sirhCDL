import React, { useState, useEffect, useRef } from 'react';
import './EnhancedVoiceAssistant.css';

const EnhancedVoiceAssistant = ({ user, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentStatus, setAgentStatus] = useState('ready');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentQuery, setCurrentQuery] = useState('');
  const [responseText, setResponseText] = useState('');
  const [showWaveform, setShowWaveform] = useState(false);
  const [waveformData, setWaveformData] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState('voice');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [conversationContext, setConversationContext] = useState({});
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialiser l'assistant amélioré
  const initializeAssistant = async () => {
    try {
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
          // Ne pas redémarrer automatiquement l'écoute
          setIsListening(false);
          setAgentStatus('ready');
          setShowWaveform(false);
          stopWaveformAnimation();
          setCurrentQuery('');
        };
      }

      // Initialiser l'audio context pour la visualisation
      initializeAudioContext();

      // Message de bienvenue simple et discret
      setTimeout(() => {
        const welcomeMessage = "Bonjour ! Je suis Wally, votre assistant RH. Posez-moi vos questions.";
        setResponseText(welcomeMessage);
        
        const welcomeChatMessage = {
          id: Date.now(),
          type: 'assistant',
          text: welcomeMessage,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages([welcomeChatMessage]);
        
        // Ne pas parler automatiquement, juste afficher le message
        setTimeout(() => {
          setResponseText('');
        }, 3000);
      }, 500);

    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    }
  };

  // Générer un message de bienvenue personnalisé
  const generatePersonalizedWelcome = () => {
    const greetings = [
      `Bonjour ${user?.nom_prenom?.split(' ')[0] || 'collègue'} ! Je suis Wally, votre assistant RH intelligent.`,
      `Salut ${user?.nom_prenom?.split(' ')[0] || 'ami'} ! Prêt à explorer votre portail RH avec moi ?`,
      `Hello ${user?.nom_prenom?.split(' ')[0] || 'collaborateur'} ! Wally à votre service pour toutes vos questions RH.`
    ];
    
    const capabilities = [
      "Je peux vous aider avec vos documents, demandes, événements et bien plus encore.",
      "Ensemble, découvrons vos informations RH et optimisons votre expérience.",
      "Que puis-je faire pour vous aujourd'hui ? Je suis là pour simplifier votre quotidien RH."
    ];
    
    return `${greetings[Math.floor(Math.random() * greetings.length)]} ${capabilities[Math.floor(Math.random() * capabilities.length)]}`;
  };

  // Initialisation de l'assistant
  useEffect(() => {
    initializeAssistant();
    generateAIInsights();
    return () => {
      cleanup();
    };
  }, []);

  // Générer des insights IA
  const generateAIInsights = async () => {
    const insights = [
      {
        id: 1,
        type: 'personalization',
        title: 'Profil personnalisé détecté',
        content: `Bonjour ${user?.nom_prenom || 'utilisateur'}, je vois que vous êtes ${user?.poste_actuel || 'employé'} au Centre Diagnostic.`,
        confidence: 0.95,
        icon: '👤'
      },
      {
        id: 2,
        type: 'recommendation',
        title: 'Suggestion intelligente',
        content: 'Basé sur votre profil, je recommande de consulter vos documents RH récents.',
        confidence: 0.88,
        icon: '💡'
      },
      {
        id: 3,
        type: 'prediction',
        title: 'Prédiction comportementale',
        content: 'Vous semblez intéressé par les fonctionnalités RH. Je peux vous guider !',
        confidence: 0.82,
        icon: '🔮'
      }
    ];
    setAiInsights(insights);
  };

  // Initialiser le contexte audio
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

  // Parler avec IA avancée
  const speakWithAI = async (text) => {
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
          resolve();
        };
        
        speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  };

  // Gérer les commandes vocales avec IA - Réactif seulement
  const handleVoiceCommand = async (command) => {
    setIsProcessing(true);
    setAgentStatus('processing');
    
    try {
      const response = await processCommandWithAI(command);
      
      // Ajouter la réponse au chat sans parler automatiquement
      const assistantMessage = {
        id: Date.now(),
        type: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Parler seulement si l'utilisateur le demande explicitement
      if (command.toLowerCase().includes('parle') || command.toLowerCase().includes('dis')) {
        await speakWithAI(response.text);
      }
      
      if (response.actions && response.actions.length > 0) {
        executeActions(response.actions);
      }
      
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      const errorResponse = "Erreur. Reformulez votre question.";
      
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        text: errorResponse,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setAgentStatus('ready');
    }
  };

  // Gérer les commandes textuelles avec IA
  const handleTextCommand = async (text) => {
    if (!text.trim()) return;
    
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
      const response = await processCommandWithAI(text);
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Parler la réponse seulement si demandé explicitement
      if (chatMode === 'voice' && (text.toLowerCase().includes('parle') || text.toLowerCase().includes('dis'))) {
        await speakWithAI(response.text);
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
      
      // Ne pas parler automatiquement les erreurs
    } finally {
      setIsTyping(false);
    }
  };

  // Traitement intelligent des commandes avec IA - Réponses concises
  const processCommandWithAI = async (command) => {
    const lowerCommand = command.toLowerCase();
    
    // Analyse du contexte de conversation
    const context = analyzeConversationContext(command);
    setConversationContext(context);
    
    // Commandes de navigation - Réponses directes
    if (lowerCommand.includes('tableau de bord') || lowerCommand.includes('accueil')) {
      return {
        text: `Navigation vers le tableau de bord...`,
        actions: [{ type: 'navigate', target: '/employee-portal' }]
      };
    }
    
    if (lowerCommand.includes('documents') || lowerCommand.includes('mes documents')) {
      return {
        text: `Ouverture de vos documents...`,
        actions: [{ type: 'navigate', target: '/employee-portal/documents' }]
      };
    }
    
    if (lowerCommand.includes('demandes') || lowerCommand.includes('mes demandes')) {
      return {
        text: `Accès à vos demandes...`,
        actions: [{ type: 'navigate', target: '/employee-portal/requests' }]
      };
    }
    
    if (lowerCommand.includes('notes') || lowerCommand.includes('notes de service')) {
      return {
        text: `Consultation des notes de service...`,
        actions: [{ type: 'navigate', target: '/employee-portal/notes' }]
      };
    }
    
    if (lowerCommand.includes('événements') || lowerCommand.includes('calendrier')) {
      return {
        text: `Ouverture du calendrier des événements...`,
        actions: [{ type: 'navigate', target: '/employee-portal/events' }]
      };
    }
    
    if (lowerCommand.includes('profil') || lowerCommand.includes('mon profil')) {
      return {
        text: `Accès à votre profil...`,
        actions: [{ type: 'navigate', target: '/employee-portal/profile' }]
      };
    }

    // Commandes d'information RH - Réponses factuelles
    if (lowerCommand.includes('congé') || lowerCommand.includes('vacance')) {
      return {
        text: `Congés : 25 jours/an + congés maladie + maternité (14 semaines) + paternité (10 jours) + formation.`
      };
    }
    
    if (lowerCommand.includes('salaire') || lowerCommand.includes('rémunération')) {
      return {
        text: `Rémunération : Salaire compétitif + primes trimestrielles + avantages sociaux (mutuelle, prévoyance).`
      };
    }
    
    if (lowerCommand.includes('horaire') || lowerCommand.includes('travail')) {
      return {
        text: `Horaires : 8h-17h (lun-ven), pause 12h-13h. Flexibilité selon département.`
      };
    }

    // Commandes sur les procédures RH
    if (lowerCommand.includes('pointage') || lowerCommand.includes('pointeuse')) {
      return {
        text: `Pointage : Badge magnétique obligatoire sur les bornes. Gardez votre carte sur vous.`
      };
    }
    
    if (lowerCommand.includes('formation') || lowerCommand.includes('santymed')) {
      return {
        text: `Formations : Réglementaire obligatoire + SantyMed (sécurité) + continue (développement).`
      };
    }

    // Commandes de culture d'entreprise - Réponses courtes
    if (lowerCommand.includes('bonjour') || lowerCommand.includes('salut')) {
      return {
        text: `Bonjour ! Comment puis-je vous aider ?`
      };
    }
    
    if (lowerCommand.includes('aide') || lowerCommand.includes('que peux-tu faire')) {
      return {
        text: `Je peux vous aider avec : navigation, politiques RH, procédures, documents, demandes. Que voulez-vous savoir ?`
      };
    }
    
    if (lowerCommand.includes('merci') || lowerCommand.includes('au revoir')) {
      return {
        text: `De rien ! Autre chose ?`
      };
    }

    // Commande non reconnue - Réponse courte
    return {
      text: `Je n'ai pas compris. Dites "aide" pour voir mes fonctionnalités.`
    };
  };

  // Analyser le contexte de conversation
  const analyzeConversationContext = (command) => {
    const context = {
      userIntent: 'unknown',
      confidence: 0.5,
      suggestedActions: [],
      emotionalTone: 'neutral'
    };

    if (command.includes('?')) {
      context.userIntent = 'question';
      context.confidence = 0.8;
    } else if (command.includes('merci') || command.includes('aide')) {
      context.userIntent = 'gratitude';
      context.confidence = 0.9;
      context.emotionalTone = 'positive';
    } else if (command.includes('problème') || command.includes('erreur')) {
      context.userIntent = 'problem';
      context.confidence = 0.85;
      context.emotionalTone = 'concerned';
    }

    return context;
  };

  // Exécuter les actions
  const executeActions = (actions) => {
    actions.forEach(action => {
      if (action.type === 'navigate') {
        setTimeout(() => {
          window.location.href = action.target;
        }, 2000);
      }
    });
  };

  // Démarrer l'écoute
  const startListening = () => {
    if (recognitionRef.current && agentStatus === 'ready') {
      try {
        recognitionRef.current.start();
        console.log('🎤 Démarrage de l\'écoute améliorée...');
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
        console.log('🛑 Arrêt de l\'écoute améliorée...');
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

  // Soumettre le message textuel
  const handleSubmitText = (e) => {
    e.preventDefault();
    handleTextCommand(inputText);
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
    <div className="enhanced-voice-assistant">
      {/* Header ultra-moderne */}
      <div className="assistant-header-enhanced">
        <div className="header-content-enhanced">
          <div className="assistant-avatar-enhanced">
            <div className="avatar-container-enhanced">
              <div className="avatar-ring-enhanced"></div>
              <div className="avatar-core-enhanced">
                <span className="avatar-icon-enhanced">🤖</span>
              </div>
              <div className="avatar-pulse-enhanced"></div>
            </div>
          </div>
          
          <div className="assistant-info-enhanced">
            <h2 className="assistant-title-enhanced">Assistant RH Intelligent</h2>
            <p className="assistant-subtitle-enhanced">Centre Diagnostic de Libreville</p>
            <div className="status-container-enhanced">
              <div className={`status-pill-enhanced ${agentStatus}`}>
                <span className="status-dot-enhanced"></span>
                {agentStatus === 'ready' && 'Prêt'}
                {agentStatus === 'listening' && 'Écoute...'}
                {agentStatus === 'processing' && 'Traitement...'}
                {agentStatus === 'speaking' && 'Parle...'}
              </div>
              <div className="ai-indicator-enhanced">
                <span className="ai-icon-enhanced">🧠</span>
                <span>IA Active</span>
              </div>
            </div>
          </div>
        </div>
        
        <button className="close-button-enhanced" onClick={onClose}>
          <span className="close-icon-enhanced">×</span>
        </button>
      </div>

      {/* Contenu principal amélioré */}
      <div className="assistant-content-enhanced">
        {/* Section de contrôle ultra-moderne */}
        <div className="control-section-enhanced">
          <h2 className="control-title-enhanced">🎤 Contrôle Vocal Intelligent</h2>
          
          <div className="voice-controls-enhanced">
            {/* Bouton vocal principal ultra-moderne */}
            <button
              className={`voice-button-enhanced ${isListening ? 'listening' : ''}`}
              onClick={toggleVoiceRecognition}
              disabled={isProcessing || isSpeaking}
            >
              <span className="voice-icon-enhanced">
                {isListening ? '🔴' : isProcessing ? '⏳' : isSpeaking ? '🔊' : '🎤'}
              </span>
              <div className="voice-ripple-enhanced"></div>
            </button>

            {/* Boutons de contrôle secondaires */}
            <button
              className={`control-button-enhanced ${voiceEnabled ? 'active' : 'inactive'}`}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              <span>🔊</span>
              <span>{voiceEnabled ? 'Voix Activée' : 'Voix Désactivée'}</span>
            </button>

            {/* Bouton d'IA en arrière-plan */}
            <button
              className="control-button-enhanced ai-control-btn-enhanced"
              onClick={() => setShowAIPanel(!showAIPanel)}
              title="Afficher l'IA en arrière-plan"
            >
              <span>🧠</span>
              <span>IA Wally</span>
            </button>
          </div>

          {/* Basculement entre modes vocal et textuel */}
          <div className="mode-toggle-enhanced">
            <button
              className={`mode-button-enhanced ${chatMode === 'voice' ? 'active' : ''}`}
              onClick={() => setChatMode('voice')}
            >
              <span>🎤 Mode Vocal</span>
            </button>
            <button
              className={`mode-button-enhanced ${chatMode === 'text' ? 'active' : ''}`}
              onClick={() => setChatMode('text')}
            >
              <span>💬 Mode Texte</span>
            </button>
          </div>
        </div>

        {/* Interface de chat textuel ultra-moderne */}
        {chatMode === 'text' && (
          <div className="chat-section-enhanced">
            <div className="chat-header-enhanced">
              <h3>💬 Conversation avec Wally</h3>
              <div className="chat-status-enhanced">
                <span className="status-indicator-enhanced online"></span>
                <span>En ligne</span>
              </div>
            </div>
            
            <div className="chat-messages-enhanced">
              {chatMessages.map((message) => (
                <div key={message.id} className={`chat-message-enhanced ${message.type}`}>
                  <div className="message-content-enhanced">
                    <span className="message-text-enhanced">{message.text}</span>
                    <span className="message-time-enhanced">{message.timestamp}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message-enhanced assistant typing">
                  <div className="message-content-enhanced">
                    <span className="typing-indicator-enhanced">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <form className="chat-input-form-enhanced" onSubmit={handleSubmitText}>
              <div className="chat-input-container-enhanced">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tapez votre question RH ici..."
                  className="chat-input-enhanced"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  className="chat-send-button-enhanced"
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
          <div className="waveform-section-enhanced">
            <div className="waveform-container-enhanced">
              {waveformData.map((value, index) => (
                <div
                  key={index}
                  className="waveform-bar-enhanced"
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
          <div className="query-display-enhanced">
            <div className="query-container-enhanced">
              <span className="query-label-enhanced">🎯 Vous avez dit :</span>
              <span className="query-text-enhanced">{currentQuery}</span>
            </div>
          </div>
        )}

        {/* Affichage de la réponse ultra-moderne */}
        {responseText && (
          <div className="response-display-enhanced">
            <div className="response-container-enhanced">
              <span className="response-label-enhanced">💬 Réponse :</span>
              <span className="response-text-enhanced">{responseText}</span>
            </div>
          </div>
        )}

        {/* Section d'aide ultra-moderne */}
        <div className="help-section-enhanced">
          <h3 className="help-title-enhanced">🚀 Guide d'utilisation Intelligent</h3>
          
          <div className="commands-grid-enhanced">
            <div className="command-card-enhanced">
              <div className="command-icon-enhanced">🧭</div>
              <h4>Navigation</h4>
              <p>"Tableau de bord", "Mes documents", "Mes demandes"</p>
            </div>
            
            <div className="command-card-enhanced">
              <div className="command-icon-enhanced">📋</div>
              <h4>Informations RH</h4>
              <p>"Congés", "Salaire", "Horaires", "Formation"</p>
            </div>
            
            <div className="command-card-enhanced">
              <div className="command-icon-enhanced">⚙️</div>
              <h4>Procédures RH</h4>
              <p>"Pointage", "Recrutement", "Paie", "Discipline"</p>
            </div>
            
            <div className="command-card-enhanced">
              <div className="command-icon-enhanced">💬</div>
              <h4>Culture</h4>
              <p>"Bonjour", "Aide", "Que peux-tu faire ?"</p>
            </div>
          </div>
          
          <div className="usage-tip-enhanced">
            <div className="tip-header-enhanced">
              <span className="tip-icon-enhanced">💡</span>
              <h4>Conseil d'utilisation</h4>
            </div>
            <p>
              Cliquez sur "🎤" pour activer le microphone, puis posez votre question RH. 
              L'assistant répondra par écrit. Ajoutez "parle" ou "dis" pour une réponse vocale. 
              Utilisez le mode texte pour une interaction silencieuse.
            </p>
          </div>
        </div>
      </div>

      {/* Panneau d'IA en arrière-plan */}
      {showAIPanel && (
        <div className="ai-panel-overlay-enhanced">
          <div className="ai-panel-content-enhanced">
            <div className="ai-panel-header-enhanced">
              <h3>🧠 IA Wally - Analyse en Temps Réel</h3>
              <button onClick={() => setShowAIPanel(false)}>×</button>
            </div>
            <div className="ai-panel-body-enhanced">
              <div className="ai-insights-enhanced">
                <h4>Insights IA</h4>
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="insight-card-enhanced">
                    <span className="insight-icon-enhanced">{insight.icon}</span>
                    <div>
                      <h5>{insight.title}</h5>
                      <p>{insight.content}</p>
                      <span className="confidence-enhanced">{Math.round(insight.confidence * 100)}% confiance</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVoiceAssistant;
