const db = require('./db.js');

class Attivita {
    constructor(attivita) {
        this.nome = attivita.nome;
        this.indirizzo = attivita.indirizzo;
        this.latitudine = attivita.latitudine;
        this.longitudine = attivita.longitudine;
        this.id_servizio = attivita.id_servizio;
    }

    save() {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO attivita (nome, indirizzo, latitudine, longitudine, id_servizio) VALUES (?, ?, ?, ?, ?)';
            db.execute(sql, [this.nome, this.indirizzo, this.latitudine, this.longitudine, this.id_servizio])
                .then(([rows]) => {
                    resolve(rows.insertId);
                }).catch((err) => {
                    if (err.message.includes('Duplicate entry')) {
                        resolve(err);
                    }
                    reject(err)
                });
        });
    }
}

Attivita.findByLocationAndServizio = (idUserQueryLocation, idServizio) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT a.id, a.nome, a.indirizzo, a.latitudine, a.longitudine FROM attivita AS a 
        INNER JOIN servizio AS s ON a.id_servizio = s.id 
        INNER JOIN raggio_attivita AS ra ON ra.id_attivita = a.id 
        WHERE ( ra.id_user_query_location = ? ) AND ( a.id_servizio = ? )`;
        db.execute(sql, [idUserQueryLocation, idServizio])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Attivita.findAllByLocationAndServizioAndRaggio = (idUserQueryLocation, idServizio, idRaggio) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT a.nome, a.indirizzo, a.latitudine, a.longitudine FROM attivita AS a 
        INNER JOIN servizio AS s ON a.id_servizio = s.id 
        INNER JOIN raggio_attivita AS ra ON ra.id_attivita = a.id 
        WHERE ( ra.id_user_query_location = ? ) AND ( a.id_servizio = ? ) AND (ra.id_raggio = ? )`;
        db.execute(sql, [idUserQueryLocation, idServizio, idRaggio])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Attivita.findPkByNomeAndCoordsAndServizio = (nomeAttivita, latitudine, longitudine, idServizio) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM attivita WHERE ( nome = ? ) AND ( latitudine = ? ) AND ( longitudine = ?) AND ( id_servizio = ? )`;
        db.execute(sql, [nomeAttivita, latitudine, longitudine, idServizio])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Attivita.findPkByNomeAndCoordsAndServizio = (nomeAttivita, latitudine, longitudine, idServizio) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM attivita WHERE ( nome = ? ) AND ( latitudine = ? ) AND ( longitudine = ?) AND ( id_servizio = ? )`;
        db.execute(sql, [nomeAttivita, latitudine, longitudine, idServizio])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Attivita.remove = (idAttivita) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM attivita WHERE id = ?`;
        db.execute(sql, [idAttivita])
            .then(([rows]) => {
                if (rows.affectedRows == 0) {
                    resolve(null);
                } else {
                    resolve(rows);
                }
            }).catch(err => reject(err));
    });
}



module.exports = Attivita;