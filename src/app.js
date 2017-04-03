// Libs
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const routes = require('./routes/v1')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const config = require('./config')
const User = require('./models/user')

// Config
const port = process.env.PORT || 8001
const app = express()
mongoose.connect(config.database)

// Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use("/api/v1", routes)
app.set('jwtSecret', config.secret)

// Actions
app.listen(port, () => console.log(`Hex API - Server Listening on port ${port}`))