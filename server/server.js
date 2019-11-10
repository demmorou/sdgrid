const express = require('express');
const bodyParser = require('body-parser')
const app = express();
// const appclient = express();
// const httpclient = require('http').Server(appclient);

var pegar = 'ddd';

const multer = require('multer');
const path = require('path');

let clients = [];
let nodes = [];

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
    socket.on("dadosCliente", (messsageCliente) => {
        console.log(messsageCliente)
        console.log(sendToNode(messsageCliente.message))
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
        // io.on('updatepage', (dados) => {
        ioNode.emit('update', { nodes: nodes });
        // });
    }
    else{
        socket.emit('chegou', { message: 'Olá, '+socket.client.conn.remoteAddress });
        nodes.push(socket.id);
        console.log('ID: '+socket.id);
        socket.on('resources', (dados) => {
            console.log(socket.id+' - ',dados);
        });
        socket.on('result', (dados) => {
            console.log(dados);
        });
        // send to specific node
        ioNode.to(socket.client.id).emit('task', { message: 'Olá, '+socket.client.conn.remoteAddress });
        // sendFileToNodes();
        console.log(nodes.length);
        ioNode.emit('update', { nodes: nodes });
        console.log('Connected IP: '+socket.client.conn.remoteAddress);
        socket.on('disconnect', () => {
            ioNode.emit('saiu', { clientIp: socket.client.conn.remoteAddress });
            console.log('Disconected IP: '+socket.client.conn.remoteAddress);
            for (var i = 0; i < nodes.length; i++) {
                console.log(nodes[i])
                if (nodes[i] === socket.id) {
                    nodes.splice(i, 1);
                }
            }
            ioNode.emit('update', { nodes: nodes });
        });
    }
});

sendToNode = (texto) => {
    var esperar = nodes[0];
    var retorno = {};
    texto.parte = 1;
    ioNode.to(nodes[0]).emit('maketask', { dados: texto });
    console.log(esperar)
    ioNode.on(esperar, (resultado) => {
        console.log(resultado)
        retorno = resultado
    });
    return retorno
}

sendFileToNodes = (dados) => {
    const fs = require('fs');

    let rawdata = fs.readFileSync('uploads/upload.json');
    let student = JSON.parse(rawdata);
    // console.log(student);

    var message = student.message;

    var split = message.split(' ');
    var total = split.length;
    var qtdNos = nodes.length;
    // var qtdpalavras = total / qtdNos;
    var intvalue = Math.ceil( total / qtdNos );
    var contsplit = 0
    for(var i = 0; i < nodes.length; i++){
        var palavraToSend = ''
        for(var j = 0; j < intvalue; j++){
            palavraToSend+=' '+split[contsplit]
            contsplit += 1
        }
        // ioNode.to(nodes[i]).emit('maketask', { dados: palavraToSend })
    }
}