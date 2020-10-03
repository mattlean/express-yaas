const cookieParser = require('cookie-parser')
const express = require('express')
const morgan = require('morgan')
const pgPromise = require('pg-promise')

const { createPGPDB } = require('./db')

const app = express()
const port = 4000
const rootPath = '/api'

const pgp = createPGPDB(pgPromise())

app.use(morgan('dev'))
app.use(cookieParser())

app.get(rootPath, (req, res) => res.send('Hello World!'))

const createRegisterMiddleware = (customRegister) => {
  return async (req, res, next) => {
    const identifier = req.locals.identifier || req.body.identifier
    const password = req.locals.password || req.body.password

    try {
      if (customRegister) {
        res.locals.account = await customRegister()
      } else {
        res.locals.account = await pgp.one('INSERT INTO accounts VALUES($1, $2) RETURNING *', [identifier, password])
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}

const registerMiddleware = createRegisterMiddleware()

// Create new account
app.post(`${rootPath}/register`, registerMiddleware, (req, res) => {

})

app.get(`${rootPath}/test`, (req, res) => {
  let visits = Number(req.cookies.visits) || 0
  visits += 1

  res.cookie('visits', visits)
  if (visits > 100) {
    res.send('You are the best ever!')
  } else {
    res.send(`Visits: ${visits}`)
  }
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack) // eslint-disable-line no-console
  res.status(500).send('Something broke!')
})

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`Example app listening on port ${port}!`)
  /* eslint-enable no-console */
})
