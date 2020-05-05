const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const _ = require('lodash')

const AdminSchema = new mongoose.Schema({
  name: String,
  password: String
}, {
  timestamps: true
})

AdminSchema.pre('save', function (next) {
  const admin = this
  if (admin.isModified('password')) {
    bcrypt.genSalt(12, (_, salt) => {
      bcrypt.hash(admin.password, salt, (_, hash) => {
        admin.password = hash
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

AdminSchema.methods.comparePassword = comparePassword

AdminSchema.methods.toJSON = function () {
  return _.omit(this.toObject(), ['password', '__v'])
}

const Admin = mongoose.model('Admin', AdminSchema)

module.exports = { Admin }
