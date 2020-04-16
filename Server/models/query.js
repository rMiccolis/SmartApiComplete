class Query {
    constructor(idUtente, idProvincia, idComune, valoreRaggio) {
        this.id_utente = idUtente;
        this.id_provincia = idProvincia;
        this.id_comune = idComune;
        this.raggio = valoreRaggio;
    }
}

class QueryBuilder {
    constructor(idUtente, idProvincia, idComune, valoreRaggio) {
        this.query = new Query(idUtente, idProvincia, idComune, valoreRaggio);
    }

    setCoords(latitudine, longitudine) {
        this.query.coords = { lat: parseFloat(latitudine), lng: parseFloat(longitudine) };
        return this;
    }

    setIndirizzo(indirizzo) {
        this.query.indirizzo = indirizzo;
        return this;
    }

    setCap(cap) {
        this.query.cap = cap;
        return this;
    }

    setIdUserQueryLocation(idUserQueryLocation) {
        this.query.id_user_query_location = idUserQueryLocation;
        return this;
    }

    setStato(stato) {
        this.query.stato = stato;
        return this;
    }

    setIdRaggio(idRaggio) {
        this.query.id_raggio = idRaggio;
        return this;
    }

    setPopolazione(popolazione) {
        this.query.popolazione = popolazione;
        return this;
    }

    setDistanza(distanza) {
        this.query.distanza = distanza;
        return this;
    }

    build() {
        return this.query;
    }
}
QueryBuilder.formattaIndirizzo = (comune, { civico = null, indirizzo = null } = {}) => {
    if (!civico && !indirizzo && civico != undefined && indirizzo != undefined) {
        indirizzo = indirizzo + ',' + civico;
    } else if (indirizzo == '' || indirizzo == undefined) {
        indirizzo = comune;
    }
    return indirizzo;
}
module.exports = QueryBuilder;