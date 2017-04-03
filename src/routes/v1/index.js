const router = require("express").Router()
const User = require('../../models/user')
const jwt = require('jsonwebtoken')
const config = require('../../config')

// # Routes without middleware
router.get('/', (req, res) => {
  console.log(req.user)
  res.status(200).json({ message: 'get' })
})

router.get('/setup', (req, res) => {
  // create a sample user
  const admin = new User({
    name: 'Pica das galaxias',
    password: '123',
    admin: true
  })

  // save the sample user
  admin.save((err) => {
    if (err) return res.status(500).json({ error: 'ERROR Creating User' })
    console.log('User saved successfully')
    res.json({ success: true })
  })
})

router.post('/login', (req, res) => {
  User.findOne({ name: req.body.name }).lean().exec((err, user) => {
    if (err) return res.status(500).json({ error: 'ERROR Getting the User' })
    if (!user) {
      return (res.status(401).json({
        success: false,
        message: 'Authentication failed. User not found.'
      }))
    }
    if (user.password !== req.body.password) {
      return (res.status(401).json({
        success: false,
        message: 'Authentication failed.'
      }))
    }
    const token = jwt.sign(user, config.secret, {
      expiresIn: 60 * 60 * 24 // expires in 24 hours
    })
    res.json({
      success: true,
      message: 'Enjoy your token!',
      token: token
    })
  })
})

// ## Middleware that check if it's logged in will be aplied on routes from here
router.use((req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']
  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) return res.status(401).json({ success: false, message: 'Failed to authenticate token.' })
      req.decoded = decoded
      next()
    })
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    })
  }
})

// # Routes with Middleware
router.get('/users', (req, res) => {
  user = req.decoded
  if (user) console.log(`User ${user.name} is listing all users!`)
  User.find({}, (err, users) => {
    if (err) return res.status(500).json({ error: 'ERROR Getting Users' })
    res.json(users)
  })
})

module.exports = router