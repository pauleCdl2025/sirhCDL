import React, { useState, useEffect } from 'react';

const OnboardingTest = () => {
  const [count, setCount] = useState(0);
  const [matricule, setMatricule] = useState('');

  // Test simple - exécuté une seule fois
  useEffect(() => {
    console.log('OnboardingTest monté - génération du matricule');
    const generateMatricule = () => {
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-4);
      return `CDL-${year}-${timestamp}`;
    };

    setMatricule(generateMatricule());
  }, []); // Dépendances vides = exécuté une seule fois

  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  console.log('OnboardingTest rendu - count:', count, 'matricule:', matricule);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Test Onboarding - Pas de boucle infinie</h3>
      <p>Compteur: {count}</p>
      <p>Matricule: {matricule}</p>
      <button onClick={handleIncrement}>
        Incrémenter ({count})
      </button>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Si ce composant fonctionne sans erreur, le problème de boucle infinie est résolu.
      </p>
    </div>
  );
};

export default OnboardingTest;

