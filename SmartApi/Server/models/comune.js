const db = require('./db.js');

class Comune {
    constructor(comune) {
        this.id_regione = comune.id_regione;
        this.id_provincia = comune.id_provincia;
        this.id_zona = comune.id_zona;
        this.nome = comune.nome;
        this.capoluogo_provincia = comune.capoluogo_provincia;
        this.codice_ISTAT = comune.codice_ISTAT;
        this.codice_catastale = comune.codice_catastale;
        this.latitudine = comune.latitudine;
        this.longitudine = comune.longitudine;
        this.popolazione = comune.popolazione
        this.distanza_provincia = comune.distanza_provincia;
    }

    save() {
        // Non implementata
    }
}

Comune.findPkByNomeAndProvincia = (nomeComune, idProvincia) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM comune WHERE nome = ? AND id_provincia = ?`;
        db.execute(sql, [nomeComune, idProvincia])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Comune.findByNomeAndProvincia = (nomeComune, idProvincia) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM comune WHERE nome = ? AND id_provincia = ?`;
        db.execute(sql, [nomeComune, idProvincia])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Comune.findCoords = (nomeComune, idProvincia) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT latitudine,longitudine from comune WHERE ( nome= ? ) and ( id_provincia = ? )`;
        db.execute(sql, [nomeComune, idProvincia])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Comune.findPopolazione = (nomeComune, idProvincia) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT popolazione FROM comune WHERE ( nome = ? ) AND ( id_provincia = ? )`;
        db.execute(sql, [nomeComune, idProvincia])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Comune.findDistanzaProvincia = (nomeComune, idProvincia) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT distanza_provincia FROM comune WHERE ( nome =? ) AND ( id_provincia = ? )`;
        db.execute(sql, [nomeComune, idProvincia])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

module.exports = Comune;