const io = require('socket.io-client');
const socket = io.connect('http://10.180.58.181:9510');

socket.on('connect', () => {
    console.log('Successfully conected!');
});

socket.on('task', (dados) => {
    console.log(dados.message);
});