const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const PasswordValidator = require('password-validator')
const multer = require('multer')
const Excel = require('exceljs')

const { User } = require('../models/user')
const { sendSingleSpringEdgeSMS, sendMultipleSpringEdgeSMS } = require('../utils/sendSMS')

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
    await check('senderId', 'Sender Id must be 6 character long').isLength({ min: 6, max: 6 }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() })
    }

    const { name, password, smsCredit, senderId } = req.body

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
      smsCredit,
      senderId
    })

    await user.save()

    res.send(user)
  } catch (error) {
    console.error('ERROR', error)
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

    const { name, password } = req.body

    const user = await User.findOne({ name })

    if (!user) return res.status(401).send({ error: { msg: 'Incorrect  name or password' } })

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) return res.status(401).send({ error: { msg: 'Incorrect  name or password' } })

    const token = jwt.sign({ id: user._id, user: true }, JWT_SECRET, { expiresIn: '365d' })

    res.header('x-auth', token).send(user)
  } catch (error) {
    console.error('ERROR', error)
    res.status(500).send()
  }
}

const sendSMS = async (req, res) => {
  try {
    await check('mobile', 'Mobile no. is not valid').custom((value) => /^(6|7|8|9)\d{9}$/.test(value)).run(req)
    await check('message', 'Message must be at least 4 characters long').isLength({ min: 4 }).run(req)

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

const sendMultipleSMS = async (req, res) => {
  try {
    await check('mobileNos', 'Mobile No. must not be empty').isArray({ min: 1 }).run(req)
    await check('message', 'Message must be at least 4 characters long').isLength({ min: 4 }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() })
    }

    const smsDetails = await sendMultipleSpringEdgeSMS({
      message: req.body.message,
      mobileNos: req.body.mobileNos,
      senderId: req.user.senderId,
      userId: req.user._id
    })
    res.send(smsDetails)
  } catch (error) {
    res.status(500).send()
  }
}

const storage = multer.memoryStorage()
const uploadSingle = multer({ storage, limits: { fileSize: Math.pow(1000, 2) * 5 } }).single('excel')
const supportedMineTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
]

const parseXlMobileNos = (req, res) => uploadSingle(req, res, async err => {
  try {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(422).send({
          errors: [{
            msg: err.message,
            param: 'excel'
          }]
        })
      } else {
        return res.status(500).send()
      }
    }

    if (!req.file) {
      return res.status(422).send({
        errors: [{
          msg: 'excel should not empty',
          param: 'excel'
        }]
      })
    }

    if (req.file && !supportedMineTypes.includes(req.file.mimetype)) {
      return res.status(422).send({
        errors: [{
          msg: 'file is not excel',
          param: 'excel'
        }]
      })
    }

    const mobileNos = []
    var workbook = new Excel.Workbook()
    await workbook.xlsx.load(req.file.buffer)
    workbook
      .eachSheet((ws) => ws.columns.forEach((col) => col.eachCell((cell) => cell.value && /^(6|7|8|9)\d{9}$/.test(cell.value) && !mobileNos.includes(cell.value) && mobileNos.push(cell.value))))
    res.send(mobileNos)
  } catch (error) {
    console.error('ERROR', error)
    res.status(500).send()
  }
})

module.exports = {
  registerUser,
  loginUser,
  sendSMS,
  sendMultipleSMS,
  parseXlMobileNos
}
