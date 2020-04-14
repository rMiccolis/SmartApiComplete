const { workerData, parentPort, isMainThread } = require('worker_threads');
const Ricerca = require('../models/ricerca');
const calcolaPunteggio = require('./calcoloPunteggio')

async function threadStart() {
    if (!isMainThread) {
        const { query } = workerData;
        let ricerca = Ricerca.new();

        ricerca.address = query.indirizzo;
        ricerca.population = query.popolazione;
        ricerca.radius = query.raggio;
        ricerca.coords = query.coords;
        ricerca.distance = query.distanza;

        if (query.stato === 'leggi') {
            ricerca = await Ricerca.findByQuery(query, ricerca);
            parentPort.postMessage(ricerca);
        } else {
            ricerca = await calcolaPunteggio(query, ricerca);
            if (query.stato === 'aggiorna') {
                let aggiornamento = await Ricerca.update(query, ricerca);
                if (aggiornamento.tabelle == false) {
                    ricerca.success.status = false;
                    ricerca.success.error = aggiornamento.err;
                    ricerca.success.message = 'DB_ERROR_UPDATE:, query non registrata.';
                }

            } else if (query.stato === 'scrivi') {
                let inserimento = await Ricerca.save(query, ricerca);
                if (inserimento.tabelle == false) {
                    ricerca.success.status = false;
                    ricerca.success.error = inserimento.err;
                    ricerca.success.message = 'DB_ERROR_INSERT:, query non registrata.';
                }

            }
            parentPort.postMessage(ricerca);

        }

    } else {
        console.log("Non è il Thread principale");
    }

}

threadStart();