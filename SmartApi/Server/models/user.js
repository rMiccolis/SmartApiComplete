const db = require('./db.js');

class User {
    constructor(user) {
        this.nome = user.nome;
        this.cognome = user.cognome;
        this.saldo = user.saldo;
        this.username = user.username;
        this.email = user.email;
        this.password = user.password;
        this.apikey = user.apikey;
    }
    save() {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO users (nome, cognome, saldo, username, email, password, apikey) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.execute(sql, [this.nome, this.cognome, this.saldo, this.username, this.email, this.password, this.apikey])
                .then(([rows]) => {
                    resolve(rows.insertId);
                }).catch(err => reject(err));
        });
    }
};

User.findByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE username = ?`;
        db.execute(sql, [username])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

User.findByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE email = ?`;
        db.execute(sql, [email])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

User.findByApiKey = (apiKey) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE apikey = ?`;
        db.execute(sql, [apiKey])
            .then(([rows]) => {
                if (rows.length) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => reject(err));
    });
}

User.remove = (idUtente) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM users WHERE id = ?`;
        db.execute(sql, [idUtente])
            .then(([rows]) => {
                if (rows.affectedRows == 0) {
                    resolve(null);
                } else {
                    resolve(rows);
                }
            }).catch(err => reject(err));
    });
}

module.exports = User;