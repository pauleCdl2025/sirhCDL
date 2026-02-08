// Configuration de l'assistant vocal pour EmployeePortal

export const VOICE_CONFIG = {
  // Configuration de la reconnaissance vocale
  RECOGNITION: {
    LANGUAGE: 'fr-FR',
    CONTINUOUS: true,
    INTERIM_RESULTS: true,
    MAX_ALTERNATIVES: 1
  },

  // Configuration de la synthèse vocale
  SYNTHESIS: {
    LANGUAGE: 'fr-FR',
    RATE: 0.9,
    PITCH: 1,
    VOLUME: 1
  },

  // Commandes vocales disponibles
  COMMANDS: {
    // Navigation
    NAVIGATION: {
      DASHBOARD: {
        triggers: ['tableau de bord', 'accueil', 'accueil principal', 'page d\'accueil'],
        action: 'navigate',
        target: '/employee-portal',
        response: 'Je vous amène au tableau de bord.'
      },
      DOCUMENTS: {
        triggers: ['documents', 'mes documents', 'voir mes documents', 'accéder aux documents'],
        action: 'navigate',
        target: '/employee-portal/documents',
        response: 'Je vous amène à vos documents.'
      },
      REQUESTS: {
        triggers: ['demandes', 'mes demandes', 'voir mes demandes', 'accéder aux demandes'],
        action: 'navigate',
        target: '/employee-portal/requests',
        response: 'Je vous amène à vos demandes.'
      },
      NOTES: {
        triggers: ['notes', 'notes de service', 'voir les notes', 'accéder aux notes'],
        action: 'navigate',
        target: '/employee-portal/notes',
        response: 'Je vous amène aux notes de service.'
      },
      EVENTS: {
        triggers: ['événements', 'calendrier', 'voir les événements', 'accéder au calendrier'],
        action: 'navigate',
        target: '/employee-portal/events',
        response: 'Je vous amène aux événements.'
      },
      SANCTIONS: {
        triggers: ['sanctions', 'mes sanctions', 'voir mes sanctions', 'accéder aux sanctions'],
        action: 'navigate',
        target: '/employee-portal/sanctions',
        response: 'Je vous amène à vos sanctions.'
      },
      PROFILE: {
        triggers: ['profil', 'mon profil', 'voir mon profil', 'accéder à mon profil'],
        action: 'navigate',
        target: '/employee-portal/profile',
        response: 'Je vous amène à votre profil.'
      }
    },

    // Actions
    ACTIONS: {
      NEW_REQUEST: {
        triggers: ['nouvelle demande', 'créer une demande', 'faire une demande', 'demander quelque chose'],
        action: 'openModal',
        target: 'newRequest',
        response: 'Je vais vous aider à créer une nouvelle demande. Quel type de demande souhaitez-vous ?'
      },
      CHANGE_PASSWORD: {
        triggers: ['changer mot de passe', 'modifier mot de passe', 'changer le mot de passe', 'modifier le mot de passe'],
        action: 'openModal',
        target: 'changePassword',
        response: 'Je vais vous aider à changer votre mot de passe.'
      },
      LOGOUT: {
        triggers: ['déconnexion', 'se déconnecter', 'me déconnecter', 'fermer la session'],
        action: 'logout',
        target: null,
        response: 'Je vais vous déconnecter.'
      }
    },

    // Informations
    INFO: {
      HELP: {
        triggers: ['aide', 'que peux-tu faire', 'comment ça marche', 'que sais-tu faire'],
        action: 'help',
        target: null,
        response: 'Je peux vous aider à naviguer dans le portail, créer des demandes, consulter vos documents, et bien plus encore. Dites-moi ce que vous souhaitez faire !'
      },
      GREETING: {
        triggers: ['bonjour', 'salut', 'hello', 'coucou'],
        action: 'greeting',
        target: null,
        response: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?'
      },
      THANKS: {
        triggers: ['merci', 'au revoir', 'bye', 'à bientôt'],
        action: 'thanks',
        target: null,
        response: 'De rien ! N\'hésitez pas si vous avez d\'autres questions.'
      }
    }
  },

  // Messages d'erreur
  ERROR_MESSAGES: {
    COMMAND_NOT_UNDERSTOOD: 'Je n\'ai pas compris cette commande. Pouvez-vous reformuler ou dire "aide" pour connaître mes fonctionnalités ?',
    NAVIGATION_ERROR: 'Désolé, je n\'ai pas pu naviguer vers cette section. Veuillez réessayer.',
    ACTION_ERROR: 'Désolé, cette action n\'a pas pu être effectuée. Veuillez réessayer.',
    RECOGNITION_ERROR: 'Désolé, je n\'ai pas pu comprendre. Pouvez-vous répéter ?',
    SYNTHESIS_ERROR: 'Désolé, il y a eu un problème avec la synthèse vocale.'
  },

  // Messages de succès
  SUCCESS_MESSAGES: {
    COMMAND_EXECUTED: 'Commande exécutée avec succès.',
    NAVIGATION_SUCCESS: 'Navigation effectuée.',
    ACTION_SUCCESS: 'Action effectuée avec succès.'
  },

  // Configuration des animations
  ANIMATIONS: {
    PULSE_DURATION: 2000,
    BOUNCE_DURATION: 1000,
    RING_DURATION: 2000,
    MODAL_SLIDE_DURATION: 300
  },

  // Configuration des délais
  DELAYS: {
    ACTION_EXECUTION: 1000,
    RESPONSE_DISPLAY: 500,
    ERROR_RECOVERY: 2000
  },

  // Configuration des limites
  LIMITS: {
    MAX_CONVERSATION_HISTORY: 50,
    MAX_TRANSCRIPT_LENGTH: 1000,
    MAX_RESPONSE_LENGTH: 500
  }
};

