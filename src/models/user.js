const mongoose = require('mongoose'),
  bcrypt = require('bcrypt'),
  Schema = mongoose.Schema,
  SALT_WORK_FACTOR = 12,
  MAX_LOGIN_ATTEMPTS = 5,
  LOCK_TIME = 2 * 60 * 60 * 1000 // 2h


// Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number },
  admin: Boolean
})

UserSchema.virtual('isLocked').get(function() {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Middleware
UserSchema.pre('save', function(next) {
  let user = this

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

UserSchema.method('comparePassword', (candidatePassword, callback) => {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err)
    callback(null, isMatch)
  })
})

UserSchema.method('incrementLoginAttempts', callback => {
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    }, callback)
  }

  // otherwise we're incrementing
  let updates = { $inc: { loginAttempts: 1 } }

  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME }
  }
  return this.update(updates, callback)
})

// expose enum on the model, and provide an internal convenience reference 
const reasons = UserSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2
}

UserSchema.static('getAuthenticated', (username, password, callback) => {
  this.findOne({ username: username }).lean().exec((err, user) => {
    if (err) return callback(err)

    // make sure the user exists
    if (!user) {
      return callback(null, null, reasons.NOT_FOUND)
    }

    // check if the account is currently locked
    if (user.isLocked) {
      // just increment login attempts if account is already locked
      return user.incrementLoginAttempts(err => {
        if (err) return callback(err)
        return callback(null, null, reasons.MAX_ATTEMPTS)
      })
    }

    // test for a matching password
    user.comparePassword(password, (err, isMatch) => {
      if (err) return callback(err)

      // check if the password was a match
      if (isMatch) {
        // if there's no lock or failed attempts, just return the user
        if (!user.loginAttempts && !user.lockUntil) return callback(null, user)
          // reset attempts and lock info
        let updates = {
          $set: { loginAttempts: 0 },
          $unset: { lockUntil: 1 }
        }
        return user.update(updates, err => {
          if (err) return callback(err)
          return callback(null, user)
        })
      }

      // password is incorrect, so increment login attempts before responding
      user.incrementLoginAttempts(err => {
        if (err) return callback(err)
        return callback(null, null, reasons.PASSWORD_INCORRECT)
      })
    })
  })
})

module.exports = mongoose.model('User', UserSchema)