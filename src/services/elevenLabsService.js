// Service d'intégration ElevenLabs pour l'agent Wally
import axios from 'axios';

// Configuration ElevenLabs
const ELEVENLABS_CONFIG = {
  API_KEY: process.env.REACT_APP_ELEVENLABS_API_KEY || 'your-api-key-here',
  BASE_URL: 'https://api.elevenlabs.io/v1',
  AGENT_ID: 'gmGQBNkSt8ezmz8f21xi', // ID de votre agent Wally
  VOICE_ID: 'pNInz6obpgDQGcFmaJgB', // Voice ID par défaut (Adam)
  MODEL_ID: 'eleven_multilingual_v2' // Modèle multilingue
};

// Debug: Afficher la clé API chargée
console.log('🔑 ElevenLabs API Key loaded:', process.env.REACT_APP_ELEVENLABS_API_KEY ? '✅ Loaded' : '❌ Not loaded');
console.log('🔑 API Key value:', process.env.REACT_APP_ELEVENLABS_API_KEY);

// Instance axios configurée pour ElevenLabs
const elevenLabsAPI = axios.create({
  baseURL: ELEVENLABS_CONFIG.BASE_URL,
  headers: {
    'xi-api-key': ELEVENLABS_CONFIG.API_KEY,
    'Content-Type': 'application/json'
  }
});

class ElevenLabsService {
  constructor() {
    this.agentId = ELEVENLABS_CONFIG.AGENT_ID;
    this.voiceId = ELEVENLABS_CONFIG.VOICE_ID;
    this.modelId = ELEVENLABS_CONFIG.MODEL_ID;
  }

  // Vérifier la configuration
  async checkConfiguration() {
    try {
      // Test simple de la clé API avec l'endpoint /user
      const response = await elevenLabsAPI.get('/user');
      console.log('✅ Configuration ElevenLabs valide:', response.data);
      return {
        success: true,
        user: response.data,
        message: 'Configuration ElevenLabs valide'
      };
    } catch (error) {
      console.error('❌ Erreur de configuration ElevenLabs:', error);
      return {
        success: false,
        error: error.message,
        message: 'Vérifiez votre clé API ElevenLabs'
      };
    }
  }

