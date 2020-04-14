const QueryBuilder = require('../models/query');
const Provincia = require('../models/provincia');
const Comune = require('../models/comune');
const UserQueryLocation = require('../models/user_query_location');
const Raggio = require('../models/raggio');
const Indicatore = require('../models/indicatore');
const Servizio = require('../models/servizio');
const User = require('../models/user');


const Google = require('../models/google')

async function checkQueryUser(req, res, next) {

    let richiesta = (Object.keys(req.query).length === 0) ? req.body : req.query;
    let tipoRichiesta;

    if (Object.keys(req.query).length === 0) {
        richiesta = req.body
        tipoRichiesta = "POST"
    } else {
        richiesta = req.query
        tipoRichiesta = "GET"
        if (richiesta.apikey == null) {
            return res.status(401).send({
                message: "Chiave API mancante"
            });
        } else {
            const utente = await User.findByApiKey(richiesta.apikey);
            if (!utente) {
                return res.status(401).send({
                    message: "Utente inesistente o non autorizzato"
                });
            } else {
                richiesta.id = utente.id;
            }
        }
    }

    if (!richiesta.id) {
        return res.status(401).send({
            message: "Utente inesistente o non autorizzato"
        });
    } else if (tipoRichiesta !== 'POST' && !richiesta.apikey) {
        return res.status(401).send({
            message: "Devi possedere una chiave API per eseguire questa richiesta."
        });
    }

    if (richiesta.country !== 'Italy' && richiesta.country !== 'Italia') {
        return res.status(400).send({
            message: "Seleziona città presenti nel territorio italiano"
        });
    }

    if (!richiesta.locality || !richiesta.administrative_area_level_2) {
        return res.status(400).send({
            message: "Comune o provincia non trovata, riprova la ricerca!"
        });
    }

    if (!richiesta.radius) {
        return res.status(400).send({ message: "Dati insufficienti, riprovare la ricerca o contattare il supporto." });
    }

    try {
        const provincia = await Provincia.findPkBySiglaAutomobilistica(richiesta.administrative_area_level_2);
        if (!provincia) {
            return res.status(400).send({ message: "Dati insufficienti, riprovare la ricerca o contattare il supporto." });
        }

        const comune = await Comune.findByNomeAndProvincia(richiesta.locality, provincia.id);
        if (!comune) {
            return res.status(400).send({ message: "Dati insufficienti, riprovare la ricerca o contattare il supporto." });
        }

        if (comune.popolazione == '' || comune.distanza == '') {
            return res.status(400).send({
                message: "Dati insufficienti, riprovare la ricerca o contattare il supporto."
            });
        }

        const builder = new QueryBuilder(richiesta.id, provincia.id, comune.id, richiesta.radius)
        let query = builder.setPopolazione(comune.popolazione)
            .setDistanza(comune.distanza_provincia).build();

        const indirizzoFormattato = QueryBuilder.formattaIndirizzo(richiesta.locality, { civico: richiesta.street_number, indirizzo: richiesta.route });
        const user_query_location = await UserQueryLocation.findByComuneAndProvinciaAndIndirizzo(comune.id, provincia.id, indirizzoFormattato);
        let statoQuery;

        if (!user_query_location) {

            statoQuery = 'scrivi'

            query = builder.setIdUserQueryLocation(null)
                .setIndirizzo(indirizzoFormattato)
                .setStato(statoQuery)
                .setIdRaggio(null)
                .build()

            if (!richiesta.route) {
                if (!comune.latitudine || !comune.longitudine) {
                    return res.status(400).send({
                        message: "Dati insufficienti, riprovare la ricerca o contattare il supporto."
                    });
                }
                query = builder.setCoords(comune.latitudine, comune.longitudine).build()

            } else {
                let indirizzoFormattatoDaInviareAGoogle;
                if (!richiesta.street_number) {
                    indirizzoFormattatoDaInviareAGoogle = `${richiesta.route}+${richiesta.locality}+${richiesta.administrative_area_level_2}`
                } else {
                    indirizzoFormattatoDaInviareAGoogle = `${richiesta.street_number}+${richiesta.route}+${richiesta.locality}+${richiesta.administrative_area_level_2}`;
                }
                const coords = await Google.getGoogleCoordinates(indirizzoFormattatoDaInviareAGoogle);
                if (!coords) {
                    return res.status(400).send({ message: "Dati insufficienti, riprovare la ricerca o contattare il supporto." });
                }
                query = builder.setCoords(coords.lat, coords.lng).build()
            }

            if (richiesta.postal_code) {
                query = builder.setCap(richiesta.postal_code).build();
            } else {
                query = builder.setCap(null).build();
            }

        } else {
            // Questa query è stata fatta
            const raggio = await Raggio.findPkByRaggioLocation(richiesta.radius, user_query_location.id);
            if (!raggio) {
                statoQuery = 'scrivi';
                query = builder.setIdRaggio(null).build();
            } else {
                query = builder.setIdRaggio(raggio.id).build();
                const servizio = await Servizio.findFirstPk();
                if (!servizio) {
                    return res.status(400).send({ message: "Dati insufficienti, riprovare la ricerca o contattare il supporto." });
                }

                const indicatore = await Indicatore.findByLocationAndServizioAndRaggio(user_query_location.id, servizio.id, raggio.id);
                if (!indicatore) {
                    return res.status(400).send({ message: "Dati insufficienti, riprovare la ricerca o contattare il supporto." });
                }

                let data = new Date();
                let dataIndicatore = new Date(indicatore.scadenza);
                if (data.getTime() > dataIndicatore.getTime()) {
                    statoQuery = 'aggiorna';
                } else {
                    statoQuery = 'leggi';
                }

            }

            query = builder.setIdUserQueryLocation(user_query_location.id)
                .setCoords(user_query_location.latitudine, user_query_location.longitudine)
                .setIndirizzo(user_query_location.indirizzo)
                .setCap(user_query_location.cap)
                .setStato(statoQuery)

                .build()
        }

        req.body.query = query;

    } catch (err) {
        res.status(500).send({ message: err.message });
    }

    next();

}

module.exports = checkQueryUser;