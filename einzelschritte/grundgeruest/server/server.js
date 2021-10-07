var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 8080;

// Daten
var nachrichten = [];


// Webserver starten
http.listen(port, function() {
    console.log('lausche auf *:' + port);
    console.log('Öffne http://localhost:' + port );
});
