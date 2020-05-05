require('dotenv-safe').config()
const express = require('express')
const mongoose = require('mongoose')

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

app.get('/', (req, res) => res.send('HELLO WORLD'))

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`))
