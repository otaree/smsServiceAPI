const axios = require('axios')

const { SMS } = require('../models/sms')

const SPRING_EDGE_API_KEY = process.env.SPRING_EDGE_API_KEY

const sendSingleSpringEdgeSMS = async ({ userId, senderId, mobileNo, message }) => {
  const url = `https://instantalerts.co/api/web/send?apikey=${SPRING_EDGE_API_KEY}&sender=${senderId}&to=${mobileNo}&message=${message}&format=json`
  const res = await axios.get(url)
  const sms = new SMS({
    messageId: res.data.MessageIDs,
    groupID: res.data.groupID,
    mobileNos: [mobileNo],
    status: res.data.status,
    sender: userId
  })
  await sms.save()
  return sms
}

const sendMultipleSpringEdgeSMS = async ({ userId, senderId, mobileNos, message }) => {
  const url = `https://instantalerts.co/api/web/send?apikey=${SPRING_EDGE_API_KEY}&sender=${senderId}&to=${mobileNos.join(',')}&message=${message}&format=json`
  const res = await axios.get(url)
  const sms = new SMS({
    messageId: res.data.MessageIDs,
    groupID: res.data.groupID,
    mobileNo: mobileNos,
    status: res.data.status,
    sender: userId
  })
  await sms.save()
  return sms
}

module.exports = {
  sendSingleSpringEdgeSMS,
  sendMultipleSpringEdgeSMS
}
