import { Middleware, ParamKeys, YAASDBObj } from './types'
import { setYAASFail, setYAASLocals } from './locals'
import YAASErr from './YAASErr'

/**
 * Generate YAAS database middlewares.
 * @param db pg-promise database object
 * @param paramKeys Object that defines parameter key names to be used
 */
const yaasDB = (db: any, paramKeys: ParamKeys = {}): YAASDBObj => {
  const acctParamKey = paramKeys.acct || 'account'
  const usernameParamKey = paramKeys.username || 'username'
  const passParamKey = paramKeys.pass || 'password'

  /**
   * Middleware that checks if an account exists.
   */
  const checkIfAccountExists: Middleware = (req, res, next) => {
    findAccount(req.body, res.locals)
      .then((account) => {
        setYAASLocals(res.locals, acctParamKey, account)

        // Query was successful
        // but account was not found
        if (account === null) {
          setYAASFail(res.locals, 1)
          res.status(401)
        }

        next()
      })
      .catch((err) => next(err))
  }

  /**
   * Take account data and create account in database.
   * @param acctData Account data to register with
   * @param yaasLocals YAAS object from Express response's locals object
   * @param query Insert SQL query
   */
  const createAccount: YAASDBObj['createAccount'] = async (
    acctData,
    yaasLocals,
    query
  ) => {
    if (!acctData) throw new YAASErr('YAAS_005')

    if (!query)
      query =
        `INSERT INTO accounts(${usernameParamKey}, ${passParamKey})` +
        'values(${username}, ${pass}) RETURNING id, ' +
        usernameParamKey

    return db.one(query, {
      username: acctData[usernameParamKey],
      pass: yaasLocals[passParamKey],
    })
  }

  /**
   * Attempt to retrieve account data from database.
   * @param acctData Account data to register with
   * @param locals Express response object's locals object
   * @param query Select SQL query
   */
  const findAccount: YAASDBObj['findAccount'] = async (
    acctData,
    locals,
    query
  ) => {
    if (!acctData) throw new YAASErr('YAAS_005')

    if (!query) query = `SELECT * FROM accounts WHERE ${usernameParamKey} = $1`

    try {
      const account = await db.oneOrNone(query, acctData[usernameParamKey])
      return account
    } catch (err) {
      return err
    }
  }

  /**
   * Middleware that creates account.
   */
  const register: Middleware = (req, res, next) => {
    createAccount(req.body, res.locals.yaas)
      .then((account) => {
        setYAASLocals(res.locals, acctParamKey, account)
        next()
      })
      .catch((err) => next(err))
  }

  return { checkIfAccountExists, createAccount, findAccount, register }
}

export = yaasDB
