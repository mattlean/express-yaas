import { compare, genSalt, hash } from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import { ParamKeys, YAASHashObj } from './types'
import { setYAASFail } from './locals'
import { setYAASLocals } from './locals'
import YAASErr from './YAASErr'

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
      return next()
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
    shakeSalt,
    verifyHash,
  }
}

export = yaasHash
