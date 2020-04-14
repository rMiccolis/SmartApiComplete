const Ricerca = require('../models/ricerca');
const Google = require('../models/google');
const PunteggioSecondario = require('../models/punteggio_secondario_totale');

calcolaPunteggio = async (query, ricerca) => {

    let fascia = Ricerca.ottieniFascia(ricerca.population);
    // recupera per ciascun servizio i place da Google, eliminando le informazioni non necessarie
    await Object.entries(ricerca.index).asyncEvery(async ([type, value]) => {
        let nearbyPlace = await Google.getNearbyPlaces(query.coords.lat, query.coords.lng, type, query.raggio, fascia);
        if (nearbyPlace.places == null) {
            ricerca.success.status = false;
            ricerca.success.error = nearbyPlace.err;
            ricerca.success.message = 'GOOGLE_API_ERROR: Punteggio non disponibile, contattare il supporto.';
            return false;
        } else {
            let placesReformat = [];
            nearbyPlace.places.forEach((place) => {
                placesReformat.push({ nome: place.name, indirizzo: place.vicinity, latitudine: place.geometry.location.lat, longitudine: place.geometry.location.lng });
            });
            Object.assign(value.places, placesReformat);
            return true;
        }
    });

    // recupera il punteggio secondario relativo e calcola il punteggio totale
    let score = await PunteggioSecondario.findPunteggioSecondarioByProvincia(query.id_provincia);
    if (score == null) {
        ricerca.success.status = false;
        ricerca.success.error = nearbyPlace.err;
        ricerca.success.message = 'DB_ERROR: Punteggio secondario non disponibile.';
    } else {
        let totale = 0.0;
        Object.entries(ricerca.index).forEach(([type, value]) => {
            // assegnamo il valore secondario recuperato dal DB
            value.score = score[value.nome];
            // calcoliamo la percentuale in base alla distanza dalla provicina
            let percentuale = Ricerca.ottieniPercentualePunteggioSecondario(query.distanza, score[value.nome]);
            value.score = Math.round((score[value.nome] - percentuale) * 100) / 100;
            // aggiungiamo il punteggio relativo alla fascia 
            value.score += value.places.length * fascia.value;

            if (value.score < 0)
                value.score = 0;
            else if (value.score > 5)
                value.score = 5;
            value.score = Math.round(value.score * 100) / 100;
            totale += value.score;

        });
        totale = totale / Object.keys(ricerca.index).length;
        ricerca.total_score = Math.round(totale * 100) / 100;
    }
    return ricerca;
};

Array.prototype.asyncEvery = async function (callback, thisArg) {
    thisArg = thisArg || this
    for (let i = 0, l = this.length; i !== l; ++i) {
        await callback.call(thisArg, this[i], i, this)
    }
}

module.exports = calcolaPunteggio;