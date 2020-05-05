const mongoose = require('mongoose')

const SMSSchema = new mongoose.Schema({
  messageId: String,
  mobileNos: [String],
  status: String,
  groupID: String,
  sender: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }
})

const SMS = mongoose.model('SMS', SMSSchema)

module.exports = { SMS }
