const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const appCliente = express();
const siofu = require("socketio-file-upload");
var fs = require('fs');
const SocketIOFile = require('socket.io-file');
const PdfReader = require('pdfreader');
// const appclient = express();
// const httpclient = require('http').Server(appclient);
const RSA = require('./rsa')
// var pegar = 'ddd';
const seguranca = new RSA(true);
// const multer = require('multer');
// const path = require('path');

let clients = [];
let nodes = [];
let operacoes = [];
var rows = {};
let uploaded = false;

// Server to NodeMachines
const http = require('http').Server(app);
const ioNode = require('socket.io')(http);

const httpCliente = require('http').Server(appCliente);
const ioClient = require('socket.io')(httpCliente);

app.use(express.static(__dirname+'/src/pages/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

appCliente.use(express.static(__dirname+'/src/pages/client/'));

appCliente.get('/', (req, res, next) => {
	return res.sendFile(__dirname + '/src/client/index.html');
});

appCliente.get('/app.js', (req, res, next) => {
	return res.sendFile(__dirname + '/src/client/app.js');
});

appCliente.get('/socket.io.js', (req, res, next) => {
	return res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});

appCliente.get('/socket.io-file-client.js', (req, res, next) => {
	return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
});

// Server to Clients
// var appCliente = require('http').createServer(response);

// var ioClient = require('socket.io')(appCliente);

// function response(req, res) {
//     var file = "";
//     if(req.url == "/"){
//        file = __dirname + '/src/pages/client/index.html';
//     } else {
//        file = __dirname + req.url;
//     }
//     fs.readFile(file,
// 	    function (err, data) {
// 			if (err) {
// 				res.writeHead(404);
// 				return res.end('Page or file not found');
// 			}
// 			res.writeHead(200);
// 			res.end(data);
// 	    }
//     );
// }

// Start server to NodeMachine
const server = http.listen(9510, '0.0.0.0', () => {
    console.log('Server NodeMachine Online na porta: ', server.address().port);
});

// Start server to Clients
const clientServer = httpCliente.listen(1095, '0.0.0.0', () => {
    console.log('Server Client Online na porta: ', clientServer.address().ip, clientServer.address().port);
});

// listen client
ioClient.on("connection", function(socket){
    var count = 0;
    var textofile = '';
	var uploader = new SocketIOFile(socket, {
		// uploadDir: {			// multiple directories
		// 	music: 'data/music',
		// 	document: 'data/document'
		// },
		uploadDir: 'uploads',							// simple directory
		// accepts: ['audio/mpeg', 'audio/mp3'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
		// maxFileSize: 4194304, 						// 4 MB. default is undefined(no limit)
		chunkSize: 10240,							// default is 10240(1KB)
		transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
		overwrite: false, 							// overwrite file if exists, default is true.
		rename: function(filename) {
			var split = filename.split('.');	// split filename by .(extension)
			var fname = split[0];	// filename without extension
			var ext = split[1];
			return `${socket.id}_${Date.now()}_${count++}.${ext}`;
        }
        // rename: 'file.txt'
	});
	uploader.on('start', (fileInfo) => {
		console.log('Start uploading');
		console.log(fileInfo);
	});
	// uploader.on('stream', (fileInfo) => {
	// 	console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
	// });
	uploader.on('complete', (fileInfo) => {
		console.log('Upload Complete.');
        console.log(fileInfo.uploadDir);
        texto = '';
        fs.readFile(fileInfo.uploadDir, 'utf8', function (err, data) {
        if (err) throw err;
            console.log('OK: ' + fileInfo.name);
            texto = data;
            enviarPalavras(data, socket);
        });
	});
	uploader.on('error', (err) => {
		console.log('Error!', err);
	});
	uploader.on('abort', (fileInfo) => {
		console.log('Aborted: ', fileInfo);
	});
    console.log('Clinte conectado');
    clients.push(socket.id);
    
    socket.on("dadosCliente", (requicaoCliente) => {
        if(requicaoCliente.messageType === 'texto'){
            enviarPalavras(requicaoCliente.message, socket);
        }else{
            console.log('mensagem em arquivo');
        }
    });
});

function enviarPalavras(texto, socket){
    texto = texto.replace(/\.|\,|\:|\n|\?|\'|\’/g, '');
    var listaPalavras = texto.split(' ');
    var cadaNo = qtdPalavrasCada(listaPalavras.length);
    var np = 0;
    for (var i = 0; i < cadaNo.totalNodes; i++) {
        if (cadaNo.qtdCadaNo[i] > 0) {
            var palavras = listaPalavras[np];
            np += 1;
            if (cadaNo.qtdCadaNo[i] > 1) {
                for (let j = 1; j < cadaNo.qtdCadaNo[i]; j++) {
                    palavras += ' ' + listaPalavras[np];
                    np += 1;
                }
            }
            var enviar = {
                idClient: socket.id,
                parte: i,
                totalPartes: cadaNo.totalNodes,
                dados: palavras
            }
            ioNode.to(nodes[i].nodeId).emit('maketask', seguranca.jsonToCript(enviar));
        } else {
            break
        }
    }
    operacoes.push({ idClient: socket.id, totalPartes: cadaNo.totalNodes, words: {}, tarifa: 0 })
}

// listen nodes
ioNode.on('connection', (socket) => {
    if (socket.client.conn.remoteAddress == '127.0.0.1'){
        ioNode.emit('update', nodes);
    }
    else{
        // ioNode.emit('publicKey', seguranca.publicKey)
        socket.on('syncKey', (dados) => {
            let dadosToSend = {
                id:dados.id,
                keyMaster:seguranca.criptKey(dados.publicKey)
            }
            ioNode.emit('keyMaster', dadosToSend);
        });
        console.log('NoMachine connectado')
        socket.on('resources', (dados) => {
            let NoMachine = seguranca.criptToJson(dados);
            nodes.push({
                nodeId: NoMachine.id,
                cpu: NoMachine.cpu,
                memory: NoMachine.memory,
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
        socket.on('result', (dados) => {
            console.log(dados.dados);
        });
    }
    socket.on('correcoes', (resultados)=>{
        for (let i = 0; i < operacoes.length; i++) {
            if (resultados.idClient === operacoes[i].idClient) {
                operacoes[i].totalPartes -= 1
                operacoes[i].tarifa += resultados.tarifa
                operacoes[i].words = jsonConcat(operacoes[i].words, resultados.words)
                if (operacoes[i].totalPartes == 0) {
                    ioClient.to(operacoes[i].idClient).emit('correcao', { palavras: operacoes[i].words, tarifa: operacoes[i].tarifa });
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