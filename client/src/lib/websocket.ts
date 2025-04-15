let socket: WebSocket | null = null;

export function setupWebSocket(): WebSocket {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }
  
  // Close existing socket if it exists
  if (socket) {
    socket.close();
  }
  
  // Create new WebSocket connection
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  socket = new WebSocket(wsUrl);
  
  // Setup event handlers
  socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
  });
  
  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  socket.addEventListener('close', () => {
    console.log('WebSocket connection closed');
    
    // Attempt to reconnect after a delay
    setTimeout(() => {
      if (socket?.readyState !== WebSocket.OPEN) {
        console.log('Attempting to reconnect WebSocket...');
        setupWebSocket();
      }
    }, 3000);
  });
  
  return socket;
}

// Function to send a message through the WebSocket
export function sendWebSocketMessage(type: string, payload: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not connected');
    return false;
  }
  
  try {
    socket.send(JSON.stringify({
      type,
      payload
    }));
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
}

// Function to update order status via WebSocket
export function updateOrderStatus(orderId: number, status: string) {
  return sendWebSocketMessage('orderStatusUpdate', {
    id: orderId,
    status
  });
}
