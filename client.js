const io = require('socket.io-client');
const socket = io.connect('http://localhost:9510');

socket.on('connect', () => {
    console.log('Successfully conected!');
});

socket.on('chegou', (dados) => {
    console.log(dados.message);
});