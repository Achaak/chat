var express = require('express');
var http    = require('http');
var ent     = require('ent');


var app    = express();
var server = http.createServer(app);


// Chargement de socket.io
var io = require('socket.io').listen(server);

//Création d'une session
    var session = require("express-session")({
        secret: "LAf68ZKq6Hm42mwfm25F",
        resave: true,
        saveUninitialized: true
    });
    var sharedsession = require("express-socket.io-session");

    app.use(session);
    io.use(sharedsession(session));



    io.sockets.on('connection', function (socket) {
        // Connexion par pseudo avec session
        socket.on("login", function(pseudo) {
            if(pseudo != '') {
                socket.handshake.session.pseudo = pseudo;
                socket.handshake.session.save();

                socket.broadcast.emit('info', {'info': '<span class="bold">' + pseudo + '</span> vient de se connecter !'});
            }

            // Verif ok
            socket.emit('loginReturn', 1);
        });

        
        socket.on("logout", function() {
            if (socket.handshake.session.pseudo) {
                socket.broadcast.emit('info', {'info': '<span class="bold">' + socket.handshake.session.pseudo + '</span> vient de quitter le chat !'});

                delete socket.handshake.session.pseudo;
                socket.handshake.session.save();
                
                // Verif ok
                socket.emit('logoutReturn', 1);
            }
        });

        
        // Reception d'un message puis envoie au autres
        socket.on('message', function (message) {            
            socket.broadcast.emit('message', {'pseudo': socket.handshake.session.pseudo, 'message': ent.encode(message)});
        }); 
    });


// Chargement des pages
    app.get('/chat/', function(req, res) {
        if(typeof(req.session.pseudo) == 'undefined')
            res.sendFile(__dirname + '/controller/login.html');  
        else 
            res.sendFile(__dirname + '/controller/chat.html');  
    });
    app.use(express.static(__dirname + '/public'));
    app.use(function(req, res, next){
        res.redirect('/chat');
    });

server.listen(8080);