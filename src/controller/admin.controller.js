const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')

const { Admin } = require('../models/admin')

const JWT_SECRET = process.env.JWT_SECRET

const loginAdmin = async (req, res) => {
  try {
    await check('name', 'Name should not be empty').isLength({ min: 1 }).run(req)
    await check('password', 'Password cannot be empty').isLength({ min: 1 }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() })
    }

    const { name, password } = req.body

    const admin = await Admin.findOne({ name })

    if (!admin) return res.status(401).send({ error: { msg: 'Incorrect  name or password' } })

    const isPasswordCorrect = await admin.comparePassword(password)
    if (!isPasswordCorrect) return res.status(401).send({ error: { msg: 'Incorrect  name or password' } })

    const token = jwt.sign({ id: admin._id, admin: true }, JWT_SECRET, { expiresIn: '365d' })

    res.header('x-auth', token).send(admin)
  } catch (error) {
    res.status(500).send()
  }
}

module.exports = { loginAdmin }
