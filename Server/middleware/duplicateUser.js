const User = require('../models/user');


async function checkDuplicateUser(req, res, next) {
    let user = await User.findByUsername(req.body.username);
    if (user) {
        res.status(400).send({
            message: "Nome utente già presente"
        });
        return;
    }
    user = await User.findByEmail(req.body.email);
    if (user) {
        res.status(400).send({
            message: "Email utente già presente"
        });
        return;
    }
    next();
}

module.exports = checkDuplicateUser;