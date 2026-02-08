/**
 * Utilitaire de normalisation des accents et caractères spéciaux
 * Corrige les problèmes d'encodage dans les données de la base de données
 */

/**
 * Normalise une chaîne de caractères en corrigeant les problèmes d'encodage
 * @param {string} text - Le texte à normaliser
 * @returns {string} - Le texte normalisé
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let normalized = text;

  // Correction pour 'š' (U+0161) -> 'è' (U+00E8)
  // Exemple: "Amakš" -> "Amakè"
  if (normalized.includes('š')) {
    normalized = normalized.replace(/š/g, 'è');
  }

  // Correction pour 'Š' (U+0160) -> 'è' (U+00E8) en minuscule
  // Dans les noms propres, on veut généralement 'è' en minuscule, pas 'È' en majuscule
  if (normalized.includes('Š')) {
    normalized = normalized.replace(/Š/g, 'è');
  }

  // Correction pour '‚' (U+201A) -> 'é' (U+00E9)
  // Le caractère '‚' qui remplace souvent 'é' dans les exports
  if (normalized.includes('‚')) {
    // Correction spécifique pour "Cong, pay," -> "Congé payé"
    if (normalized === 'Cong‚ pay‚' || normalized === 'Cong‚ payé' || normalized === 'Congé pay‚') {
      normalized = 'Congé payé';
    } else {
      // Correction générale pour les autres cas avec '‚'
      normalized = normalized.replace(/‚/g, 'é');
    }
  }

  // Correction pour '^' (U+005E) ou 'ˆ' (U+02C6) -> 'ê' (U+00EA)
  // Exemple: "Arr^t maladie" -> "Arrêt maladie"
  if (normalized.includes('^') || normalized.includes('ˆ')) {
    // Correction spécifique pour "Arr^t maladie" ou "Arrˆt maladie" -> "Arrêt maladie"
    if (normalized === 'Arr^t maladie' || normalized === 'Arrˆt maladie') {
      normalized = 'Arrêt maladie';
    } else {
      // Correction générale: remplacer ^ ou ˆ par ê dans les mots français
      // Pattern: lettre + ^/ˆ + lettre -> lettre + ê + lettre
      normalized = normalized.replace(/([a-zA-Z])(\^|ˆ)([a-zA-Z])/g, '$1ê$3');
    }
  }

  // Correction spécifique pour "Cration de poste" -> "Création de poste"
  if (normalized === 'Cration de poste' || normalized.includes('Cration de poste')) {
    normalized = normalized.replace(/Cration de poste/g, 'Création de poste');
  }

  return normalized;
}

/**
 * Normalise un objet en appliquant la normalisation à toutes les propriétés de type string
 * @param {Object} obj - L'objet à normaliser
 * @param {Array<string>} fields - Liste optionnelle des champs à normaliser (si non fournie, normalise tous les champs string)
 * @returns {Object} - L'objet normalisé
 */
function normalizeObject(obj, fields = null) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Si c'est un tableau, normaliser chaque élément
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeObject(item, fields));
  }

  const normalized = { ...obj };

  // Si des champs spécifiques sont fournis, ne normaliser que ceux-là
  if (fields && Array.isArray(fields)) {
    fields.forEach(field => {
      if (normalized[field] !== undefined && typeof normalized[field] === 'string') {
        normalized[field] = normalizeText(normalized[field]);
      }
    });
  } else {
    // Normaliser tous les champs de type string
    Object.keys(normalized).forEach(key => {
      if (typeof normalized[key] === 'string') {
        normalized[key] = normalizeText(normalized[key]);
      } else if (typeof normalized[key] === 'object' && normalized[key] !== null) {
        // Normaliser récursivement les objets imbriqués
        normalized[key] = normalizeObject(normalized[key], fields);
      }
    });
  }

  return normalized;
}

/**
 * Normalise les champs spécifiques pour chaque type d'entité
 */
const entityNormalizers = {
  // Normalisation pour les employés
  employee: (employee) => {
    const fields = [
      'nom_prenom', 'poste_actuel', 'type_contrat', 'functional_area',
      'entity', 'responsable', 'statut_employe', 'statut_marital',
      'niveau_etude', 'specialisation', 'type_remuneration', 'payment_mode',
      'categorie', 'lieu', 'adresse', 'nationalite', 'statut_dossier',
      'employee_type', 'anciennete', 'emergency_contact'
    ];
    return normalizeObject(employee, fields);
  },

  // Normalisation pour les congés
  conge: (conge) => {
    const fields = [
      'nom_employe', 'service', 'poste', 'type_conge', 'motif', 'statut'
    ];
    return normalizeObject(conge, fields);
  },

  // Normalisation pour les absences
  absence: (absence) => {
    const fields = [
      'nom_employe', 'service', 'poste', 'type_absence', 'motif', 'statut', 'remuneration'
    ];
    return normalizeObject(absence, fields);
  },

  // Normalisation pour les contrats
  contrat: (contrat) => {
    const fields = [
      'nom_employe', 'type_contrat', 'poste', 'service', 'contrat_content'
    ];
    return normalizeObject(contrat, fields);
  },

  // Normalisation pour les sanctions
  sanction: (sanction) => {
    const fields = [
      'nom_employe', 'type_sanction', 'contenu_sanction', 'statut'
    ];
    return normalizeObject(sanction, fields);
  },

  // Normalisation pour les notes
  note: (note) => {
    const fields = [
      'title', 'content', 'category', 'created_by', 'full_note_number'
    ];
    return normalizeObject(note, fields);
  },

  // Normalisation pour les événements
  evenement: (evenement) => {
    const fields = [
      'titre', 'description', 'lieu', 'type', 'organisateur'
    ];
    return normalizeObject(evenement, fields);
  },

  // Normalisation pour le recrutement
  recrutement: (recrutement) => {
    const fields = [
      'nom', 'prenom', 'departement', 'motif_recrutement', 'source_recrutement', 'source', 'type_contrat',
      'poste', 'poste_recrute', 'superieur_hierarchique', 'recruteur', 'notes'
    ];
    return normalizeObject(recrutement, fields);
  },

  // Normalisation pour les visites médicales
  visiteMedicale: (visite) => {
    const fields = [
      'nom_employe', 'type_visite', 'medecin', 'resultat', 'observations', 'statut'
    ];
    return normalizeObject(visite, fields);
  },

  // Normalisation pour les tâches
  task: (task) => {
    const fields = [
      'titre', 'description', 'assignee', 'status', 'priority', 'categorie'
    ];
    return normalizeObject(task, fields);
  },

  // Normalisation pour les entretiens
  interview: (interview) => {
    const fields = [
      'candidat_nom', 'candidat_prenom', 'poste', 'type_entretien', 'evaluateur',
      'notes', 'statut', 'resultat'
    ];
    return normalizeObject(interview, fields);
  },

  // Normalisation générique (normalise tous les champs string)
  generic: (obj) => {
    return normalizeObject(obj);
  }
};

/**
 * Normalise une entité selon son type
 * @param {Object|Array} data - Les données à normaliser
 * @param {string} entityType - Le type d'entité ('employee', 'conge', 'absence', etc.)
 * @returns {Object|Array} - Les données normalisées
 */
function normalizeEntity(data, entityType = 'generic') {
  if (!data) {
    return data;
  }

  const normalizer = entityNormalizers[entityType] || entityNormalizers.generic;

  if (Array.isArray(data)) {
    return data.map(item => normalizer(item));
  }

  return normalizer(data);
}

module.exports = {
  normalizeText,
  normalizeObject,
  normalizeEntity,
  entityNormalizers
};
