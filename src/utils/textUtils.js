// Fonction robuste pour décoder les entités HTML et corriger l'encodage
export const decodeHtmlEntities = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  let decoded = str;
  
  // Décoder les entités HTML courantes
  const htmlEntities = {
    '&eacute;': 'é',
    '&egrave;': 'è',
    '&agrave;': 'à',
    '&ocirc;': 'ô',
    '&ccedil;': 'ç',
    '&ucirc;': 'û',
    '&icirc;': 'î',
    '&acirc;': 'â',
    '&ecirc;': 'ê',
    '&Agrave;': 'À',
    '&Egrave;': 'È',
    '&Eacute;': 'É',
    '&Acirc;': 'Â',
    '&Ecirc;': 'Ê',
    '&Icirc;': 'Î',
    '&Ocirc;': 'Ô',
    '&Ucirc;': 'Û',
    '&Ccedil;': 'Ç',
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/'
  };
  
  // Remplacer les entités HTML
  for (const [entity, char] of Object.entries(htmlEntities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  
  // Décoder les entités numériques
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });
  
  // Corriger les caractères mal encodés spécifiques
  decoded = decoded.replace(/š/g, 'è');
  decoded = decoded.replace(/Š/g, 'È');
  
  // Corriger les cas spécifiques de l'image - Remplacer les virgules par é
  const specificCorrections = [
    { wrong: 'C,phora', correct: 'Céphora' },
    { wrong: 'M,decin', correct: 'Médecin' },
    { wrong: 'gyn,cologue', correct: 'gynécologue' },
    { wrong: 'Op,rateur', correct: 'Opérateur' },
    { wrong: 'secr,taire', correct: 'secrétaire' },
    { wrong: 'm,dicale', correct: 'médicale' },
    { wrong: 'r,nimateur', correct: 'réanimateur' },
    { wrong: 'sup,rieur', correct: 'supérieur' },
    { wrong: 'g,n,rale', correct: 'générale' },
    { wrong: 'Agnšs', correct: 'Agnès' },
    { wrong: 'Sosthšne', correct: 'Sosthène' },
    { wrong: 'VP-M,decin', correct: 'VP-Médecin' },
    { wrong: 'Technicien superieur', correct: 'Technicien supérieur' },
    { wrong: 'anesthesiste', correct: 'anesthésiste' },
    { wrong: 'biologie m,dicale', correct: 'biologie médicale' },
    { wrong: 'imagerie m,dicale', correct: 'imagerie médicale' },
    { wrong: 'C,libataire', correct: 'Célibataire' }
  ];
  
  specificCorrections.forEach(({ wrong, correct }) => {
    decoded = decoded.replace(new RegExp(wrong, 'g'), correct);
  });
  
  // Corriger les virgules qui remplacent les accents é - Approche plus robuste
  // Cette regex remplace les virgules par é quand elles sont suivies d'une lettre minuscule
  decoded = decoded.replace(/([A-Za-z]),(?=[a-z])/g, '$1é');
  
  // Corriger les cas où la virgule est suivie d'une lettre majuscule (comme dans "C,phora")
  decoded = decoded.replace(/([A-Za-z]),(?=[A-Z])/g, '$1é');
  
  // Corriger les cas où la virgule est à la fin d'un mot
  decoded = decoded.replace(/([A-Za-z]),/g, '$1é');
  
  // Corriger les cas spécifiques supplémentaires basés sur l'image
  const additionalCorrections = [
    { wrong: 'Equipière', correct: 'Équipière' },
    { wrong: 'Milène', correct: 'Milène' }, // Déjà correct
    { wrong: 'AmakÈ', correct: 'Amakè' },
    { wrong: 'BOUNGOUERE MABE C,phora', correct: 'BOUNGOUERE MABE Céphora' },
    { wrong: 'CHITOU Bilkis Epse SANMA Folachad, AmakÈ', correct: 'CHITOU Bilkis Epse SANMA Folachad, Amakè' }
  ];
  
  additionalCorrections.forEach(({ wrong, correct }) => {
    decoded = decoded.replace(new RegExp(wrong, 'g'), correct);
  });
  
  // Corriger les cas génériques de virgules qui remplacent é dans les mots français
  const frenchWordCorrections = [
    { pattern: /([A-Za-z]),rateur/g, replacement: '$1érateur' },
    { pattern: /([A-Za-z]),taire/g, replacement: '$1étaire' },
    { pattern: /([A-Za-z]),dicale/g, replacement: '$1édicale' },
    { pattern: /([A-Za-z]),nimateur/g, replacement: '$1éanimateur' },
    { pattern: /([A-Za-z]),rieur/g, replacement: '$1érieur' },
    { pattern: /([A-Za-z]),rale/g, replacement: '$1érale' },
    { pattern: /([A-Za-z]),decin/g, replacement: '$1édecin' },
    { pattern: /([A-Za-z]),dical/g, replacement: '$1édical' },
    { pattern: /([A-Za-z]),nique/g, replacement: '$1énique' },
    { pattern: /([A-Za-z]),trie/g, replacement: '$1étrie' },
    { pattern: /([A-Za-z]),rie/g, replacement: '$1érie' },
    { pattern: /([A-Za-z]),rieux/g, replacement: '$1érieux' },
    { pattern: /([A-Za-z]),rieuse/g, replacement: '$1érieuse' },
    { pattern: /([A-Za-z]),rieusement/g, replacement: '$1érieusement' }
  ];
  
  frenchWordCorrections.forEach(({ pattern, replacement }) => {
    decoded = decoded.replace(pattern, replacement);
  });
  
  return decoded;
};

// Fonction pour nettoyer et normaliser le texte
export const cleanText = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  let cleaned = decodeHtmlEntities(str);
  
  // Supprimer les espaces multiples
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Supprimer les espaces en début et fin
  cleaned = cleaned.trim();
  
  return cleaned;
};

// Fonction de debug pour tester le décodage
export const debugDecode = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  console.log('Original:', str);
  const decoded = decodeHtmlEntities(str);
  console.log('Decoded:', decoded);
  
  return decoded;
};

// Fonction de test pour vérifier le décodage
export const testDecode = () => {
  const testCases = [
    'C,phora',
    'M,decin',
    'gyn,cologue',
    'Op,rateur',
    'secr,taire',
    'm,dicale',
    'r,nimateur',
    'sup,rieur',
    'g,n,rale',
    'Agnšs',
    'Sosthšne',
    'VP-M,decin',
    'Technicien superieur',
    'biologie m,dicale',
    'imagerie m,dicale',
    'Equipière',
    'Milène',
    'AmakÈ',
    'BOUNGOUERE MABE C,phora',
    'CHITOU Bilkis Epse SANMA Folachad, AmakÈ',
    'C,libataire'
  ];
  
  console.log('=== Test de décodage ===');
  testCases.forEach(testCase => {
    const decoded = decodeHtmlEntities(testCase);
    console.log(`${testCase} -> ${decoded}`);
  });
  console.log('=== Fin du test ===');
};
