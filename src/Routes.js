const express = require('express');
const routes = express.Router();

const Messages = require('./models/Messages');

var http = require('http').Server(routes);
var io = require('socket.io')(http);

routes.get('/messages', (req, res) => {
    Messages.find({}, (err, messages) => {
        res.send(messages);
    });
});

routes.post('/messages', (req, res) => {
    console.log(req.body);
    const message = new Messages(req.body);
    message.save((err) => {
        if (err)
            res.sendStatus(500);
        io.emit('message', req.body);
        res.sendStatus(200);
    });
});

routes.get('/sdgrid', (req, res) => {
    res.sendStatus(200);
});

module.exports = routes;