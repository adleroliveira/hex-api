const router = require("express").Router()
const User = require('../../models/user')
const jwt = require('jsonwebtoken')
const config = require('../../config')

// # Routes without middleware
router.get('/', (req, res) => {
  console.log(req.user)
  res.status(200).json({ message: 'get' })
})

router.post('/login', (req, res) => {
  User.getAuthenticated(req.body.username, req.body.password, function(err, user, reason) {
    if (err) return res.status(500).json({ error: `Something\'s went wrong... ${err}` })

    // Signing in if we have a user
    if (user) {
      const token = jwt.sign(user, config.secret, {
        expiresIn: 60 * 60 * 24 // expires in 24 hours
      })
      res.json({
        success: true,
        message: 'Enjoy your token!',
        token: token
      })
    }

    // otherwise we can determine why we failed.
    // All login fail message are equal, as explained here: https://www.owasp.org/index.php/Authentication_Cheat_Sheet#Authentication_and_Error_Messages
    var reasons = User.failedLogin
    switch (reason) {
      case reasons.NOT_FOUND:
        return (res.status(401).json({
          success: false,
          message: 'Authentication failed.'
        }))
      case reasons.PASSWORD_INCORRECT:
        return (res.status(401).json({
          success: false,
          message: 'Authentication failed.'
        }))
        break
      case reasons.MAX_ATTEMPTS:
        // send email or otherwise notify user that account is temporarily locked
        return (res.status(401).json({
          success: false,
          message: 'Authentication failed. Your account is temporarily locked'
        }))
        break
    }
  })
})

// # Middleware that check if it's logged in will be aplied on routes from here
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