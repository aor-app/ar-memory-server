'use strict';
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const arMessenger = require('./lib/ar_messenger');
const path = require('path');
const AR_DATA_EDITOR_PATH = path.resolve('../ar-data-editor');

let arReceiver = null;

app.use('/index.html', express.static(AR_DATA_EDITOR_PATH + '/index_server.html'));
app.use('/css', express.static(AR_DATA_EDITOR_PATH + '/css'));
app.use('/browserconfig.xml', express.static(AR_DATA_EDITOR_PATH + '/browserconfig.xml'));
app.use('/help-img', express.static(AR_DATA_EDITOR_PATH + '/help-img'));
app.use('/help.html', express.static(AR_DATA_EDITOR_PATH + '/help.html'));
app.use('/images', express.static(AR_DATA_EDITOR_PATH + '/images'));
app.use('/javascript', express.static(AR_DATA_EDITOR_PATH + '/javascript'));
app.use('/site.webmanifest', express.static(AR_DATA_EDITOR_PATH + '/site.webmanifest'));
app.get('/', function(req, res){
    res.redirect(req.baseUrl + '/index.html');
});
io.on('connection', function(socket) {
    let socketId = socket.id;
    socket.on('readMemoryChannel', async () => {
        console.log('read memory channel command received.');
        if (arReceiver === null) {
            try {
                arReceiver = await arMessenger.ARReceiver.build();
            }catch(error){
                let result = { code: -99, message: error.message };
                io.to(socket.id).emit('readMemoryChannelResult', result);
                return;
            }
        }
        arReceiver.readMemoryData().then(result => {
            io.to(socket.id).emit('readMemoryChannelResult', result);
        }).catch(error => {
            let result = null;
            if( error === arMessenger.CommandErr ){
                result = { code: error.code, message: error.message };
            }else{
                result = { code: -99, message: error.message };
            }
            io.to(socket.id).emit('readMemoryChannelResult', result);
        });
    });
    socket.on('writeMemoryChannel', async (memoryData) => {
        console.log('write memory channel command received.');
        if (arReceiver === null) {
            try {
                arReceiver = await arMessenger.ARReceiver.build();
            }catch(error){
                let result = { code: -99, message: error.message };
                io.to(socket.id).emit('writeMemoryChannelResult', result);
                return;
            }
        }
        arReceiver.writeMemoryData(memoryData.banks).then(result => {
            io.to(socket.id).emit('writeMemoryChannelResult', result);
        }).catch(error => {
            let result = null;
            if( error === arMessenger.CommandErr ){
                result = { code: error.code, message: error.message };
            }else{
                result = { code: -99, message: error.message };
            }
            io.to(socket.id).emit('writeMemoryChannelResult', result);
        });
    });
    socket.on('getModel', async () => {
        console.log('get Model command received.');
        if (arReceiver === null) {
            try {
                arReceiver = await arMessenger.ARReceiver.build();
            }catch(error){
                let result = { code: -99, message: error.message };
                io.to(socket.id).emit('getModel', result);
                return;
            }
        }
        arReceiver.getModel().then(result => {
            io.to(socket.id).emit('getModel', result);
        }).catch(error => {
            let result = null;
            if( error === arMessenger.CommandErr ){
                result = { code: error.code, message: error.message };
            }else{
                result = { code: -99, message: error.message };
            }
            io.to(socket.id).emit('getModel', result);
        });
    });
});
http.listen(3000, async ()  => {
    console.log('Server started.');
    try {
        arReceiver = await arMessenger.ARReceiver.build();
        console.log(arReceiver);
    } catch(e){
        console.log(e.message);
    };
});
