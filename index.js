import express from 'express';
import jwt from 'jsonwebtoken';
import "dotenv/config";
import { results } from './data/agentes.js';

// Creación de variables de entorno
import { fileURLToPath } from 'url'
import { dirname } from "path";


// Variables que me permiten mostrar el path donde estoy en el proyecto
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { secretKey } = process.env
const { PORT } = process.env
console.log('PORT: ', PORT)

const app = express()
console.clear()

//ruta get para leer el html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

//ruta get 
app.get('/SignIn', (req, res) => {
    const { email, password } = req.query;
    const agente = results.find(a => a.email === email && a.password === password)

    if (agente) {
        //si existe el agente, se genera el token con tiempo de expiración 2 minutos
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 120, //2 minutos
            data: agente
        },
            secretKey);

        res.send(`<h4>
        <a href="/rutaSecreta?token=${token}" title ="Bienvenido al sistema del FBI">Puede ingresar al sistema ${agente.email}</a> </h4>
        <script>sessionStorage.setItem('token', JSON.stringify('${token}'))</script>`)
    } else {
        res.status(401).send(`<h2>Usuario o contraseña incorrectos</h2>`)
    }
})

app.get('/rutaSecreta', (req, res) => {
    const { token } = req.query

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(401).send({
                error: '401 usuario no autorizado',
                message: err.message
            })
        } else {
            res.send(`<div style="text-align: center;">
            <h2 style="display: inline;">Bienvenido a la ruta secreta <br> ${decoded.data.email}</h2>
          </div>`)
        }

    })

})

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})

