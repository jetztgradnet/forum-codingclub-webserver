var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 8080;

// Daten
var nachrichten = [];


// Formular-parameter und JSON Anfragen
app.use(express.json());
app.use(express.urlencoded());

// alle Anfragen loggen
function logger(req, res, next) {
    console.log('Anfrage: ' + req.originalUrl);
    console.log('Request: ' + req.query);
    console.log('Body: ' + req.body);
    next();
  };
app.use(logger);


app.use(express.static('../client'));

app.get('/hello', function (req, res) {
    res.send('Hello ' + req.params);
});

app.post('/senden', function (req, res) {
    let nachricht = { an: req.body.an, text: req.body.text };
    console.log(nachricht);
    nachrichten.push(nachricht);
    res.send('Nachricht angekommen, danke!');
});


// Webserver starten
http.listen(port, function() {
    console.log('lausche auf *:' + port);
    console.log('Öffne http://localhost:' + port );
});
