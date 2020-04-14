const db = require('./db.js');

class RaggioAttivita {
    constructor(raggioAttivita) {
        this.id_raggio = raggioAttivita.id_raggio;
        this.id_attivita = raggioAttivita.id_attivita;
        this.id_user_query_location = raggioAttivita.id_user_query_location;
    }

    save() {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO raggio_attivita (id_raggio, id_attivita, id_user_query_location) VALUES (?, ?, ?)';
            db.execute(sql, [this.id_raggio, this.id_attivita, this.id_user_query_location])
                .then(([rows]) => {
                    resolve(rows.insertId);
                }).catch(err => reject(err));
        });
    }
}

module.exports = RaggioAttivita;