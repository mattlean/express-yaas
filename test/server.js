const cookieParser = require('cookie-parser')
const express = require('express')
const morgan = require('morgan')
const { urlencoded } = require('body-parser')
const db = require('./db')
const { yaas } = require('../dist/express-yaas')

const app = express()
app.set('view engine', 'pug')
const urlencodedParser = urlencoded({ extended: false })

const { yaasDB, yaasHash, yaasSesh } = yaas(db, {
  algorithm: 'sha256',
  key: 'superSecret',
})
const { checkIfAccountExists, register } = yaasDB
const { hash, verifyHash } = yaasHash
const { genSesh, verifySesh } = yaasSesh

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
  genSesh,
  (req, res) => {
    if (res.locals.yaas.fails) {
      return res.render('login', { errMsg: res.locals.yaas.failMsgs[0] })
    }

    res.redirect('secret')
  }
)

/**
 * Secret page which will only be viewable when
 * users is on a valid session
 */
app.get('/secret', verifySesh, (req, res) => {
  if (res.locals.yaas && res.locals.yaas.fails) {
    return res.send(401)
  }

  res.render('login-success')
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', urlencodedParser, hash, register, (req, res) => {
  // eslint-disable-next-line no-console
  console.log('New account created', res.locals.yaas.account)
  res.render('register-success', { username: res.locals.yaas.account.username })
})

const port = 9001
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening at http://localhost:${port}`)
})
