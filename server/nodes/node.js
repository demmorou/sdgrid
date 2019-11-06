const io = require('socket.io-client');
const { checkCpu } = require('./calculeResources');

function checkResources() {
  console.log('Checking the resources!');
}

// const cpu = checkCpu();
console.log('ola',checkCpu());
// checkCpu();
// call the first chunk of code right away
checkResources();

// call the rest of the code and have it execute after 3 seconds
setTimeout(startConnection, 3000);

function startConnection() {
  const socket = io.connect('http://10.180.58.181:9510');
  socket.on('connect', () => {
    console.log('Successfully connected!');
  });

  socket.on('task', (dados) => {
    console.log(dados.message);
  });
}
