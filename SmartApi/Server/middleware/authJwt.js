const jwt = require('jsonwebtoken');


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).send({
        message: "Nessun token fornito!"
    });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).send({
            message: "Utente non autorizzato!"
        });
        req.body.id = decoded.id;
        next();
    })
}

module.exports = authenticateToken;