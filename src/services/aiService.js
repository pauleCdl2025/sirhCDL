// Service d'IA pour l'assistant vocal Wally
class AIService {
  constructor() {
    this.conversationContext = [];
    this.userPreferences = {};
    this.knowledgeBase = null;
  }

  // Initialiser le service avec la base de connaissances
  initialize(knowledgeBase) {
    this.knowledgeBase = knowledgeBase;
    this.conversationContext = [];
    this.userPreferences = {};
  }

  // Analyser le contexte de la conversation
  analyzeContext(userQuery, conversationHistory = []) {
    const context = {
      intent: this.detectIntent(userQuery),
      entities: this.extractEntities(userQuery),
      sentiment: this.analyzeSentiment(userQuery),
      userType: this.detectUserType(conversationHistory),
      urgency: this.detectUrgency(userQuery),
      previousTopics: this.extractPreviousTopics(conversationHistory)
    };
    
    return context;
  }

  // Détecter l'intention de l'utilisateur
  detectIntent(query) {
    const lowerQuery = query.toLowerCase();
    
    // Intents RH
    if (lowerQuery.includes('congé') || lowerQuery.includes('vacance') || lowerQuery.includes('repos')) {
      return 'leave_request';
    }
    if (lowerQuery.includes('salaire') || lowerQuery.includes('paie') || lowerQuery.includes('rémunération')) {
      return 'salary_info';
    }
    if (lowerQuery.includes('formation') || lowerQuery.includes('apprentissage') || lowerQuery.includes('développement')) {
      return 'training_request';
    }
    if (lowerQuery.includes('problème') || lowerQuery.includes('difficulté') || lowerQuery.includes('aide')) {
      return 'help_request';
    }
    if (lowerQuery.includes('procédure') || lowerQuery.includes('processus') || lowerQuery.includes('comment')) {
      return 'procedure_info';
    }
    if (lowerQuery.includes('politique') || lowerQuery.includes('règle') || lowerQuery.includes('norme')) {
      return 'policy_info';
    }
    
    // Intents de navigation
    if (lowerQuery.includes('aller') || lowerQuery.includes('naviguer') || lowerQuery.includes('accéder')) {
      return 'navigation';
    }
    
    // Intents généraux
    if (lowerQuery.includes('bonjour') || lowerQuery.includes('salut') || lowerQuery.includes('hello')) {
      return 'greeting';
    }
    if (lowerQuery.includes('merci') || lowerQuery.includes('thanks')) {
      return 'gratitude';
    }
    if (lowerQuery.includes('au revoir') || lowerQuery.includes('bye') || lowerQuery.includes('quitter')) {
      return 'farewell';
    }
    
    return 'general_inquiry';
  }

  // Extraire les entités importantes
  extractEntities(query) {
    const entities = {
      dates: this.extractDates(query),
      names: this.extractNames(query),
      departments: this.extractDepartments(query),
      amounts: this.extractAmounts(query),
      locations: this.extractLocations(query)
    };
    
    return entities;
  }

  // Extraire les dates
  extractDates(query) {
    const datePatterns = [
      /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,
      /\b(\d{1,2})\/(\d{1,2})\b/g,
      /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/gi,
      /\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/gi
    ];
    
    const dates = [];
    datePatterns.forEach(pattern => {
      const matches = query.match(pattern);
      if (matches) dates.push(...matches);
    });
    
    return dates;
  }

  // Extraire les noms
  extractNames(query) {
    const namePattern = /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g;
    const names = [];
    let match;
    
    while ((match = namePattern.exec(query)) !== null) {
      names.push(match[0]);
    }
    
    return names;
  }

  // Extraire les départements
  extractDepartments(query) {
    const departments = [
      'RH', 'Ressources Humaines', 'Comptabilité', 'Finance', 'Marketing', 'Ventes',
      'Production', 'Logistique', 'IT', 'Technologie', 'Administration', 'Direction'
    ];
    
    return departments.filter(dept => 
      query.toLowerCase().includes(dept.toLowerCase())
    );
  }

  // Extraire les montants
  extractAmounts(query) {
    const amountPattern = /\b(\d+(?:[.,]\d{2})?)\s*(?:euros?|€|fcfa|frs)\b/gi;
    const amounts = [];
    let match;
    
    while ((match = amountPattern.exec(query)) !== null) {
      amounts.push(match[0]);
    }
    
    return amounts;
  }

