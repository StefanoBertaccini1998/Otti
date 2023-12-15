# O.t.t.i. On The Table Inspection
# project by Stefano Bertaccini

Problema teorico:
Recentemente si è alzato un polverone per quanto riguarda la presenza di alti residui di pesticidi all'interno di prodotti alimentari.
La alta presenza di pesticidi non preoccupa solo la salute dell'uomo ma anche della natura.
I campi adibiti all'agricoltura, dove vengono utilizzati i pesticidi presentano problematiche per la micro-flora e fauna portando a una riduzione della biodiversità.

Fonti:

1. https://altreconomia.it/quasi-la-meta-dei-prodotti-alimentari-italiani-esaminati-presenta-tracce-di-pesticidi/
2. https://www.phoresta.org/2021/06/14/i-pesticidi-e-la-loro-persistenza-nei-terreni/#:~:text=I%20ricercatori%20hanno%20dimostrato%20che,3) riduce%20la%20biodiversit%C3%A1%20del%20suolo.

Chi si sta muovendo:
L'Europa e in particolare l'Italia si stanno muovendo per abbassare la soglia di prodotti che presentano queste sostanze sintetiche e non.
Attualmente:
"Appena il 54,8% dei campioni analizzati tra gli alimenti che arrivano ogni giorno sulle tavole in Italia risulta senza residui di pesticidi. Nel 44,1% dei casi, dato in crescita rispetto allo scorso anno, sono state invece trovate tracce di uno o più fitofarmaci. La frutta si conferma la categoria più colpita: oltre il 70,3% dei campioni contiene almeno un residuo, in particolare nell’uva da tavola (88,37%), nelle pere (91,67%) e nelle pesche (80,65%)." -Fonte 1-

Tesi teorica:
Per un "futuro migliore" come viene discusso nei vari articoli citati. Serve avere una tavola priva di veleni e un terreno non arido. Per raggiungere questo scopo sarebbe necessario "imporre" ai coltivatori e alle aziende agricole delle regole ferree da seguire e un continuo ciclo di analisi sui prodotti. Questo potrebbe portare effettivamente a una situazione ideale.

Antitesi teorica:
Erigere un sistema dittatoriale con analisi così ferrate è inattuabile.
Se le spese dovessero essere sostenute del produttore, potrebbe diventare insostenibile per chi ha poca marginalità.
Con la libertà di presentare e scegliere il laboratorio a cui affidare la ricerca il sistema di controllo potrebbe essere facilmente manomesso e aggirato.

Soluzione Otti, all'atto pratico:
La soluzione proposta di Otti è una Dapp che mostrerà tramite una homepage iniziale una lista di prodotti con il certificato di analisi correlato e degli indicatori per rendere più trasmissivi i dati riscontrati.
La piattaforma presenterà la possibilitò agli utenti di donare tramite dei bandi e di scegliere il prodotto che si vorrebbe far analizzare. I bandi avranno una scadenza tale per cui il laboratorio di analisi affiliato possa eseguire l'analisi senza sovraccaricare il carico lavorativo dello stesso.
Al laboratio verrà presentata la possibilità di avere un profilo. abilitato al caricamento dei dati e del report necessario alla creazione di un NFT che verrà visionato poi sulla piattaforma.

Contract:

VotingSystem ->
Contratto con un sistema di voto per eleggere il prossimo prodotto da far analizzare.
Questo accessibile tramite una piccola donazione al processo.
Il periodo di voto sarà una media ponderata tra il tempo del laboratorio per eseguire l'analisi e un tempo per raccogliere 60/80% dell'analisi.
All'interno del contratto ci dovrà essere la proposta con già dei prodotti listati, non avrebbe senso lasciar la possibilità di aggiungere prodotti, si creerebbe una raccolta gigantesca di dati inutili. Anche se potrebbe aver senso con scopi futuri.

NFT1155->
Dovrà rappresentare le caratteristiche di un prodotto e del certificato lasciato dal laboratorio di ricerca, nel tempo gli NFT potrebbero avere più release per permettere alle aziende di farsi ricertificare.


Notarize->
Sistema basic di notarizzazione per salvare l'hash del certificato e poter essere inattaccabili dai deepFake e per presentare una effettiva copia del certificato, flusso c

Vault->
Tenere su un altro contratto il valore raccolto

OTTI Token->
Token che verrà rilasciato in cambio delle donazioni, inizialmente sarà utilizzato come contro valore per lasciare ai donatori qualcosa di concreto. Dopo il lancio del progetto, a seguito di possibili sviluppi, si vorrebbe adottare una metodologia di riscatto punti fedeltà. Dei prodotti di aziende che hanno voluto partecipare al processo di analisi volontariamente verranno spediti ai richiedenti in cambio di Otti tokens.

FE->
Una lista di prodotti con il relativo certificato, filtrabile per catgegorie, e degli indicatori flessibili per la presenza di pesticidi e altro.
