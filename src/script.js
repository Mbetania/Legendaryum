import  io from 'socket.io-client';

// Connect to your server (replace the URL with yours)
const socket = io('http://localhost:3000');

// Define the room you're in
const room = 'room1';

// When you connect, join the room
socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('join', room);
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
