const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const appclient = express();
const httpclient = require('http').Server(appclient);

var pegar = 'ddd';

const multer = require('multer');
const path = require('path');

let clients = [];
let nodes = [];

const fs = require('fs');

// const upload = multer({ dest: 'uploads/' });

const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname+'/src/pages/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

appclient.use(express.static(__dirname+'/src/pages/client/'));
appclient.use(bodyParser.json());
appclient.use(bodyParser.urlencoded({ extended: false }))

appclient.get('/sdgrid', (req, res) => {
    console.log('cliente web');
    res.sendFile('src/pages/client/index_client.html', { root: __dirname });
});

appclient.post('/send', (req, res) => {
    console.log('asdasd');
    console.log(req.body.message);
    io.to(nodes[0]).emit('maketask', { dados: req.body.message})
    // io.emit('certo', { ddd: 'ddd' });
    res.sendStatus(200);
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // alterar nome do arquivo
        // cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
        cb(null, 'aquivo.pdf');
    }
});

const upload = multer({ storage });

appclient.post('/sdgrid/file/upload', upload.single('file'), (req, res) => {
    io.emit('certo', { email: 'Upload from: '+req.body.email });
    sendFileToNodes();
    res.sendStatus(200);
});

const serverclient = httpclient.listen(1095, '0.0.0.0', () => {
    console.log('client server running on port ', serverclient.address().port);
});

const server = http.listen(9510, '0.0.0.0', () => {
    console.log('server is running on port', server.address().port);
});

io.on('connection', (socket) => {
    if (socket.client.conn.remoteAddress == '127.0.0.1'){
        // io.on('updatepage', (dados) => {
        io.emit('update', { nodes: nodes });
        console.log('pagina atualizada');
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
        io.to(socket.client.id).emit('task', { message: 'Olá, '+socket.client.conn.remoteAddress });
        // sendFileToNodes();
        console.log(nodes.length);
        io.emit('update', { nodes: nodes });
        console.log('Connected IP: '+socket.client.conn.remoteAddress);
        socket.on('disconnect', () => {
            io.emit('saiu', { clientIp: socket.client.conn.remoteAddress });
            console.log('Disconected IP: '+socket.client.conn.remoteAddress);
            for (var i = 0; i < nodes.length; i++) {
                console.log(nodes[i])
                if (nodes[i] === socket.id) {
                    nodes.splice(i, 1);
                }
            }
            io.emit('update', { nodes: nodes });
        });
    }
});

// function getResults(callback){
//     io.on('result', (dados) => {
//         return callback(dados);
//     });
// }

// getResults((response) => {
//     console.log(response);
// });

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
        io.to(nodes[i]).emit('maketask', { dados: palavraToSend })
    }
}