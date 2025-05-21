import {io} from 'socket.io-client';

// const socket = io('https://1e7a-197-211-58-127.ngrok-free.app');
const socket = io('https://wellbeing-chat-production.up.railway.app', {
    transports: ['websocket'], // Force WebSocket (important for React Native)
  reconnection: true,        // Automatically reconnect if connection drops
  autoConnect: true, 
});

export default socket;
