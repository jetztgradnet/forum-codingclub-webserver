var benutzer = '';
var freunde = [];
var benutzerListe = [];
var letzteNachrichtenId = undefined;
var nachrichten = [];
var nachrichtenListenLaenge = 10;
var autoAktualisieren = false;

/* Statusanzeige */
function fehler(text) {
  const div = document.getElementById('statusmeldung');
  div.classList.remove('statusok')
  div.classList.add('statusfehler')
  div.style.visibility = 'visible';
  div.innerHTML = text;
}

function status(text) {
  let div = document.getElementById('statusmeldung');
  div.classList.add('statusok')
  div.classList.remove('statusfehler')
  div.style.visibility = 'visible';
  div.innerHTML = text;
}

function statusVerbergen() {
  let div = document.getElementById('statusmeldung');
  div.classList.remove('statusok')
  div.classList.remove('statusfehler')
  div.style.visibility = 'hidden';
  div.innerHTML = "";
}

function nachrichtenAbrufen(event) {
  const formular = event.target;
  event.preventDefault();
  holeNachrichten(letzteNachrichtenId);
  return false;
}

function nachrichtenAbrufenAlle(event) {
  event.preventDefault();
  letzteNachrichtenId = 0;
  nachrichten = [];
  nachrichtenListeAufraeumen(0);
  holeNachrichten(letzteNachrichtenId);
  return false;
}

function nachrichtenLoeschen(event) {
  const formular = event.target;
  event.preventDefault();
  nachrichtenListeAufraeumen(0);
  return false;
}

function nachrichtenListeAufraeumen(maxNachrichten) {
  console.log("Nachrichtliste leeren");
  let nachrichtenListe = document.getElementById('nachrichten-liste');
  while (nachrichtenListe.lastChild && nachrichtenListe.children.length > maxNachrichten) {
    nachrichtenListe.removeChild(nachrichtenListe.lastChild)
  }
}

function nachrichtAnzeigen(nachricht) {
  console.log("Hinzufügen von Nachricht");
  let nachrichtenListe = document.getElementById('nachrichten-liste');

  let muster = document.getElementById('nachrichtenmuster');
  let nachrichtenDiv = muster.cloneNode(true)
  nachrichtenDiv.removeAttribute('id');

  nachrichtenDiv.querySelector('#von').innerHTML = nachricht.von;
  nachrichtenDiv.querySelector('#an').innerHTML = nachricht.an;
  nachrichtenDiv.querySelector('#zeitstempel').innerHTML = new Date(nachricht.zeitstempel).toLocaleString();
  nachrichtenDiv.querySelector('#nachricht').innerHTML = nachricht.nachricht;
  nachrichtenDiv.style.visibility = 'visible';

  if (nachricht.von == benutzer) {
    nachrichtenDiv.classList.add('eigene-nachricht');
  }
  else {
    nachrichtenDiv.classList.add('andere-nachricht');
  }

  let neusteNachricht = nachrichtenListe.firstChild
  if (neusteNachricht) {
    nachrichtenListe.insertBefore(nachrichtenDiv, neusteNachricht);
  }
  else {
    nachrichtenListe.append(nachrichtenDiv);
  }
  //window.scrollTo(0, document.body.scrollHeight);
}

function holeNachrichten(startIndex) {
  console.log("nach neuen Nachrichten schauen");
  fetch('/nachrichten/' + encodeURIComponent(startIndex ? startIndex : ''), { method: 'POST' })
    .then((response) => {
      if (!response.ok) {
        fehler("Fehler beim Abholen von Nachrichten, status = " + response.status);
        throw new Error('Netzwerk verbunden?');
      }
      return response.json();
    })
    .then((data) => {

      let letzteNachricht = data.slice(-1).pop();
      let letzteNachrichtenDatum = 'nie';
      if (letzteNachricht) {
        letzteNachrichtenId = letzteNachricht.id
        letzteNachrichtenDatum = letzteNachricht.zeitstempel;
      }
      data.forEach(nachricht => {
        if ((nachricht.an == benutzer) || 
            (nachricht.von == benutzer)) {
          nachrichten.push(nachricht);
          nachrichtAnzeigen(nachricht);
        }
      });
      nachrichtenListeAufraeumen(nachrichtenListenLaenge);
      status("" + nachrichten.length + " Nachrichten, " + data.length + " neue, letzte: " + letzteNachrichtenId + " vom " + letzteNachrichtenDatum);
      console.log(data);
    });
}

