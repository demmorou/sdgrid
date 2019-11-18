const io = require('socket.io-client');
const SpellChecker = require('simple-spellchecker');
const dictionary = SpellChecker.getDictionarySync("en-US");

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
  const socket = io.connect('http://10.180.50.218:9510');
  socket.on('connect', () => {
    console.log('Successfully connected!');
    socket.emit('resources', { cpu: cpu, memory: memory / 1024 })
  });

  socket.on('index', (indexn)=>{
    index=indexn;
  })

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
    var text = dados.dados.replace(/\.|\,|\:|\n/g, '');
    var textoCorrigir = text.split(' ');
    var palavras = {}
    for(var i = 0; i < textoCorrigir.length; i++){
      if (!dictionary.spellCheck(textoCorrigir[i])) {
        palavras[textoCorrigir[i]] = dictionary.getSuggestions(textoCorrigir[i])
      }
      var used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(used);
      var usageCpu = process.cpuUsage(startUsage)
      console.log(usageCpu.user); 
      if((usageCpu.user / 1e+6) >= 10){
        console.log(`The script uses approximately ${usageCpu.user/1e+6}s of CPU`);
        break;
      }else if(used >= 30){
        console.log(`The script uses approximately ${used} MB of memory`);
        break;
      }
    }

    var retorno = {
      idClient:dados.idClient,
      parte:dados.parte,
      totalPartes:dados.totalPartes,
      words: palavras
    }
    // console.log(retorno)
    socket.emit('correcoes', retorno)
  });
  
}