// Fonctions utilitaires pour l'assistant vocal
export const VoiceUtils = {
  // Vérifier si une commande correspond à un déclencheur
  matchesCommand: (userInput, triggers) => {
    const lowerInput = userInput.toLowerCase();
    return triggers.some(trigger => lowerInput.includes(trigger.toLowerCase()));
  },

  // Trouver la commande correspondante
  findMatchingCommand: (userInput) => {
    const allCommands = [
      ...Object.values(VOICE_CONFIG.COMMANDS.NAVIGATION),
      ...Object.values(VOICE_CONFIG.COMMANDS.ACTIONS),
      ...Object.values(VOICE_CONFIG.COMMANDS.INFO)
    ];

    for (const command of allCommands) {
      if (VoiceUtils.matchesCommand(userInput, command.triggers)) {
        return command;
      }
    }
    return null;
  },

  // Formater une réponse personnalisée
  formatResponse: (response, user) => {
    if (response.includes('{userName}') && user?.nom_prenom) {
      const firstName = user.nom_prenom.split(' ')[0];
      return response.replace('{userName}', firstName);
    }
    return response;
  },

  // Valider une entrée vocale
  validateInput: (input) => {
    if (!input || input.trim().length === 0) {
      return false;
    }
    if (input.length > VOICE_CONFIG.LIMITS.MAX_TRANSCRIPT_LENGTH) {
      return false;
    }
    return true;
  },

  // Nettoyer une entrée vocale
  cleanInput: (input) => {
    return input
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\sàáâãäåçèéêëìíîïñòóôõöùúûüýÿ]/g, '');
  }
};

// Export des types de commandes
export const COMMAND_TYPES = {
  NAVIGATION: 'navigation',
  ACTION: 'action',
  INFO: 'info'
};

// Export des actions disponibles
export const AVAILABLE_ACTIONS = {
  NAVIGATE: 'navigate',
  OPEN_MODAL: 'openModal',
  LOGOUT: 'logout',
  HELP: 'help',
  GREETING: 'greeting',
  THANKS: 'thanks'
};












