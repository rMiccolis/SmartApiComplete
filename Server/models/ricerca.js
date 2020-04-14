const Indicatore = require('../models/indicatore');
const Servizio = require('../models/servizio');
const Attivita = require('../models/attivita');
const UserQueryLocation = require('../models/user_query_location');
const InfoQuery = require('../models/info_query');
const RaggioAttivita = require('../models/raggio_attivita');
const Raggio = require('../models/raggio');

const Ricerca = () => { };
Ricerca.new = () => {
    return {
        total_score: 0.0,
        address: '',
        population: 0,
        distance: 0,
        radius: 0,
        coords: { lat: 0.0, lng: 0.0 },
        index: {
            bank: {
                nome: 'economia',
                score: 0.0,
                places: [],
            },
            restaurant: {
                nome: 'ristorazione',
                score: 0.0,
                places: [],
            },
            police: {
                nome: 'sicurezza',
                score: 0.0,
                places: [],
            },
            gym: {
                nome: 'ginnastica',
                score: 0.0,
                places: [],
            },
            hospital: {
                nome: 'salute',
                score: 0.0,
                places: [],
            },
            school: {
                nome: 'istruzione',
                score: 0.0,
                places: [],
            }
        },
        success: { status: true, error: null, message: null }
    };
};

Ricerca.ottieniFascia = (popolazione) => {
    let fascia = {
        type: 1,
        value: 0.125
    };

    if (popolazione < 100000) {
        fascia.value = 0.25;
        fascia.type = 1;
    }
    if (popolazione >= 100000 && popolazione < 1000000) {
        fascia.value = 0.125;
        fascia.type = 2;
    }
    if (popolazione >= 1000000) {
        fascia.value = 0.0833;
        fascia.type = 3;
    }

    return fascia;
}

Ricerca.ottieniPercentualePunteggioSecondario = (distanza, punteggio) => {
    let percentuale = 0.0;
    if (distanza > 5.000 && distanza <= 15.000) {
        percentuale = (punteggio * 66) / 100;
    } else if (distanza > 15.000 && distanza <= 25.000) {
        percentuale = (punteggio * 33) / 100;
    } else if (distanza > 25.000) {
        percentuale = 0;
    }

    return percentuale;
};

Ricerca.findByQuery = async (query, ricerca) => {
    let totale = 0.0;
    await Object.entries(ricerca.index).asyncForEach(async ([type, value]) => {
        const servizio = await Servizio.findPkByNome(value.nome);
        const indicatore = await Indicatore.findPunteggioSecondarioTotaleByRicerca(query.id_user_query_location, servizio.id, query.id_raggio);
        if (indicatore == null) {
            ricerca.success.status = false;
            ricerca.success.error = indicatore;
            ricerca.success.message = 'DB_ERROR: Punteggio secondario non trovato';
        } else {
            value.score = indicatore.punteggio_secondario_totale.toFixed(2);//Math.round(indicatore.score * 100) / 100;
            totale += indicatore.punteggio_secondario_totale;
        }
        const allPlace = await Attivita.findAllByLocationAndServizioAndRaggio(query.id_user_query_location, servizio.id, query.id_raggio);
        if (allPlace == null) {
            ricerca.success.status = false;
            ricerca.success.error = allPlace;
            ricerca.success.message = 'Places non trovati';
        } else {
            Object.assign(value.places, allPlace);
        }
    });
    ricerca.total_score = Math.round(totale / Object.keys(ricerca.index).length * 100) / 100;
    return ricerca;
};

Ricerca.save = async (query, ricerca) => {

    let messaggio = null;
    let inserito = true;
    let idUserQueryLocation = query.id_user_query_location;
    if (!idUserQueryLocation) {
        const user_query_location = new UserQueryLocation({
            id_comune: query.id_comune,
            id_provincia: query.id_provincia,
            indirizzo: query.indirizzo,
            cap: query.cap,
            latitudine: query.coords.lat,
            longitudine: query.coords.lng
        })
        idUserQueryLocation = await user_query_location.save();
    }
    const raggio = new Raggio({
        id_user_query_location: idUserQueryLocation,
        valore: query.raggio
    })
    const idRaggio = await raggio.save();
    if (idRaggio == null) {
        inserito = false;
        messaggio = 'DB_ERROR_RADIUS: Query non registrata correttamente';
    } else {
        let prezzo = 0.0; // TO DO: Gestire monetizzazione
        const infoQuery = new InfoQuery({
            id_utente: query.id_utente,
            id_user_query_location: idUserQueryLocation,
            id_raggio: idRaggio,
            prezzo: prezzo
        });
        const idInfoQuery = await infoQuery.save();
        if (idInfoQuery == null) {
            inserito = false;
            messaggio = 'DB_ERROR_INFOQUERY: Query non registrata correttamente';
        } else {
            // Abbiamo tutti gli ID, inseriamo nel DB tutti i place e i punteggi 
            await Object.entries(ricerca.index).asyncEvery(async ([type, value]) => {
                const servizio = await Servizio.findPkByNome(value.nome);
                if (servizio == null) {
                    inserito = false;
                    messaggio = 'DB_ERROR_SERVICE: Query non registrata correttamente';
                    return false;
                } else {
                    const numeroMesi = 6;
                    let dataScadenza = new Date();
                    dataScadenza = new Date(dataScadenza.setMonth(dataScadenza.getMonth() + numeroMesi));
                    const indicatore = new Indicatore({
                        id_user_query_location: idUserQueryLocation,
                        id_servizio: servizio.id,
                        punteggio_secondario_totale: value.score,
                        scadenza: dataScadenza,
                        id_raggio: idRaggio
                    });
                    const idIndicatore = await indicatore.save();
                    if (idIndicatore == null) {
                        inserito = false;
                        messaggio = 'DB_ERROR_INDICATOR: Query non registrata correttamente';
                        return false;
                    } else {
                        // inserisci tutti i place nel DB
                        await value.places.asyncEvery(async place => {
                            if (place.nome != '') {
                                let attivitaEsistente = await Attivita.findPkByNomeAndCoordsAndServizio(place.nome, place.latitudine, place.longitudine, servizio.id);
                                if (!attivitaEsistente) {
                                    const nuovaAttivita = new Attivita({
                                        nome: place.nome,
                                        indirizzo: place.indirizzo,
                                        latitudine: place.latitudine,
                                        longitudine: place.longitudine,
                                        id_servizio: servizio.id
                                    });
                                    idNuovaAttivita = await nuovaAttivita.save();
                                    if (idNuovaAttivita == null) {
                                        inserito = false;
                                        messaggio = 'DB_ERROR_PLACE: Query non registrata correttamente';
                                        return false;
                                    }
                                }
                                let idAttivita = (!attivitaEsistente) ? idNuovaAttivita : attivitaEsistente.id;
                                const raggioAttivita = new RaggioAttivita({
                                    id_raggio: idRaggio,
                                    id_attivita: idAttivita,
                                    id_user_query_location: idUserQueryLocation
                                });
                                const idRaggioAttivita = await raggioAttivita.save();
                                if (idRaggioAttivita == null) {
                                    return false;
                                } else {
                                    inserito = true;
                                    return true;

                                }
                            }
                            return true;
                        });
                        return true;
                    }
                }
            });
        }
    }
    return { tabelle: inserito, err: messaggio };
};

