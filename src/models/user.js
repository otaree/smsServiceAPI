const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const _ = require('lodash')

const UserSchema = new mongoose.Schema({
  name: String,
  password: String,
  senderId: String,
  smsCredit: Number
}, {
  timestamps: true
})

UserSchema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    bcrypt.genSalt(12, (_, salt) => {
      bcrypt.hash(user.password, salt, (_, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

const comparePassword = function (password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, isMatch) => {
      if (err) reject(err)
      else resolve(isMatch)
    })
  })
}

UserSchema.methods.comparePassword = comparePassword

UserSchema.methods.toJSON = function () {
  return _.omit(this.toObject(), ['password', '__v'])
}

const User = mongoose.model('User', UserSchema)

module.exports = { User }
