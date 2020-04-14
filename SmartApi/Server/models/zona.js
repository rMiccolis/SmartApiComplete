const db = require('./db.js');

class Zona {
    constructor(zona) {
        this.codice = zona.codice;
        this.nome = zona.nome;
    }

    save() {
        // Non implementata
    }
}

module.exports = Zona;