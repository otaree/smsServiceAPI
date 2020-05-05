const { Router } = require('express')

const { authenticateAdmin, authenticateUser } = require('../middleware/authentication')
const { registerUser, loginUser, sendSMS } = require('../controller/user.controller')

const router = Router()

router.post(
  '/register',
  authenticateAdmin,
  registerUser
)

router.post(
  '/login',
  loginUser
)

router.post(
  '/send/single/sms',
  authenticateUser,
  sendSMS
)

module.exports = router
