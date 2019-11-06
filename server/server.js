const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const appclient = express();
const httpclient = require('http').Server(appclient);

const multer = require('multer');
const path = require('path');

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
    console.log(req.body);
    io.emit('certo', { ddd: 'ddd' });
    res.sendStatus(200);
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

appclient.post('/sdgrid/file/upload', upload.single('file'), (req, res) => {
    res.sendStatus(200);
});

const serverclient = httpclient.listen(1095, '0.0.0.0', () => {
    console.log('Server client running on port ', serverclient.address().port);
});

const server = http.listen(9510, '0.0.0.0', () => {
    console.log('server is running on port', server.address().port);
});

let clients = []

io.on('connection', (socket) => {
    if (socket.client.conn.remoteAddress == '127.0.0.1'){
        // io.on('updatepage', (dados) => {
        io.emit('update', { clients: clients });
        console.log('pagina atualizada');
        // });
    }
    else{
        io.emit('clientConnected', { clientIp: socket.client.conn.remoteAddress });
        socket.emit('chegou', { message: 'Olá, '+socket.client.conn.remoteAddress });
        clients.push(socket.client.conn.remoteAddress);
        console.log(clients.length);
        io.emit('update', { clients: clients });
        console.log('Connected IP: '+socket.client.conn.remoteAddress);
        socket.on('disconnect', () => {
            io.emit('saiu', { clientIp: socket.client.conn.remoteAddress });
            console.log('Disconected IP: '+socket.client.conn.remoteAddress);
            for (var i = 0; i < clients.length; i++) {
                if (clients[i] === socket.client.conn.remoteAddress) {
                    clients.splice(i, 1);
                }
            }
            io.emit('update', { clients: clients });
        });
    }
});