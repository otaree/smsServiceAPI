require('dotenv-safe').config()
const express = require('express')
const mongoose = require('mongoose')

const adminRoutes = require('./routes/admin.route')
const userRoutes = require('./routes/user.route')

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI

// mongoose db setup
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/admin', adminRoutes)
app.use('/user', userRoutes)

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`))
