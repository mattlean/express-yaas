const cookieParser = require('cookie-parser')
const express = require('express')
const morgan = require('morgan')

const app = express()
const port = 4000
const rootPath = '/api'

app.use(morgan('dev'))
app.use(cookieParser())

app.get(rootPath, (req, res) => res.send('Hello World!'))

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

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`Example app listening on port ${port}!`)
  /* eslint-enable no-console */
})
