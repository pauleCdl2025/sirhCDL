class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
  }

  connect() {
    try {
      // Désactiver temporairement les WebSockets pour éviter les erreurs
      console.log('WebSocket désactivé temporairement');
      return;
      
      // Code WebSocket original (commenté pour l'instant)
      /*
      this.ws = new WebSocket('ws://localhost:3000/ws');
      
      this.ws.onopen = () => {
        console.log('WebSocket connecté');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        console.log('Message reçu:', event.data);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket déconnecté');
        this.reconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };
      */
    } catch (error) {
      console.error('Erreur lors de la connexion WebSocket:', error);
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.log('Nombre maximum de tentatives de reconnexion atteint');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

export default WebSocketClient;














