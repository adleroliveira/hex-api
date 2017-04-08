// Libs
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const routes = require('./routes/v1')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const rfs = require('rotating-file-stream')

const config = require('./config')
const User = require('./models/user')

// Log in file
const logDirectory = path.join(__dirname, 'log')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
const accessLogStream = rfs('access.log', {
  interval: '1d',
  path: logDirectory
})

// Config
const port = process.env.PORT || 8001
const app = express()
mongoose.connect(config.database)

// Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use(morgan(':remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms', {stream: accessLogStream}))
app.use("/api/v1", routes)
app.set('jwtSecret', config.secret)

// Actions
app.listen(port, () => console.log(`Hex API - Server Listening on port ${port}`))