  // Extraire les localisations
  extractLocations(query) {
    const locations = [
      'Libreville', 'Gabon', 'Centre Diagnostic', 'Bureau', 'Salle de réunion',
      'Cafétéria', 'Parking', 'Entrée', 'Sortie'
    ];
    
    return locations.filter(location => 
      query.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Analyser le sentiment
  analyzeSentiment(query) {
    const positiveWords = [
      'merci', 'excellent', 'super', 'génial', 'parfait', 'bien', 'bon',
      'apprécier', 'aimer', 'satisfait', 'content', 'heureux'
    ];
    
    const negativeWords = [
      'problème', 'difficulté', 'souci', 'mauvais', 'nul', 'terrible',
      'fâché', 'mécontent', 'insatisfait', 'déçu', 'énervé'
    ];
    
    const lowerQuery = query.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (lowerQuery.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (lowerQuery.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Détecter le type d'utilisateur
  detectUserType(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) return 'new_user';
    
    const recentQueries = conversationHistory.slice(-5);
    const hasHRQueries = recentQueries.some(msg => {
      // Validation de sécurité pour éviter l'erreur toLowerCase
      if (!msg || typeof msg.text !== 'string') return false;
      const text = msg.text.toLowerCase();
      return text.includes('rh') || text.includes('ressources humaines');
    });
    
    if (hasHRQueries) return 'hr_user';
    
    const hasTechnicalQueries = recentQueries.some(msg => {
      // Validation de sécurité pour éviter l'erreur toLowerCase
      if (!msg || typeof msg.text !== 'string') return false;
      const text = msg.text.toLowerCase();
      return text.includes('technique') || text.includes('système');
    });
    
    if (hasTechnicalQueries) return 'technical_user';
    
    return 'general_user';
  }

  // Détecter l'urgence
  detectUrgency(query) {
    const urgentKeywords = [
      'urgent', 'immédiat', 'maintenant', 'tout de suite', 'rapidement',
      'problème', 'erreur', 'blocage', 'critique', 'important'
    ];
    
    const lowerQuery = query.toLowerCase();
    const urgencyScore = urgentKeywords.reduce((score, keyword) => {
      return score + (lowerQuery.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (urgencyScore >= 3) return 'high';
    if (urgencyScore >= 1) return 'medium';
    return 'low';
  }

  // Extraire les sujets précédents
  extractPreviousTopics(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) return [];
    
    const topics = [];
    const recentMessages = conversationHistory.slice(-10);
    
    recentMessages.forEach(message => {
      if (message && message.type === 'user' && typeof message.text === 'string') {
        const intent = this.detectIntent(message.text);
        if (!topics.includes(intent)) {
          topics.push(intent);
        }
      }
    });
    
    return topics;
  }

  // Générer une réponse intelligente
  async generateResponse(userQuery, conversationHistory = []) {
    try {
      // Analyser le contexte
      const context = this.analyzeContext(userQuery, conversationHistory);
      
      // Mettre à jour le contexte de conversation
      this.conversationContext.push({
        query: userQuery,
        context: context,
        timestamp: new Date()
      });
      
      // Limiter le contexte à 20 interactions
      if (this.conversationContext.length > 20) {
        this.conversationContext = this.conversationContext.slice(-20);
      }
      
      // Générer la réponse basée sur le contexte
      const response = await this.generateContextualResponse(context, userQuery);
      
      // Personnaliser la réponse selon les préférences utilisateur
      const personalizedResponse = this.personalizeResponse(response, context);
      
      return {
        text: personalizedResponse,
        context: context,
        confidence: this.calculateConfidence(context),
        suggestions: this.generateSuggestions(context),
        followUp: this.suggestFollowUp(context)
      };
      
    } catch (error) {
      console.error('Erreur lors de la génération de réponse:', error);
      return {
        text: "Je suis désolé, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?",
        context: null,
        confidence: 0,
        suggestions: [],
        followUp: null
      };
    }
  }

  // Générer une réponse contextuelle
  async generateContextualResponse(context, userQuery) {
    const { intent, sentiment, urgency, userType } = context;
    
    // Réponses de base selon l'intention
    let baseResponse = this.getBaseResponse(intent, userQuery);
    
    // Adapter selon le sentiment
    if (sentiment === 'negative') {
      baseResponse = this.addEmpathy(baseResponse);
    }
    
    // Adapter selon l'urgence
    if (urgency === 'high') {
      baseResponse = this.addUrgency(baseResponse);
    }
    
    // Adapter selon le type d'utilisateur
    baseResponse = this.adaptToUserType(baseResponse, userType);
    
    // Enrichir avec des informations contextuelles
    baseResponse = this.enrichWithContext(baseResponse, context);
    
    return baseResponse;
  }

  // Obtenir une réponse de base selon l'intention
  getBaseResponse(intent, userQuery) {
    const responses = {
      'leave_request': "Pour votre demande de congé, je peux vous guider sur les procédures. Avez-vous une date spécifique en tête ?",
      'salary_info': "Concernant votre salaire, je peux vous expliquer la structure de rémunération. Quelle information spécifique recherchez-vous ?",
      'training_request': "Pour la formation, nous avons plusieurs programmes disponibles. Quel domaine vous intéresse ?",
      'help_request': "Je suis là pour vous aider. Pouvez-vous me donner plus de détails sur votre situation ?",
      'procedure_info': "Je vais vous expliquer la procédure étape par étape. De quelle procédure s'agit-il exactement ?",
      'policy_info': "Je peux vous informer sur nos politiques. Quelle politique vous intéresse ?",
      'navigation': "Je vais vous guider vers la section appropriée. Où souhaitez-vous aller ?",
      'greeting': "Bonjour ! Je suis Wally, votre assistant RH. Comment puis-je vous aider aujourd'hui ?",
      'gratitude': "Je vous en prie ! C'est un plaisir de vous aider. Y a-t-il autre chose ?",
      'farewell': "Au revoir ! N'hésitez pas à revenir si vous avez d'autres questions. Bonne journée !",
      'general_inquiry': "Je comprends votre question. Laissez-moi vous donner une réponse précise et utile."
    };
    
    return responses[intent] || responses['general_inquiry'];
  }

  // Ajouter de l'empathie
  addEmpathy(response) {
    const empathyPhrases = [
      "Je comprends que cette situation peut être frustrante. ",
      "Je sais que ce n'est pas toujours facile. ",
      "Je suis là pour vous accompagner dans cette démarche. "
    ];
    
    const randomEmpathy = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
    return randomEmpathy + response;
  }

  // Ajouter un sentiment d'urgence
  addUrgency(response) {
    return "Cette demande semble importante. " + response + " Je vais vous donner une réponse prioritaire.";
  }

  // Adapter selon le type d'utilisateur
  adaptToUserType(response, userType) {
    const adaptations = {
      'hr_user': response + " En tant qu'utilisateur RH, vous avez accès à des informations détaillées.",
      'technical_user': response + " Je peux vous fournir des détails techniques si nécessaire.",
      'new_user': response + " N'hésitez pas à me poser des questions pour mieux comprendre nos services.",
      'general_user': response
    };
    
    return adaptations[userType] || response;
  }

  // Enrichir avec le contexte
  enrichWithContext(response, context) {
    let enrichedResponse = response;
    
    // Ajouter des informations sur les entités détectées
    if (context.entities.dates.length > 0) {
      enrichedResponse += ` J'ai noté les dates mentionnées : ${context.entities.dates.join(', ')}.`;
    }
    
    if (context.entities.departments.length > 0) {
      enrichedResponse += ` Concernant le(s) département(s) : ${context.entities.departments.join(', ')}.`;
    }
    
    // Ajouter des suggestions basées sur l'historique
    if (context.previousTopics.length > 0) {
      const recentTopic = context.previousTopics[context.previousTopics.length - 1];
      if (recentTopic !== context.intent) {
        enrichedResponse += ` Je vois que vous vous intéressez aussi à d'autres sujets.`;
      }
    }
    
    return enrichedResponse;
  }

  // Personnaliser la réponse
  personalizeResponse(response, context) {
    // Adapter le ton selon le sentiment
    if (context.sentiment === 'positive') {
      response = response.replace(/\.$/, ' !');
    }
    
    // Ajouter des détails personnalisés si disponibles
    if (this.userPreferences.language === 'en') {
      response = this.translateToEnglish(response);
    }
    
    return response;
  }

  // Calculer la confiance
  calculateConfidence(context) {
    let confidence = 0.5; // Base de confiance
    
    // Augmenter la confiance selon la clarté de l'intention
    if (context.intent !== 'general_inquiry') {
      confidence += 0.2;
    }
    
    // Augmenter selon la présence d'entités
    const entityCount = Object.values(context.entities).flat().length;
    confidence += Math.min(entityCount * 0.05, 0.2);
    
    // Ajuster selon l'historique
    if (this.conversationContext.length > 5) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  // Générer des suggestions
  generateSuggestions(context) {
    const suggestions = [];
    
    switch (context.intent) {
      case 'leave_request':
        suggestions.push(
          "Voir le calendrier des congés",
          "Calculer mes jours de congé restants",
          "Demander un congé exceptionnel"
        );
        break;
      case 'salary_info':
        suggestions.push(
          "Voir ma fiche de paie",
          "Comprendre ma grille salariale",
          "Calculer mes avantages sociaux"
        );
        break;
      case 'training_request':
        suggestions.push(
          "Voir les formations disponibles",
          "Demander un plan de développement",
          "Évaluer mes compétences"
        );
        break;
      default:
        suggestions.push(
          "Poser une autre question",
          "Naviguer vers une section",
          "Voir l'aide"
        );
    }
    
    return suggestions;
  }

  // Suggérer un suivi
  suggestFollowUp(context) {
    if (context.urgency === 'high') {
      return "Souhaitez-vous que je vous mette en relation avec un responsable RH ?";
    }
    
    if (context.intent === 'help_request') {
      return "Voulez-vous que je vous guide étape par étape ?";
    }
    
    return null;
  }

  // Traduire en anglais (simulation)
  translateToEnglish(text) {
    // Simulation simple de traduction
    const translations = {
      'Bonjour': 'Hello',
      'Je suis': 'I am',
      'votre assistant': 'your assistant',
      'Comment puis-je vous aider': 'How can I help you'
    };
    
    let translatedText = text;
    Object.entries(translations).forEach(([french, english]) => {
      translatedText = translatedText.replace(french, english);
    });
    
    return translatedText;
  }

  // Apprendre des préférences utilisateur
  learnFromInteraction(userQuery, userFeedback, responseQuality) {
    // Analyser la qualité de la réponse
    if (responseQuality === 'good') {
      this.userPreferences.successfulPatterns = this.userPreferences.successfulPatterns || [];
      this.userPreferences.successfulPatterns.push(userQuery.toLowerCase());
    }
    
    // Détecter la langue préférée
    if (userQuery.match(/[a-zA-Z]/) && !userQuery.match(/[éèêëàâäôöùûüç]/)) {
      this.userPreferences.language = 'en';
    } else {
      this.userPreferences.language = 'fr';
    }
    
    // Sauvegarder les préférences
    this.savePreferences();
  }

  // Sauvegarder les préférences
  savePreferences() {
    try {
      localStorage.setItem('wally_user_preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.warn('Impossible de sauvegarder les préférences:', error);
    }
  }

  // Charger les préférences
  loadPreferences() {
    try {
      const saved = localStorage.getItem('wally_user_preferences');
      if (saved) {
        this.userPreferences = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Impossible de charger les préférences:', error);
    }
  }

  // Obtenir des statistiques d'utilisation
  getUsageStats() {
    if (!this.conversationContext) {
      this.conversationContext = [];
    }
    
    return {
      totalInteractions: this.conversationContext.length,
      userType: this.detectUserType(this.conversationContext),
      preferredTopics: this.getPreferredTopics(),
      averageConfidence: this.getAverageConfidence(),
      lastInteraction: this.conversationContext.length > 0 ? 
        this.conversationContext[this.conversationContext.length - 1].timestamp : null
    };
  }

  // Obtenir les sujets préférés
  getPreferredTopics() {
    if (!this.conversationContext) {
      this.conversationContext = [];
    }
    
    const topicCounts = {};
    this.conversationContext.forEach(interaction => {
      if (interaction && interaction.context && interaction.context.intent) {
        const intent = interaction.context.intent;
        topicCounts[intent] = (topicCounts[intent] || 0) + 1;
      }
    });
    
    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  // Obtenir la confiance moyenne
  getAverageConfidence() {
    if (!this.conversationContext || this.conversationContext.length === 0) return 0;
    
    const totalConfidence = this.conversationContext.reduce((sum, interaction) => {
      if (interaction && interaction.context) {
        return sum + this.calculateConfidence(interaction.context);
      }
      return sum;
    }, 0);
    
    return totalConfidence / this.conversationContext.length;
  }

  // Réinitialiser le service
  reset() {
    this.conversationContext = [];
    this.userPreferences = {};
    this.loadPreferences();
  }
}

// Créer et exporter une instance singleton
const aiService = new AIService();

// Charger les préférences au démarrage
aiService.loadPreferences();

export default aiService;


