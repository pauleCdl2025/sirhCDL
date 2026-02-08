import { useState, useEffect } from 'react';
import { requestService } from '../services/api';
import { useWebSocket } from './useWebSocket';

export const usePendingRequestsCount = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isConnected } = useWebSocket();

  const fetchPendingCount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await requestService.getPendingCount();
      setPendingCount(data.pendingCount);
    } catch (err) {
      console.error('Error fetching pending requests count:', err);
      setError(err.message);
      setPendingCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    
    // Actualiser toutes les 30 secondes seulement si WebSocket n'est pas connecté
    const interval = setInterval(() => {
      if (!isConnected) {
        fetchPendingCount();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isConnected]);

  // Écouter les événements WebSocket pour les mises à jour en temps réel
  useEffect(() => {
    if (!isConnected) return;

    // Écouter les événements de traitement des demandes
    const handleRequestProcessed = () => {
      console.log('🔄 Demande traitée, mise à jour du compteur...');
      fetchPendingCount();
    };

    // Écouter les nouvelles demandes
    const handleNewRequest = () => {
      console.log('📝 Nouvelle demande reçue, mise à jour du compteur...');
      fetchPendingCount();
    };

    // Ajouter les écouteurs d'événements personnalisés
    window.addEventListener('requestProcessed', handleRequestProcessed);
    window.addEventListener('newRequest', handleNewRequest);

    return () => {
      window.removeEventListener('requestProcessed', handleRequestProcessed);
      window.removeEventListener('newRequest', handleNewRequest);
    };
  }, [isConnected]);

  return {
    pendingCount,
    isLoading,
    error,
    refresh: fetchPendingCount
  };
};
