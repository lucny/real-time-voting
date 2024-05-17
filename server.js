// Načtení potřebných modulů
const express = require('express');  // Express.js framework pro vytvoření webového serveru
const http = require('http');        // Modul HTTP pro vytvoření serveru
const socketIo = require('socket.io'); // Socket.io pro real-time komunikaci
const requestIp = require('request-ip'); // Middleware pro získání IP adresy klienta

const app = express(); // Vytvoření instance Express aplikace
const server = http.createServer(app); // Vytvoření HTTP serveru pomocí Express aplikace
const io = socketIo(server); // Integrace socket.io se serverem

// Struktura pro ukládání hlasů
let votes = { 
  option1: { count: 0, names: [] }, // Počítadlo hlasů a jména hlasujících pro možnost 1
  option2: { count: 0, names: [] }  // Počítadlo hlasů a jména hlasujících pro možnost 2
};

// Sady pro sledování IP adres a jmen, které již hlasovaly
let votedIps = new Set(); // IP adresy, které již hlasovaly
let votedNames = new Set(); // Jména hlasujících, kteří již hlasovali

// Nastavení middleware pro statické soubory
app.use(express.static('public')); // Umožňuje servírovat soubory z adresáře 'public'

// Zpracování nového spojení přes socket.io
io.on('connection', (socket) => {
  // Získání IP adresy klienta ze socket.io handshake objektu
  const clientIp = socket.handshake.address;

  console.log(`A user connected from IP: ${clientIp}`);

  // Odeslání aktuálního stavu hlasování novému uživateli
  socket.emit('currentVotes', votes);

  // Zpracování události hlasování
  socket.on('vote', (data) => {
    const { option, name } = data; // Destrukturalizace dat přijatých z klienta

    // Kontrola, zda z této IP adresy nebo s tímto jménem již nebylo hlasováno
    if (votedIps.has(clientIp) || votedNames.has(name)) {
      socket.emit('voteDenied', 'You have already voted.'); // Odeslání zprávy o zamítnutí hlasu
      return;
    }

    // Kontrola, zda je volba platná
    if (votes[option] !== undefined) {
      votes[option].count++; // Zvýšení počtu hlasů pro danou volbu
      votes[option].names.push(name); // Přidání jména hlasujícího do seznamu
      votedIps.add(clientIp); // Uložení IP adresy do sady hlasujících IP adres
      votedNames.add(name); // Uložení jména do sady hlasujících jmen
      io.emit('voteUpdate', votes); // Odeslání aktualizovaných výsledků všem připojeným klientům
    }
  });

  // Zpracování odpojení uživatele
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Spuštění serveru na portu 3000
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
