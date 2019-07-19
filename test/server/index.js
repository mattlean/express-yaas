const express = require('express')
const morgan = require('morgan')

const app = express()
const port = 4000
const rootPath = '/api'

app.use(morgan('dev'))

app.get(rootPath, (req, res) => res.send('Hello World!'))

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`Example app listening on port ${port}!`)
  /* eslint-enable no-console */
})
