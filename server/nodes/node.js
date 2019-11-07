const io = require('socket.io-client');
var checkWord = require('check-word'), words = checkWord('en'); // setup the language for check, default is en
const { checkCpu, checkMemory } = require('./calculeResources');

function checkResources() {
  console.log('Searching resources!');
}

var cpu = 0;

checkCpu(function(response){
  cpu = response;
});

var memory = checkMemory();

// call the first chunk of code right away
checkResources();

// call the rest of the code and have it execute after 3 seconds
setTimeout(startConnection, 3000);

function startConnection() {
  
  const socket = io.connect('http://10.180.58.181:9510');
  socket.on('connect', () => {
    console.log('Successfully connected!');
    socket.emit('resources', { cpu: cpu, memory: memory / 1024 })
  });

  socket.on('maketask', (dados) => {
    console.log(dados);
    var message = dados.dados.split(' ');
    var retorno = ''
    // console.log(message, retorno)
    for(var i = 0; i < message.length; i++){
      console.log(message[i]);
      if(!words.check(message[i])){
        retorno +=' '+message[i]
      }
    }
    console.log(retorno);
    socket.emit('result', { dados: retorno, id: socket.id });
  });
  
}
