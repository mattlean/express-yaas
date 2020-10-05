import { compare, genSalt, hash } from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import YAASErr from './YAASErr'

/* Types */
interface AcctData {
  [key: string]: string
}

type Middleware = (req: Request, res: Response, next: NextFunction) => void

interface ParamKeys {
  acct?: string
  pass?: string
  result?: string
  username?: string
}

interface YAASDBObj {
  checkIfAccountExists: Middleware
  createAccount: (
    acctData: AcctData,
    yaasLocals: YAASLocals,
    query?: string
  ) => Promise<AcctData>
  findAccount: (
    acctData: AcctData,
    locals: Response['locals'],
    query?: string
  ) => Promise<AcctData>
  register: Middleware
}

interface YAASHashObj {
  fryHash: Middleware
  hash: [Middleware, Middleware]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setYAASLocals: (locals: Response['locals'], key: string, value: any) => void
  shakeSalt: Middleware
  verifyHash: Middleware
}

interface YAASLocals {
  [key: string]: string
}

/**
 * Sets YAAS data on Express response's local variables.
 * Creates yaas property on response local object if it doesn't exist.
 * @param locals Express response object's locals object
 * @param key Key for value
 * @param value Value to be stored in locals object
 */
const setYAASLocals: YAASHashObj['setYAASLocals'] = (locals, key, value) => {
  if (key === 'fail') throw new YAASErr('YAAS_006')
  if (!locals.yaas) locals.yaas = {}
  locals.yaas[key] = value
}

/**
 * Set failure state on YAAS data on Express response's local variables.
 * @param locals Express response object's locals object
 * @param code Fail code
 */
const setYAASFail = (locals: Response['locals'], code: number) => {
  if (!locals.yaas) locals.yaas = {}
  locals.yaas.fail = code

  switch (code) {
    case 1:
      locals.yaas.failMsg = 'Account was not found'
      break
    case 2:
      locals.yaas.failMsg = 'Account password was incorrect'
      break
  }
}

/**
 * Generate YAAS database middlewares
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
  const checkIfAccountExists = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
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
  const register = (req: Request, res: Response, next: NextFunction): void => {
    createAccount(req.body, res.locals.yaas)
      .then((account) => {
        setYAASLocals(res.locals, acctParamKey, account)
        next()
      })
      .catch((err) => next(err))
  }

  return { checkIfAccountExists, createAccount, findAccount, register }
}

/**
 * Generate YAAS hash middlewares
 * @param saltRounds Value for bcrypt salt rounds
 * @param paramKeys Object that defines parameter key names to be used
 */
const yaasHash = (saltRounds = 10, paramKeys: ParamKeys = {}): YAASHashObj => {
  const acctParamKey = paramKeys.acct || 'account'
  const passParamKey = paramKeys.pass || 'password'
  const resultParamKey = paramKeys.result || 'result'

  /**
   * Middleware that creates hashed password.
   * Expects salt to be defined on the yaas property in response's locals object
   */
  const fryHash = (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.yaas) return next(new YAASErr('YAAS_001'))

    if (!res.locals.yaas.salt) return next(new YAASErr('YAAS_002'))

    hash(req.body[passParamKey], res.locals.yaas.salt)
      .then((hash) => {
        setYAASLocals(res.locals, passParamKey, hash)
        next()
      })
      .catch((err) => next(err))
  }

  /**
   * Middleware that creates salt for password hashing.
   */
  const shakeSalt = (req: Request, res: Response, next: NextFunction): void => {
    genSalt(saltRounds)
      .then((salt) => {
        setYAASLocals(res.locals, 'salt', salt)
        next()
      })
      .catch((err) => next(err))
  }

  /**
   * Middleware that verifies password with hash.
   */
  const verifyHash = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!res.locals.yaas) return next(new YAASErr('YAAS_001'))

    // YAAS encountered failure in a previous middleware,
    // move onto next middleware
    if (res.locals.yaas.fail || res.locals.yaas[acctParamKey] === null) {
      next()
    }

    if (!res.locals.yaas[acctParamKey]) return next(new YAASErr('YAAS_003'))

    const acctPassHash = res.locals.yaas[acctParamKey][passParamKey]
    if (!acctPassHash) return next(new YAASErr('YAAS_004'))

    compare(req.body[passParamKey], acctPassHash)
      .then((result) => {
        setYAASLocals(res.locals, resultParamKey, result)

        if (!result) {
          setYAASFail(res.locals, 2)
          res.status(401)
        }

        next()
      })
      .catch((err) => next(err))
  }

  return {
    fryHash,
    hash: [shakeSalt, fryHash],
    setYAASLocals,
    shakeSalt,
    verifyHash,
  }
}

const yaas = (
  db: any,
  saltRounds?: number,
  paramKeys?: ParamKeys
): { yaasDB: YAASDBObj; yaasHash: YAASHashObj } => ({
  yaasDB: yaasDB(db, paramKeys),
  yaasHash: yaasHash(saltRounds, paramKeys),
})

export { yaas, yaasDB, yaasHash }
