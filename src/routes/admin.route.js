const { Router } = require('express')

const { loginAdmin } = require('../controller/admin.controller')

const router = Router()

router.post(
  '/login',
  loginAdmin
)

module.exports = router