Ricerca.update = async (query, ricerca) => {

    let messaggio = null;
    let aggiornato = true;
    await Object.entries(ricerca.index).asyncEvery(async ([type, value]) => {
        let servizio = await Servizio.findPkByNome(value.nome);
        if (!servizio.id) {
            aggiornato = false;
            messaggio = 'DB_ERROR_SERVICE: Query non registrata correttamente';
            return false;
        } else {
            let attivita = await Attivita.findByLocationAndServizioAndRaggio(query.id_user_query_location, servizio.id, query.id_raggio)
            if (attivita.length == 0) {
                aggiornato = false;
                messaggio = 'DB_ERROR_SERVICE: Query non registrata correttamente';
            } else {
                for (let i = 0; i < attivita.length; i++) {
                    let rows = await Attivita.remove(attivita[i].id);
                    console.log(rows);
                    if (rows == null) {
                        aggiornato = false;
                        messaggio = 'DB_ERROR_SERVICE: Query non registrata correttamente';
                    } else {
                        aggiornato = true;
                    }
                }
            }
            let indicatore = await Indicatore.findByLocationAndServizioAndRaggio(query.id_user_query_location, servizio.id, query.id_raggio);
            if (indicatore == null) {
                aggiornato = false;
                messaggio = 'DB_ERROR_INDICATOR: Query non registrata correttamente';
                return false;
            } else {
                const numeroMesi = 6;
                let dataScadenza = new Date();
                dataScadenza = new Date(dataScadenza.setMonth(dataScadenza.getMonth() + numeroMesi));
                let rows = await Indicatore.update(value.score, dataScadenza, indicatore.id);
                if (rows == null) {
                    aggiornato = false;
                    messaggio = 'DB_ERROR_SERVICE: Query non registrata correttamente';
                } else {
                    // inserisci tutti i place nel DB
                    await value.places.asyncEvery(async place => {
                        if (place.nome != '') {
                            let attivitaEsistente = await Attivita.findPkByNomeAndCoordsAndServizio(place.nome, place.latitudine, place.longitudine, servizio.id);
                            if (!attivitaEsistente) {
                                const nuovaAttivita = new Attivita({
                                    nome: place.nome,
                                    indirizzo: place.indirizzo,
                                    latitudine: place.latitudine,
                                    longitudine: place.longitudine,
                                    id_servizio: servizio.id
                                });
                                idNuovaAttivita = await nuovaAttivita.save();
                                if (idNuovaAttivita == null) {
                                    inserito = false;
                                    messaggio = 'DB_ERROR_PLACE: Query non registrata correttamente';
                                    return false;
                                }
                            }
                            let idAttivita = (!attivitaEsistente) ? idNuovaAttivita : attivitaEsistente.id;
                            const raggioAttivita = new RaggioAttivita({
                                id_raggio: query.id_raggio,
                                id_attivita: idAttivita,
                                id_user_query_location: query.id_user_query_location
                            });
                            const idRaggioAttivita = await raggioAttivita.save();
                            if (raggioAttivita == null) {
                                aggiornato = false;
                                messaggio = 'DB_ERROR_RADIUSPLACE: Query non registrata correttamente';
                                return false;
                            } else {
                                aggiornato = true;
                                return true;
                            }
                        }
                        return true;
                    });
                    return true;
                }

            }
        }
    });

    return { tabelle: aggiornato, err: messaggio };
};

Array.prototype.asyncEvery = async function (callback, thisArg) {
    thisArg = thisArg || this
    for (let i = 0, l = this.length; i !== l; ++i) {
        await callback.call(thisArg, this[i], i, this)
    }
}

Array.prototype.asyncForEach = async function (callback, thisArg) {
    thisArg = thisArg || this
    for (let i = 0, l = this.length; i !== l; ++i) {
        await callback.call(thisArg, this[i], i, this)
    }
}

module.exports = Ricerca;