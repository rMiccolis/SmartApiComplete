const db = require('./db.js');

class InfoQuery {
    constructor(infoQuery) {
        this.id_utente = infoQuery.id_utente;
        this.id_user_query_location = infoQuery.id_user_query_location;
        this.id_raggio = infoQuery.id_raggio;
        this.prezzo = infoQuery.prezzo;
    }

    save() {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO info_query (id_utente, id_user_query_location, id_raggio, prezzo) VALUES (?, ?, ?, ?)';
            db.execute(sql, [this.id_utente, this.id_user_query_location, this.id_raggio, this.prezzo])
                .then(([rows]) => {
                    resolve(rows.insertId);
                }).catch(err => reject(err));
        });
    }
}

module.exports = InfoQuery;