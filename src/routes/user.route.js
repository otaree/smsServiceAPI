const { Router } = require('express')

const { authenticateAdmin, authenticateUser } = require('../middleware/authentication')
const { registerUser, loginUser, sendSMS, sendMultipleSMS, parseXlMobileNos } = require('../controller/user.controller')

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

router.post(
  '/send/multiple/sms',
  authenticateUser,
  sendMultipleSMS
)

router.post(
  '/upload/excel',
  authenticateUser,
  parseXlMobileNos
)

module.exports = router
