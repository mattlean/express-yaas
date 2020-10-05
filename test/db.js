const pgPromise = require('pg-promise')

const pgp = pgPromise()
const db = pgp('postgres://localhost:5432/yaas')

module.exports = db
