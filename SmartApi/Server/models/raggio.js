const db = require('./db.js');

class Raggio {
    constructor(raggio) {
        this.id_user_query_location = raggio.id_user_query_location;
        this.valore = raggio.valore;
    }

    save() {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO raggio (id_user_query_location, valore) VALUES (?, ?)';
            db.execute(sql, [this.id_user_query_location, this.valore])
                .then(([rows]) => {
                    resolve(rows.insertId);
                }).catch(err => reject(err));
        });
    }
}

Raggio.findByValore = (valoreRaggio) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM raggio WHERE valore = ?`;
        db.execute(sql, [valoreRaggio])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Raggio.findPkByRaggioLocation = (valoreRaggio, idUserQueryLocation) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM raggio WHERE valore = ? AND id_user_query_location = ?`;
        db.execute(sql, [valoreRaggio, idUserQueryLocation])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

module.exports = Raggio;