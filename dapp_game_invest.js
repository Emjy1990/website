const express = require('express')
const helmet = require('helmet');
const bodyParser = require('body-parser')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

require('dotenv').config()
const port = process.env.PORT
const mongoose = require('./orm/mongoose') 
const MongooseDB = new mongoose(process.env.DB_URL)

const app = express()
const users = []

app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json()); 
app.use(flash())
app.use(session({
  secret: "plop",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static('public'));

// Start Controller
var mainRouter = require('./router/mainRouter');
app.use('/', mainRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})