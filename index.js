// Libs
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// Config
const port = process.env.PORT || 8001

// Middleware
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Routes
app.get('/', (_request, response) => response.send('hello world'))

app.get('/users', (_request, response) => {
  response.send([])
})

app.post('/users', (_request, response) => {
  response.send("ok")
})

// Actions
app.listen(port, () => console.log(`Hex API - Server Listening on port ${port}`))
