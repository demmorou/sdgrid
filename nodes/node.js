const io = require('socket.io-client');
// var checkWord = require('check-word'), words = checkWord('en'); // setup the language for check, default is en
var SpellChecker = require('simple-spellchecker');
var dictionary = SpellChecker.getDictionarySync("en-US");
const RSA = require('./rsa')

const seguranca = new RSA()
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
  var index;
  var chaveHeap;
  const socket = io.connect('http://10.180.50.218:9510');
  socket.on('connect', () => {
    console.log('Successfully connected!');
  });

  socket.on('publicKey', (chave) => {
    publicKeyHeap = chave;
    console.log(publicKeyHeap)
    var resources = {
      cpu: cpu,
      memory: memory / 1024,
      publicKey: seguranca.publicKey
    }
    console.log(resources)
    socket.emit('resources', seguranca.toEncrypt(resources, publicKeyHeap));
  });

  socket.on('index', (indexn)=>{
    index=indexn;
  });

  socket.on('getResources', () => {
    console.log('recebido')
    checkCpu(function(response){
      cpu = response;
    });
    memory = checkMemory();
    socket.emit('sendResources', {index:index, cpu:cpu, memory:memory})
  })

  socket.on('maketask', (dados) => {
    console.log(dados)
    // console.log(dados)
    var textoCorrigir = dados.dados.split(' ');
    var palavras = {}
    for(var i = 0; i < textoCorrigir.length; i++){
      if (!dictionary.spellCheck(textoCorrigir[i])) {
        palavras[textoCorrigir[i]] = dictionary.getSuggestions(textoCorrigir[i])
      }
    }
    var retorno = {
      idClient:dados.idClient,
      parte:dados.parte,
      totalPartes:dados.totalPartes,
      words: palavras
    }
    console.log(retorno)
    socket.emit('correcoes', retorno)
  });
  
}
