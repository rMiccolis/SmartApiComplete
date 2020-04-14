const db = require('./db.js');

class PunteggioSecondarioTotale {
    constructor(punteggioSecondarioTotale) {
        this.id_provincia = punteggioSecondarioTotale.id_provincia;
        this.salute = punteggioSecondarioTotale.salute;
        this.sicurezza = punteggioSecondarioTotale.sicurezza;
        this.istruzione = punteggioSecondarioTotale.istruzione;
        this.economia = punteggioSecondarioTotale.economia;
        this.ristorazione = punteggioSecondarioTotale.ristorazione;
        this.ginnastica = punteggioSecondarioTotale.ginnastica;
    }

    save() {
        // Non implementata
    }
}

PunteggioSecondarioTotale.findPunteggioSecondarioByProvincia = (idProvincia) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM punteggio_secondario where ( id_provincia = ? )`;
        db.execute(sql, [idProvincia])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}


module.exports = PunteggioSecondarioTotale;