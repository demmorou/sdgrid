const io = require('socket.io-client');
// var checkWord = require('check-word'), words = checkWord('en'); // setup the language for check, default is en
var SpellChecker = require('simple-spellchecker');
var dictionary = SpellChecker.getDictionarySync("en-US"); 

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
  
  const socket = io.connect('http://192.168.18.3:9510');
  socket.on('connect', () => {
    console.log('Successfully connected!');
    socket.emit('resources', { cpu: cpu, memory: memory / 1024 })
  });

  socket.on('maketask', (dados) => {
    // console.log('Recebido:')
    // console.log(dados)
    var textoCorrigir = dados.dados.split(' ');
    var palavras = {}
    for(var i = 0; i < textoCorrigir.length; i++){
      if (!dictionary.spellCheck(textoCorrigir[i])) {
        palavras[textoCorrigir[i]] = dictionary.getSuggestions(textoCorrigir[i])
      }
    }
    var retorno = {idClient:dados.idClient, idMachine: socket.id, words: palavras}
    // console.log('Retornando:')
    // console.log(retorno);
    // socket.emit('result', retorno);
    socket.emit(socket.id, retorno)
    // console.log('Enviado!')
  });
  
}
