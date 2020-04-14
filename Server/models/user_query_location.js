const db = require('./db.js');

class UserQueryLocation {
    constructor(userQueryLocation) {
        this.id_comune = userQueryLocation.id_comune;
        this.id_provincia = userQueryLocation.id_provincia;
        this.indirizzo = userQueryLocation.indirizzo;
        this.cap = userQueryLocation.cap;
        this.latitudine = userQueryLocation.latitudine;
        this.longitudine = userQueryLocation.longitudine;
    }

    save() {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO user_query_location (id_comune, id_provincia, indirizzo, cap, latitudine, longitudine) VALUES (?, ?, ?, ?, ?, ?)';
            db.execute(sql, [this.id_comune, this.id_provincia, this.indirizzo, this.cap, this.latitudine, this.longitudine])
                .then(([rows]) => {
                    resolve(rows.insertId);
                }).catch(err => reject(err));
        });
    }
}

UserQueryLocation.findPkByComuneAndProvinciaAndIndirizzo = (idComune, idProvincia, indirizzo) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM user_query_location WHERE id_comune = ? AND id_provincia = ? AND indirizzo  = ?`;
        db.execute(sql, [idComune, idProvincia, indirizzo])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

UserQueryLocation.findByComuneAndProvinciaAndIndirizzo = (idComune, idProvincia, indirizzo) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM user_query_location WHERE id_comune = ? AND id_provincia = ? AND indirizzo  = ?`;
        db.execute(sql, [idComune, idProvincia, indirizzo])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

UserQueryLocation.findPkByRaggio = (idRaggio, idUserQueryLocation) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT uql.id FROM user_query_location as uql INNER JOIN raggio as r ON (r.id_user_query_location = uql.id) WHERE r.id = ? AND uql.id = ?`;
        db.execute(sql, [idRaggio, idUserQueryLocation])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

UserQueryLocation.findCoords = (idUserQueryLocation) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT latitudine, longitudine FROM user_query_location WHERE id = ?`;
        db.execute(sql, [idUserQueryLocation])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

module.exports = UserQueryLocation;