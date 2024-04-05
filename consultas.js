const { Pool } = require('pg')
require('dotenv').config();
const bcrypt = require('bcryptjs')

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'danath007',
    database: 'softjobs',
    allowExitOnIdle: true
})

const getUsuario = async (email) => {
    try {
        // Realiza la consulta a la base de datos para obtener el usuario por email
        const query = "SELECT id, nombre FROM usuarios WHERE email = $1";
        const values = [email];
        const { rows, rowCount } = await pool.query(query, values);

        if (rowCount === 0) {
            throw { status: 404, message: "No existe usuario con el email ingresado" };
        }

        // Elimina la contraseña antes de devolver los datos
        const usuario = {
            id: rows[0].id,
            nombre: rows[0].nombre,
            email: email
        };

        return usuario;
    } catch (error) {
        // Maneja los errores de la consulta SQL y otros errores
        throw error; // Lanza el error para que sea manejado en el nivel superior
    }
};


const verificarCredenciales = async (email, password) => {
    try {
        const values = [email];
        const consulta = "SELECT * FROM usuarios WHERE email = $1";

        const result = await pool.query(consulta, values);
        if (result.rows.length === 0) {
            throw { code: 401, message: "El correo electrónico no existe" };
        }

        const passEncriptada = result.rows[0].password;
        const passwordEsCorrecta = bcrypt.compareSync(password, passEncriptada);

        if (!passwordEsCorrecta) {
            throw { code: 401, message: "Contraseña incorrecta" };  // Corrige la falta de tilde
        }

        return true;  // Devuelve true si las credenciales son válidas
    } catch (error) {
        throw error;  // Vuelve a lanzar el error
    }
};




const registrarUsuario = async (usuario) => {
    let { email, password, rol, lenguage } = usuario
    const passwordEncriptada = bcrypt.hashSync(password)
    password = passwordEncriptada
    const values = [email, passwordEncriptada, rol, lenguage]
    const consulta = "INSERT INTO usuarios values (DEFAULT, $1, $2, $3, $4)"
    await pool.query(consulta, values)
}


module.exports = { getUsuario, verificarCredenciales, registrarUsuario }