// const express = require('express');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');

// const app = express();

// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// io.on('connection', () => {
//     console.log('a user is connected');
// });

// mongoose.connect("mongodb+srv://deusimar:deusi1mar23@cluster0-guro3.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology:  true }, (err) =>{
//     console.log('mongodb connected', err);
// });

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(__dirname+'/src/pages/'));

// app.use('/', require('./src/Routes'));

// http.listen(9510, ()=>{
//     console.log('listen on port 9510');
// });

var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var appclient = express();
var httpclient = require('http').Server(appclient);
var ioclient = require('socket.io')(httpclient);

var http = require('http').Server(app);
var io = require('socket.io')(http);
// var mongoose = require('mongoose');

app.use(express.static(__dirname+'/src/pages/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

appclient.use(express.static(__dirname+'/src/pages/client/'));
appclient.use(bodyParser.json());
appclient.use(bodyParser.urlencoded({ extended: false }))

// var Message = mongoose.model('Message', {
//     name: String,
//     message: String
// });

// app.get('/messages', (req, res) => {
//     Message.find({}, (err, messages) => {
//         res.send(messages);
//     });
// });

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

// mongoose.connect("mongodb+srv://deusimar:deusi1mar23@cluster0-guro3.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology:  true }, (err) =>{
//     console.log('mongodb connected', err);
// });

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