  // Obtenir les informations de l'agent Wally (simulation)
  async getAgentInfo() {
    try {
      // Pour l'instant, simulons un agent Wally
      // Plus tard, nous pourrons utiliser l'API de conversation ElevenLabs
      const mockAgent = {
        id: this.agentId,
        name: 'Wally',
        description: 'Assistant RH intelligent',
        capabilities: ['conversation', 'text-to-speech', 'assistance']
      };
      
      return {
        success: true,
        agent: mockAgent,
        message: 'Agent Wally simulé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'agent:', error);
      return {
        success: false,
        error: error.message,
        message: 'Impossible de récupérer les informations de l\'agent'
      };
    }
  }

  // Démarrer une conversation avec l'agent Wally
  async startConversation(userContext = {}) {
    try {
      const response = await elevenLabsAPI.post(`/agents/${this.agentId}/conversations`, {
        user_context: {
          user_name: userContext.nom_prenom || 'Utilisateur',
          user_role: userContext.poste_actuel || 'Employé',
          user_entity: userContext.entity || 'Centre Diagnostic',
          ...userContext
        }
      });

      return {
        success: true,
        conversationId: response.data.conversation_id,
        message: 'Conversation démarrée avec Wally'
      };
    } catch (error) {
      console.error('Erreur lors du démarrage de la conversation:', error);
      return {
        success: false,
        error: error.message,
        message: 'Impossible de démarrer la conversation'
      };
    }
  }

  // Envoyer un message à l'agent Wally
  async sendMessage(conversationId, message, messageType = 'text') {
    try {
      const response = await elevenLabsAPI.post(`/agents/${this.agentId}/conversations/${conversationId}/messages`, {
        message: message,
        message_type: messageType
      });

      return {
        success: true,
        response: response.data,
        message: 'Message envoyé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return {
        success: false,
        error: error.message,
        message: 'Impossible d\'envoyer le message'
      };
    }
  }

  // Obtenir la réponse audio de l'agent
  async getAudioResponse(conversationId, messageId) {
    try {
      const response = await elevenLabsAPI.get(
        `/agents/${this.agentId}/conversations/${conversationId}/messages/${messageId}/audio`,
        {
          responseType: 'blob'
        }
      );

      return {
        success: true,
        audioBlob: response.data,
        message: 'Audio récupéré avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'audio:', error);
      return {
        success: false,
        error: error.message,
        message: 'Impossible de récupérer l\'audio'
      };
    }
  }

  // Synthétiser du texte en audio avec la voix configurée
  async synthesizeText(text, voiceId = null) {
    try {
      const targetVoiceId = voiceId || this.voiceId;
      
      const response = await elevenLabsAPI.post(`/text-to-speech/${targetVoiceId}`, {
        text: text,
        model_id: this.modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }, {
        responseType: 'blob'
      });

      return {
        success: true,
        audioBlob: response.data,
        message: 'Texte synthétisé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la synthèse vocale:', error);
      return {
        success: false,
        error: error.message,
        message: 'Impossible de synthétiser le texte'
      };
    }
  }

  // Obtenir la liste des voix disponibles
  async getAvailableVoices() {
    try {
      const response = await elevenLabsAPI.get('/voices');
      return {
        success: true,
        voices: response.data.voices,
        message: 'Voix récupérées avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des voix:', error);
      return {
        success: false,
        error: error.message,
        message: 'Impossible de récupérer les voix'
      };
    }
  }

  // Terminer une conversation
  async endConversation(conversationId) {
    try {
      await elevenLabsAPI.delete(`/agents/${this.agentId}/conversations/${conversationId}`);
      return {
        success: true,
        message: 'Conversation terminée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la terminaison de la conversation:', error);
      return {
        success: false,
        error: error.message,
        message: 'Impossible de terminer la conversation'
      };
    }
  }

  // Obtenir l'historique des conversations
  async getConversationHistory(conversationId) {
    try {
      const response = await elevenLabsAPI.get(`/agents/${this.agentId}/conversations/${conversationId}/messages`);
      return {
        success: true,
        messages: response.data.messages,
        message: 'Historique récupéré avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return {
        success: false,
        error: error.message,
        message: 'Impossible de récupérer l\'historique'
      };
    }
  }

  // Traiter une commande vocale avec l'agent Wally
  async processVoiceCommand(command, userContext = {}) {
    try {
      // Démarrer une conversation
      const conversationResult = await this.startConversation(userContext);
      if (!conversationResult.success) {
        return conversationResult;
      }

      const conversationId = conversationResult.conversationId;

      // Envoyer la commande
      const messageResult = await this.sendMessage(conversationId, command);
      if (!messageResult.success) {
        return messageResult;
      }

      // Attendre la réponse de l'agent
      const response = messageResult.response;
      
      // Si l'agent a une réponse textuelle
      if (response.text_response) {
        // Synthétiser la réponse en audio
        const audioResult = await this.synthesizeText(response.text_response);
        
        return {
          success: true,
          conversationId: conversationId,
          textResponse: response.text_response,
          audioBlob: audioResult.success ? audioResult.audioBlob : null,
          actions: response.actions || [],
          message: 'Commande traitée avec succès'
        };
      }

      return {
        success: true,
        conversationId: conversationId,
        response: response,
        message: 'Commande traitée avec succès'
      };

    } catch (error) {
      console.error('Erreur lors du traitement de la commande vocale:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors du traitement de la commande'
      };
    }
  }

  // Créer un URL pour l'audio
  createAudioURL(audioBlob) {
    if (audioBlob) {
      return URL.createObjectURL(audioBlob);
    }
    return null;
  }

  // Nettoyer les ressources audio
  cleanupAudioURL(audioURL) {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  }
}

// Instance unique du service
const elevenLabsService = new ElevenLabsService();

export default elevenLabsService;
export { ELEVENLABS_CONFIG };
