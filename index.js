const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { getUsuario, verificarCredenciales, registrarUsuario} = require('./consultas');
const { chequearCredenciales} = require('./middleware');
const { secretKey } = require('./secretKey');

app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(express.json());

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server is running in port: ${PORT}`);
});

/* GET Usuarios con JWT */
app.get("/usuarios", verificarToken, async (req, res) => {
    try {
        // El token ya está verificado en el middleware verificarToken
        const decodedToken = req.decodedToken;

        // Obtener el usuario por su email
        const usuario = await getUsuario(decodedToken.email);

        // Devolver los datos del usuario
        res.json(usuario);
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/* Middleware para verificar token JWT */
function verificarToken(req, res, next) {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ error: "No autorizado", message: "Token no proporcionado" });
    }
    try {
        // Elimina la cadena "Bearer " del token
        const decodedToken = jwt.verify(token.replace("Bearer ", ""), secretKey);
        req.decodedToken = decodedToken;
        next();
    } catch (error) {
        console.error("Error al verificar el token:", error);
        return res.status(401).json({ error: "No autorizado", message: "Token inválido" });
    }
}

/* POST Login */
// POST Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const sonCredencialesValidas = await verificarCredenciales(email, password);

        if (sonCredencialesValidas) {
            // Firma un token JWT con una expiración de 1 hora (3600 segundos)
            const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
            res.status(200).json({ token });
        } else {
            // Credenciales inválidas
            res.status(401).json({ error: "No autorizado", message: "Credenciales inválidas" });
        }
    } catch (error) {
        // Error interno del servidor
        res.status(500).json({ error: "Error interno del servidor", errorMessage: error.message });
    }
});


/* POST Usuarios */
app.post("/usuarios", chequearCredenciales, async (req, res) => {
    try {
        const usuario = req.body;
        await registrarUsuario(usuario);
        res.send("Usuario creado con éxito");
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor", errorMessage: error.message });
    }
});
