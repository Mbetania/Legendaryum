import  io from 'socket.io-client';

// Connect to your server (replace the URL with yours)
const socket = io('http://localhost:3000');

// Define the room you're in
const room = 'b97f1767-622b-4797-9cd2-7560e59e81f1';
const userId = "2799a2a2-b7f3-4ef7-a60d-d1d518044788";

// When you connect, join the room
socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('join room', { roomId: room, userId: userId });
});

// Listen for the coins received from the server
socket.on('coins', (coins) => {
  console.log('Coins received: ', coins);
});

// Listen when a coin becomes unavailable
socket.on('coinUnavailable', (coinId) => {
  console.log('Coin unavailable: ', coinId);
});

// You can define a function to grab coins
export const grabCoin = (coinId) => {
  socket.emit('grabCoin', { id: coinId, room });
}
