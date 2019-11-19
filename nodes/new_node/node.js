const io = require('socket.io-client');
// const SpellChecker = require('simple-spellchecker');
// const dictionary = SpellChecker.getDictionarySync("en-US");
const limiarmemory = 30;
const limiarcpu = 10;
const tarifacpu = 1;
const tarifamemory = 2;
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
  var keyMaster;
  const socket = io.connect('http://10.180.35.168:9510');
  socket.on('connect', () => {
    console.log('Successfully connected!');
    let dadosToSend = {
      id:socket.id,
      publicKey:seguranca.publicKey
    }
    socket.emit('syncKey', dadosToSend);
  });

  socket.on('keyMaster', (dados) => {
    if (dados.id == socket.id) {
      seguranca.decryptKey(dados.keyMaster);
      let resources = {
        cpu: cpu,
        memory: memory / 1024,
        id: socket.id
      };
      socket.emit('resources', seguranca.jsonToCript(resources));
    }
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
    const startUsage = process.cpuUsage();
    dados = seguranca.criptToJson(dados);
    var textoCorrigir = dados.dados.split(' ');
    var palavras = {}
    for(var i = 0; i < textoCorrigir.length; i++){
      var used = process.memoryUsage().heapUsed / 1024 / 1024;
      var usageCpu = process.cpuUsage(startUsage);
      if (!dictionary.spellCheck(textoCorrigir[i])) {
        palavras[textoCorrigir[i]] = dictionary.getSuggestions(textoCorrigir[i])
      }
      if((usageCpu.user / 1e+6) >= limiarcpu){
        break;
      }else if(used >= limiarmemory){
        break;
      }
    }
    console.log(`The script uses approximately ${usageCpu.user/1e+6}s of CPU`);
    console.log(`The script uses approximately ${used} MB of memory`);
    console.log('tarifa memory: ', used*tarifamemory);
    console.log('tarifa da cpu: ', (usageCpu.user/1e+6)*tarifacpu);
    var retorno = {
      tarifa: '',
      idClient:dados.idClient,
      parte:dados.parte,
      totalPartes:dados.totalPartes,
      words: palavras
    }
    // console.log(retorno)
    socket.emit('correcoes', retorno)
  });
  
}
