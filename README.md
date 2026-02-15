# Circo Insider

Insider party game a tema circo per 4-20+ giocatori.

## Deploy rapido su Hetzner

```bash
scp circo-insider.zip root@TUO_IP:/opt/
ssh root@TUO_IP
cd /opt && unzip circo-insider.zip -d circo-insider && cd circo-insider
npm install
PORT=80 node server.js
# Oppure con screen:
# screen -S circo && PORT=80 node server.js
```

## Come si gioca

1. L'host crea la stanza e condivide il codice
2. Tutti entrano e l'host avvia il round
3. Ogni giocatore vede il proprio ruolo sul telefono:
   - **Il Presentatore** (1): conosce la parola, risponde solo SI/NO
   - **L'Infiltrato** (1-2): conosce la parola, guida il gruppo senza farsi scoprire
   - **Artisti** (tutti gli altri): fanno domande e cercano di indovinare
4. 5 minuti di domande SI/NO al Presentatore (IRL, dal vivo)
5. Se la parola viene indovinata: 90 secondi di discussione su chi e' l'Infiltrato
6. Voto sul telefono
7. Risultati e punteggi

## Punteggio

- Infiltrato NON scoperto: +3 pt all'Infiltrato
- Infiltrato scoperto: +2 pt al Presentatore, +1 pt a chi ha votato giusto
- Parola NON indovinata: +3 pt all'Infiltrato
