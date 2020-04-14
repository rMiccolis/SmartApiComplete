const db = require('./db.js');

class Servizio {
    constructor(servizio) {
        this.nome = servizio.nome;
    }

    save() {
        // Non implementata
    }
}

Servizio.findPkByNome = (nomeServizio) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM servizio WHERE nome = ?`;
        db.execute(sql, [nomeServizio])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

Servizio.findFirstPk = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM servizio ORDER BY id ASC LIMIT 1;`;
        db.execute(sql)
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

module.exports = Servizio;