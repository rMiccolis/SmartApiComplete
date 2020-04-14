const express = require('express');
const router = express.Router();
const Provincia = require('../../models/provincia');
const Comune = require('../../models/comune');
const UserQueryLocation = require('../../models/user_query_location');
const Raggio = require('../../models/raggio');
const User = require('../../models/user');
const checkQueryUser = require('../../middleware/validateInput');
const authenticateToken = require('../../middleware/authJwt')

router.post('/score', authenticateToken, checkQueryUser, async (req, res) => {

    console.log(req.body.query);
    let query = req.body.query;
    const { Worker } = require('worker_threads');
    const worker = new Worker('./controllers/elaboraQuery.js', {
        workerData: { query }
    })
    worker.on("error", (err) => console.log(err));
    worker.on("exit", () => console.log("exit"));
    worker.on("message", (data) => {

        if (data.success.status) {
            res.status(200).send(data);
        }
        else {
            res.status(400).send({ message: data.success.message });
        }
    });
});

router.get('/score', checkQueryUser, async (req, res) => {

    let query = req.body.query;
    const { Worker } = require('worker_threads');
    const worker = new Worker('./controllers/elaboraQuery.js', {
        workerData: { query }
    })
    worker.on("error", (err) => console.log(err));
    worker.on("exit", () => console.log("exit"));
    worker.on("message", (data) => {

        if (data.success.status) {
            res.status(200).send(data);
        }
        else {
            res.status(400).send({ message: data.success.message });
        }
    });
});

module.exports = router;