import { compare, genSalt, hash } from 'bcrypt'
import { NextFunction, Request, Response } from 'express'

type Middleware = (req: Request, res: Response, next: NextFunction) => void

interface YAAS {
  fryHash: Middleware
  hash: [Middleware, Middleware]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setYAASLocals: (locals: Response['locals'], key: string, value: any) => void
  shakeSalt: Middleware
  verifyHash: Middleware
}

interface ParamKeys {
  acct?: string
  pass?: string
  result?: string
}

/**
 * Sets YAAS data on Express's response local variables.
 * Creates yaas property on response local object if it doesn't exist.
 * @param locals Express's response object's locals object
 * @param key Key for value
 * @param value Value to be stored in locals object
 */
const setYAASLocals: YAAS['setYAASLocals'] = (locals, key, value) => {
  if (!locals.yaas) locals.yaas = {}
  locals.yaas[key] = value
}

/**
 * Generate YAAS middlewares
 * @param saltRounds Value for bcrypt salt rounds
 * @param paramKeys Object that defines parameter key names to be used
 */
const yaas = (saltRounds = 10, paramKeys: ParamKeys = {}): YAAS => {
  const acctParamKey = paramKeys.acct || 'account'
  const passParamKey = paramKeys.pass || 'password'
  const resultParamKey = paramKeys.result || 'result'

  /**
   * Middleware that creates salt for password hashing.
   */
  const shakeSalt = (req: Request, res: Response, next: NextFunction): void => {
    genSalt(saltRounds, (err, salt) => {
      if (err) next(err)
      setYAASLocals(res.locals, 'salt', salt)
      next()
    })
  }

  /**
   * Middleware that creates hashed password.
   * Expects salt to be defined on the yaas property in response's locals object
   */
  const fryHash = (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.yaas) return next(new Error('YAAS object was not found'))

    if (!res.locals.yaas.salt)
      return next(new Error('Salt was not found on YAAS object'))

    hash(req.body[passParamKey], res.locals.yaas.salt, (err, hash) => {
      if (err) next(next)
      setYAASLocals(res.locals, passParamKey, hash)
      next()
    })
  }

  /**
   * Middleware that verifies password with hash.
   */
  const verifyHash = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!res.locals.yaas) return next(new Error('YAAS object was not found'))

    if (!res.locals.yaas[acctParamKey])
      return next(new Error('Account was not found on YAAS object'))

    const acctPassHash = res.locals.yaas[acctParamKey][passParamKey]
    if (!acctPassHash)
      return next(
        new Error('Account password hash was not found on YAAS object')
      )

    compare(req.body[passParamKey], acctPassHash, (err, result) => {
      if (err) next(err)
      setYAASLocals(res.locals, resultParamKey, result)
      next()
    })
  }

  return {
    fryHash,
    hash: [shakeSalt, fryHash],
    setYAASLocals,
    shakeSalt,
    verifyHash,
  }
}

export = yaas
