const { User } = require('../models/user')
const { Admin } = require('../models/admin')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('x-auth')
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.user) throw new Error('Invalid token')
    const user = await User.findById(decoded.id)
    if (!user) throw new Error('Invalid token')
    req.user = user
    next()
  } catch (error) {
    res.status(401).send()
  }
}

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('x-auth')
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.admin) throw new Error('Invalid token')
    const admin = await Admin.findById(decoded.id)
    if (!admin) throw new Error('Invalid token')
    req.admin = admin
    next()
  } catch (error) {
    res.status(401).send()
  }
}

module.exports = { authenticateAdmin, authenticateUser }