function holeBenutzer() {
  fetch('/benutzer', { method: 'POST' })
    .then((response) => {
      if (!response.ok) {
        fehler("HTTP Fehler, status = " + response.status);
        throw new Error('Netzwerk verbunden?');
      }
      return response.json();
    })
    .then((data) => {
      benutzerListe = data;
      console.log("Benutzer: " + data);
      let anmeldenBenutzerListe = document.getElementById('anmelden-benutzer');
      data.forEach(name => {
        let option = document.createElement('option')
        option.innerHTML= name;
        anmeldenBenutzerListe.appendChild(option);
      });
      let sendenBenutzerListe = document.getElementById('senden-empfaenger');
      data.forEach(name => {
        let option = document.createElement('option')
        option.innerHTML= name;
        if (sendenBenutzerListe.children.length == 0) {
          // ersten Namen vorselektieren
          option.setAttribute('selected', 'selected');
        }
        sendenBenutzerListe.appendChild(option);
      });

      status("" + benutzerListe.length + " Benutzer");
    });
}

function holeFreunde(benutzer) {
  fetch('/freunde/' + encodeURIComponent(benutzer), { method: 'POST' })
    .then((response) => {
      if (!response.ok) {
        fehler("HTTP Fehler, status = " + response.status);
        throw new Error('Netzwerk verbunden?');
      }
      return response.json();
    })
    .then((data) => {
      freunde = data;
      console.log("Freunde: " + data);
      status("" + freunde.length + " Freunde");
    });
}

function anmeldeFormularSenden(event) {
  event.preventDefault();
  anmeldenAls(event.target.value);
}

function nachrichtFormularSenden(event) {
  event.preventDefault();
  const formular = event.target;
  const empfaenger = formular.querySelector('#senden-empfaenger').value;
  const textfeld = formular.querySelector('#senden-text');
  const text = textfeld.value;
  const zeitstempel = new Date();
  const nachricht = { von: benutzer, an: empfaenger, nachricht:text, zeitstempel: zeitstempel };

  // Textfeld leeren für nächste Eingabe und Fokus setzen
  textfeld.value = '';
  textfeld.focus();
  nachrichtSenden(nachricht);
  return false;
}

function nachrichtSenden(nachricht) {
  console.log("Nachricht senden:", nachricht);
  fetch('/senden', { 
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST', 
          body: JSON.stringify(nachricht)
        })
    .then((response) => {
      if (!response.ok) {
        fehler("HTTP Fehler, status = " + response.status);
        throw new Error('Netzwerk verbunden?');
      }
      status("HTTP Rückmeldung, status = " + response.status);
      return true;
    })
    .then((x) => {
      // am Ende nochmal nach neuen Nachrichten schauen
      console.log("Neue Nachrichten abholen");
      holeNachrichten(letzteNachrichtenId);
    });
}

function anmeldenAls(name) {
  document.getElementById('benutzer-name').innerHTML = name;
  document.getElementById('anmelden-benutzer').value = name;
  benutzer = name;
  nachrichten = [];
  freunde = [];
  letzteNachrichtenId = undefined;
  // beim Laden der Seite die Liste aller Freunde abholen
  holeFreunde(benutzer);
  // alle aktuellen Nachrichten abholen
  nachrichtenListeAufraeumen(0);
  holeNachrichten(letzteNachrichtenId);
}

function autoAktualisierenUmschalten(event) {
  autoAktualisieren = event.target.checked;
  console.log("Auto-aktualisieren von Nachrichten aktiv: " + autoAktualisieren);
  if (autoAktualisieren) {
    // Nächsten Abruf einrichten
    setTimeout(automatischerNachrichtenAbruf, 5000);
  }
}

function automatischerNachrichtenAbruf() {
  if (autoAktualisieren) {
    // Nachrichten automatisch abrufen
    holeNachrichten(letzteNachrichtenId);

    // Nächsten Abruf einrichten
    setTimeout(automatischerNachrichtenAbruf, 5000);
  }
}

function setup() {
  holeBenutzer();
  // Benutzername setzen
  anmeldenAls('Anonym');
}

setup();
