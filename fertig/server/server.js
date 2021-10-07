var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 8080;

// Daten
var nachrichten = [];
var benutzer = require('./benutzer.json');

// Gibt Daten des benannten Benutzers zurück
function benutzerDaten(name) {
    return benutzer[name];
}

// Gibt die Liste aller bekannten Benutzers zurück
function benutzerListe() {
    return Object.keys(benutzer);
}

// alle Anfragen loggen
var logger = function (req, res, next) {
    console.log('Anfrage: ' + req.originalUrl);
    next();
  };
app.use(logger);


// statische Dateien aus dem Verzeichnis 'app'
// (liegt parallel zum aktuellen Verzeichnis)
app.use(express.static('../client'));

// Umleitung von /chat auf Startseite
app.all('/chat', function(req, res){
    res.redirect('/');
});

// Formular-parameter und JSON Anfragen
app.use(express.json());
app.use(express.urlencoded());

// Gespeicherte Nachrichten zurück geben
app.post('/nachrichten/:startId?', function(req, res) {
    console.log("Nachrichten abholen: ", req.body, req.params);
    
    // alle nachrichten
    let ergebnis = nachrichten;
    if (req.params.startId) {
        // nur nachrichten ab der angegeben id
        ergebnis = nachrichten.slice(parseInt(req.params.startId) + 1)
    }
    res.status(200).json(ergebnis);
});

// Nachricht empfangen
app.post('/senden', function(req, res) {
    console.log("Nachricht senden: ", req.body);
    let nachricht = req.body;
    let index = nachrichten.push(nachricht) - 1;
    nachricht.id = index;
    res.sendStatus(200);
});

// Benutzer abrufen
app.post('/benutzer', function(req, res) {
    res.status(200).json(benutzerListe());
});

// Freunde abrufen
app.post('/freunde/:benutzer', function(req, res) {
    let benutzer = req.params.benutzer;
    res.status(200).json(benutzerDaten(benutzer));
});

// Webserver starten
http.listen(port, function() {
    console.log('lausche auf *:' + port);
    console.log('Öffne http://localhost:' + port );
});
