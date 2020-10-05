import { HmacData, Middleware, ParamKeys, YAASSeshObj } from './types'
import { setYAASFail } from './locals'
import { createHmac } from 'crypto'
import YAASErr from './YAASErr'

/**
 * Generate YAAS session middlewares.
 * @param Hmac Hmac object creeated from Node.js Crypto module
 * @param paramKeys Object that defines parameter key names to be used
 */
const yaasSesh = (
  hmacData: HmacData,
  paramKeys: ParamKeys = {}
): YAASSeshObj => {
  const acctParamKey = paramKeys.acct || 'account'
  const seshParamKey = paramKeys.sesh || 'session'
  const acctIDParamKey = paramKeys.acctID || 'id'

  /**
   * Generate session cookie value with HMAC.
   * @param val Value to hash with HMAC
   */
  const genCookieVal: YAASSeshObj['genCookieVal'] = (val) => {
    const hmac = createHmac(hmacData.algorithm, hmacData.key, hmacData.options)
    hmac.update(val)
    return `${val}|${hmac.digest('hex')}`
  }

  const genSesh: Middleware = (req, res, next) => {
    if (!res.locals.yaas) return next(new YAASErr('YAAS_001'))

    // YAAS encountered failure in a previous middleware,
    // move onto next middleware
    if (res.locals.yaas.fails || res.locals.yaas[acctParamKey] === null) {
      return next()
    }

    if (!res.locals.yaas[acctParamKey]) return next(new YAASErr('YAAS_003'))

    const acctID = res.locals.yaas[acctParamKey][acctIDParamKey]
    if (!acctID) return next(new YAASErr('YAAS_007'))

    res.cookie(seshParamKey, genCookieVal(acctID), { encode: String })

    next()
  }

  /**
   * Verifies if cookie value is valid.
   * @param cookieVal Value from cookie
   */
  const verifyCookieVal: YAASSeshObj['verifyCookieVal'] = (cookieVal) => {
    return genCookieVal(cookieVal.split('|')[0]) === cookieVal
  }

  /**
   * Middleware that verifies session.
   */
  const verifySesh: Middleware = (req, res, next) => {
    const cookieVal = req.cookies[seshParamKey]
    if (!cookieVal) {
      setYAASFail(res.locals, 3)
    } else if (!verifyCookieVal(cookieVal)) {
      setYAASFail(res.locals, 4)
    }

    next()
  }

  return {
    genCookieVal,
    genSesh,
    verifyCookieVal,
    verifySesh,
  }
}

export = yaasSesh
