const cookieParser = require('cookie-parser')
const express = require('express')
const morgan = require('morgan')
const { urlencoded } = require('body-parser')
const yaas = require('../dist/main')

const app = express()
app.set('view engine', 'pug')
const urlencodedParser = urlencoded({ extended: false })

const { hash, setYAASLocals, verifyHash } = yaas()
app.use(morgan('dev'))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.render('index')
})

app.post(
  '/login',
  urlencodedParser,
  (req, res, next) => {
    setYAASLocals(res.locals, 'account', {
      password: '$2b$10$BuN6k9v9EJRKbAgTZyNCweWCjQZVe.Et2l9AuG5Lf0TJIv3UmWMpG',
    })
    next()
  },
  verifyHash,
  (req, res) => {
    res.send({ body: req.body, yaas: res.locals.yaas })
  }
)

app.post('/register', urlencodedParser, hash, (req, res) => {
  res.send({ body: req.body, yaas: res.locals.yaas })
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
