const jwt = require('jsonwebtoken');
const { secretKey } = require('./secretKey');

const chequearCredenciales = async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(401).send({ message: "Email o contraseña inválida" })
    }
    next()
}



/* Middleware para verificar token JWT */




module.exports = { chequearCredenciales }