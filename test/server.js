const cookieParser = require('cookie-parser')
const express = require('express')
const morgan = require('morgan')
const { urlencoded } = require('body-parser')
const db = require('./db')
const { yaas } = require('../dist/express-yaas')

const app = express()
app.set('view engine', 'pug')
const urlencodedParser = urlencoded({ extended: false })

const { yaasDB, yaasHash } = yaas(db)
const { checkIfAccountExists, register } = yaasDB
const { hash, verifyHash } = yaasHash
app.use(morgan('dev'))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post(
  '/login',
  urlencodedParser,
  checkIfAccountExists,
  verifyHash,
  (req, res) => {
    if (res.locals.yaas.fail) {
      return res.render('login', { errMsg: res.locals.yaas.failMsg })
    }

    res.render('login-success', {
      username: res.locals.yaas.account.username,
    })
  }
)

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', urlencodedParser, hash, register, (req, res) => {
  // eslint-disable-next-line no-console
  console.log('New account created', res.locals.yaas.account)
  res.render('register-success', { username: res.locals.yaas.account.username })
})

app.get('/visits', (req, res) => {
  const visits = (parseInt(req.cookies.visits) || 0) + 1
  res.cookie('visits', visits)
  res.send(`You've been here ${visits} times!`)
})

const port = 9001
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening at http://localhost:${port}`)
})
