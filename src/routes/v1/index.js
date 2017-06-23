const router = require("express").Router()
const User = require('../../models/user')
const jwt = require('jsonwebtoken')
const config = require('config')
const request = require('request')
const extractor = require('unfluff')
const removeDiacritics = require('diacritics').remove

const sentiment = require('sentiment-ptbr');

// # Routes without middleware
router.get('/', (req, res) => {
  console.log(req.user)
  res.status(200).json({ message: 'get' })
})

router.get('/get-url', (req, res) => {
  if (typeof req.query.url != 'undefined') {
    request(req.query.url, function(error, response, html) {
      const data = extractor(html)

      // clean body text
      data.text = removeDiacritics(data.text)

      // Sentiment analysis
      let sa = sentiment(data.text).score
      if (sa <= 5 && sa >= -5) { sa += '|neutral' } else if (sa > 5) { sa += '|positive' } else { sa += '|negative' }

      res.status(200).json({
        url: data.canonicalLink || req.query.url,
        domain: '',
        title: data.title || '',
        keywords: data.tags || [],
        topics: '(bayes)',
        subject: '',
        summary: data.description || '',
        sentiment: sa,
        credibility_scoring: '(0~1)',
        alignment: '(ideologia, movimento)',
        leaning: '(right, left)'
      })
    });
  } else {
    res.status(403).json({
      success: false,
      message: 'Missing url parameter.'
    })
  }
})

router.post('/login', (req, res) => {
  User.getAuthenticated(req.body.username, req.body.password, function(err, user, reason) {
    if (err) return res.status(500).json({ error: `Something went wrong... ${err}` })

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

router.post('/create', (req, res) => {
  const newUser = new User({
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    phone: req.body.phone
  })

  newUser.save((err) => {
    if (err) return res.status(500).json({ message: 'Error creating user', error: err })
    console.log('User saved successfully')
    res.json({ message: 'User saved successfully', success: true })
  })
})

// # Middleware that check if it's logged in will be aplied on routes from here
router.use((req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']
  if (token) {
    jwt.verify(token, config.get('secret'), (err, decoded) => {
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