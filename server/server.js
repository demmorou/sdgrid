const express = require('express');
const bodyParser = require('body-parser')
const app = express();
// const appclient = express();
// const httpclient = require('http').Server(appclient);
const RSA = require('./rsa')
// var pegar = 'ddd';
const seguranca = new RSA()
// const multer = require('multer');
// const path = require('path');

let clients = [];
let nodes = [];
let operacoes = [];

// const fs = require('fs');
// const upload = multer({ dest: 'uploads/' });

// Server to NodeMachines
const http = require('http').Server(app);
const ioNode = require('socket.io')(http);

app.use(express.static(__dirname+'/src/pages/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

// Server to Clients
var appCliente = require('http').createServer(response);
var fs = require('fs');
var ioClient = require('socket.io')(appCliente);

function response(req, res) {
    var file = "";
    if(req.url == "/"){
       file = __dirname + '/src/pages/client/index.html';
    } else {
       file = __dirname + req.url;
    }
    fs.readFile(file,
	    function (err, data) {
			if (err) {
				res.writeHead(404);
				return res.end('Page or file not found');
			}
			res.writeHead(200);
			res.end(data);
	    }
    );
}

ioClient.on("connection", function(socket){
    console.log('Clinte conectado')
    clients.push(socket.id);
    socket.on("dadosCliente", (requicaoCliente) => {
        var texto = requicaoCliente.message
        var listaPalavras = texto.split(' ')
        var cadaNo = qtdPalavrasCada(listaPalavras.length);
        // qtdCadaNo = cadaNo.qtdCadaNo;
        var np = 0;
        for (var i = 0; i < cadaNo.totalNodes; i++) {
            if (cadaNo.qtdCadaNo[i] > 0) {
                var palavras=listaPalavras[np];
                np += 1;
                if (cadaNo.qtdCadaNo[i] > 1) {
                    for (let j = 1; j < cadaNo.qtdCadaNo[i]; j++) {
                        palavras+=' '+listaPalavras[np];
                        np += 1;
                    }
                }
                var enviar = {
                    idClient:socket.id,
                    parte:i,
                    totalPartes:cadaNo.totalNodes,
                    dados:palavras
                }
                console.log(enviar)
                ioNode.to(nodes[i].nodeId).emit('maketask', enviar);
            } else {
                break
            }
        }
        operacoes.push({idClient:socket.id, totalPartes:cadaNo.totalNodes, words: {}})
    });
});

// Start server to NodeMachine
const server = http.listen(9510, '0.0.0.0', () => {
    console.log('Server NodeMachine Online na porta: ', server.address().port);
});

// Start server to Clients
appCliente.listen(1095);
console.log('Server Clinte Online na porta: 1095')

ioNode.on('connection', (socket) => {
    if (socket.client.conn.remoteAddress == '127.0.0.1'){
        ioNode.emit('update', nodes);
    }
    else{
        console.log('NoMachine connectado')
        ioNode.emit('publicKey', seguranca.getPublicKey());
        socket.on('resources', (dados) => {
            console.log(dados)
            nodes.push({
                nodeId: socket.id,
                cpu: dados.cpu,
                memory: dados.memory,
                participacao: 0
            });
            ioNode.emit('update', nodes);
        });
        socket.on('disconnect', () => {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].nodeId === socket.id) {
                    nodes.splice(i, 1);
                }
            }
            ioNode.emit('update', nodes);
        });
    }
    socket.on('correcoes', (resultados)=>{
        for (let i = 0; i < operacoes.length; i++) {
            if (resultados.idClient === operacoes[i].idClient) {
                operacoes[i].totalPartes -= 1
                operacoes[i].words = jsonConcat(operacoes[i].words, resultados.words)
                if (operacoes[i].totalPartes == 0) {
                    ioClient.to(operacoes[i].idClient).emit('correcao', operacoes[i].words);
                    operacoes.splice(i, 1);
                }
            }
        }
    });
});

qtdPalavrasCada = (qtdPalavras) => {
    var totalMemory = 0;
    let qtdCadaNo = [];
    let i;
    nodes.forEach(no => {
        totalMemory+=no.memory;
    });
    for (i = 0; i < nodes.length; i++) {
        qtdCadaNo.push(Math.ceil((nodes[i].memory * qtdPalavras) / totalMemory));
        qtdPalavras -= 1;
    }
    for (i = 0; i < qtdCadaNo.length; i++) {
        if (qtdCadaNo[i] == 0) {
            break
        }
    }
    return {qtdCadaNo: qtdCadaNo, totalNodes: i};
}

jsonConcat = (o1, o2) => {
    for (var key in o2) {
     o1[key] = o2[key];
    }
    return o1;
}

sendFileToNodes = (dados) => {
    const fs = require('fs');

    let rawdata = fs.readFileSync('uploads/upload.json');
    let student = JSON.parse(rawdata);

    var message = student.message;

    var split = message.split(' ');
    var total = split.length;
    var qtdNos = nodes.length;
    var intvalue = Math.ceil( total / qtdNos );
    var contsplit = 0
    for(var i = 0; i < nodes.length; i++){
        var palavraToSend = ''
        for(var j = 0; j < intvalue; j++){
            palavraToSend+=' '+split[contsplit]
            contsplit += 1
        }
    }
}