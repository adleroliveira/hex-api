// Libs
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// Config
const port = 8001

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.get('/', (_, res) => res.send('hello world'))

// Actions
app.listen(port, () => console.log(`Hex API - Server Listening on port ${port}`))