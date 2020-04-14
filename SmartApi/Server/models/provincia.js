const db = require('./db.js');

class Provincia {
    constructor(provincia) {
        this.id_regione = provincia.id_regione;
        this.codice_storico = provincia.codice_storico;
        this.nome = provincia.nome;
        this.sigla_automobilistica = provincia.sigla_automobilistica;
        this.latitudine = provincia.latitudine;
        this.longitudine = provincia.longitudine;
    }

    save() {
        // Non implementata
    }
}

Provincia.findPkBySiglaAutomobilistica = (sigla_automobilistica) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM provincia WHERE sigla_automobilistica = ?`;
        db.execute(sql, [sigla_automobilistica])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Provincia.findBySiglaAutomobilistica = (sigla_automobilistica) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM provincia WHERE sigla_automobilistica = ?`;
        db.execute(sql, [sigla_automobilistica])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

module.exports = Provincia;