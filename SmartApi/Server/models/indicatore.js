const db = require('./db.js');

class Indicatore {
    constructor(indicatore) {
        this.id_user_query_location = indicatore.id_user_query_location;
        this.id_servizio = indicatore.id_servizio;
        this.punteggio_secondario_totale = indicatore.punteggio_secondario_totale;
        this.scadenza = indicatore.scadenza;
        this.id_raggio = indicatore.id_raggio;
    }

    save() {
        return new Promise((resolve, reject) => {
            const dataScadenza = (Object.prototype.toString.call(this.scadenza) === "[object Date]") ? this.scadenza.toISOString().slice(0, 19).replace('T', ' ') : this.scadenza;
            const sql = 'INSERT INTO indicatore (id_user_query_location, id_servizio, punteggio_secondario_totale, scadenza, id_raggio) VALUES (?, ?, ?, ?, ?)';
            db.execute(sql, [this.id_user_query_location, this.id_servizio, this.punteggio_secondario_totale, dataScadenza, this.id_raggio])
                .then(([rows]) => {
                    resolve(rows.insertId);
                }).catch(err => reject(err));
        });
    }
}

Indicatore.findByLocationAndServizioAndRaggio = (idUserQueryLocation, idServizio, idRaggio) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM indicatore WHERE id_user_query_location = ? AND id_servizio = ? AND id_raggio = ?`;
        db.execute(sql, [idUserQueryLocation, idServizio, idRaggio])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Indicatore.findPkByRicerca = (idUserQueryLocation, idServizio, idRaggio) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM indicatore WHERE id_user_query_location = ? AND id_servizio = ? AND id_raggio = ?`;
        db.execute(sql, [idUserQueryLocation, idServizio, idRaggio])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Indicatore.findPunteggioSecondarioTotaleByRicerca = (idUserQueryLocation, idServizio, idRaggio) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT punteggio_secondario_totale FROM indicatore WHERE id_user_query_location = ? AND id_servizio = ? AND id_raggio = ?`;
        db.execute(sql, [idUserQueryLocation, idServizio, idRaggio])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Indicatore.update = (valoreIndicatore, dataScadenza, idIndicatore) => {
    return new Promise((resolve, reject) => {
        const nuovaDataScadenza = (Object.prototype.toString.call(dataScadenza) === "[object Date]") ? dataScadenza.toISOString().slice(0, 19).replace('T', ' ') : dataScadenza;
        const sql = `UPDATE indicatore SET punteggio_secondario_totale = ?, scadenza = ? WHERE id = ?`;
        db.execute(sql, [valoreIndicatore, nuovaDataScadenza, idIndicatore])
            .then(([rows]) => {
                if (rows.affectedRows == 0) {
                    resolve(null);
                } else {
                    resolve(rows);
                }
            }).catch(err => reject(err));
    });
}

module.exports = Indicatore;


// calcolaDataScadenza(numeroMesi){
//     let data = new Date();
//     data = new Date(data.setMonth(data.getMonth() + numeroMesi));
//     return this.scadenza = data.toISOString().slice(0, 19).replace('T', ' ');
// }