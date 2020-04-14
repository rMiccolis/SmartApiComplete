const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const User = require('../../models/user');
const checkDuplicateUser = require('../../middleware/duplicateUser')
const authenticateToken = require('../../middleware/authJwt')

// Create Users Route
router.post('/signup', checkDuplicateUser, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            nome: req.body.nome,
            cognome: req.body.cognome,
            saldo: 0,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            apikey: uuidv4()
        })
        const newUser = await user.save();
        res.status(201).send({
            message: "Registrazione effettuata con successo!"
        });
    } catch (err) {
        res.status(500).send({
            message: "Registrazione non effettuata. Riprova più tardi"
        });
    }
});

router.post('/signin', async (req, res) => {
    const user = await User.findByUsername(req.body.username);
    if (user == null) {
        return res.status(404).send({ message: "Utente non trovato." });
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: 86400 // 24 ore
            });
            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                accessToken: token,
                apikey: user.apikey
            });
        } else {
            return res.status(401).send({
                accessToken: null,
                message: "Password errata!"
            });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }

});

module.exports = router;