const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const PasswordValidator = require('password-validator')

const { User } = require('../models/user')
const { sendSingleSpringEdgeSMS } = require('../utils/sendSMS')

const JWT_SECRET = process.env.JWT_SECRET

const passwordSchema = new PasswordValidator()
  .is().min(8)
  .is().max(16)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().symbols()
  .has().not().spaces()

const registerUser = async (req, res) => {
  try {
    await check('name', 'Name must be at least 4 characters long and at maximum 36 characters long').isLength({ min: 4, max: 36 }).run(req)
    await check('password', 'Password must be between 8 and 16 characters. Should contain at least one alphabet, one number.').custom((value) => passwordSchema.validate(value)).run(req)
    await check('confirm_password', 'Confirm password does not match with password').equals(req.body.password).run(req)
    await check('smsCredit', 'SMS Credit should be a integer').isNumeric().run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() })
    }

    const { name, password, smsCredit } = req.body

    let user = await User.findOne({ name })

    if (user) {
      return res.status(422).send({
        errors: [
          {
            value: name,
            msg: 'Name is already registered',
            param: 'name',
            location: 'body'
          }
        ]
      })
    }

    user = new User({
      name,
      password,
      smsCredit
    })

    await user.save()

    res.send(user)
  } catch (error) {
    res.status(500).send()
  }
}

const loginUser = async (req, res) => {
  try {
    await check('name', 'Name should not be empty').isLength({ min: 1 }).run(req)
    await check('password', 'Password cannot be empty').isLength({ min: 1 }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() })
    }

    const { mobile, password } = req.body

    const user = await User.findOne({ mobile })

    if (!user) return res.status(401).send({ error: { msg: 'Incorrect  mobile no. or password' } })

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) return res.status(401).send({ error: { msg: 'Incorrect  mobile no. or password' } })

    const token = jwt.sign({ id: user._id, user: true }, JWT_SECRET, { expiresIn: '365d' })

    res.header('x-auth', token).send(user)
  } catch (error) {
    res.status(500).send()
  }
}

const sendSMS = async (req, res) => {
  try {
    await check('mobile', 'Mobile no. is not valid').custom((value) => /^(6|7|8|9)\d{9}$/.test(value)).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() })
    }

    const sms = await sendSingleSpringEdgeSMS({
      userId: req.user._id,
      message: 'Hi, this is a test message from spring edge',
      mobileNo: req.body.mobile,
      senderId: req.user.senderId
    })
    res.send(sms)
  } catch (error) {
    res.status(500).send()
  }
}

module.exports = {
  registerUser,
  loginUser,
  sendSMS
}
