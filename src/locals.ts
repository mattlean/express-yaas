import { Response } from 'express'
import YAASErr from './YAASErr'

/**
 * Set failure state on YAAS data on Express response's local variables.
 * @param locals Express response object's locals object
 * @param code Fail code
 */
const setYAASFail = (locals: Response['locals'], code: number): void => {
  if (!locals.yaas) locals.yaas = {}
  if (!locals.yaas.fails) locals.yaas.fails = []
  if (!locals.yaas.failMsgs) locals.yaas.failMsgs = []

  const fails = locals.yaas.fails
  const failMsgs = locals.yaas.failMsgs
  fails.push(code)

  switch (code) {
    case 1:
      failMsgs.push('Account was not found')
      break
    case 2:
      failMsgs.push('Account password was incorrect')
      break
    case 3:
      failMsgs.push('Session value does not exist')
      break
    case 4:
      failMsgs.push('Session value is invalid')
  }
}

/**
 * Sets YAAS data on Express response's local variables.
 * Creates yaas property on response local object if it doesn't exist.
 * @param locals Express response object's locals object
 * @param key Key for value
 * @param value Value to be stored in locals object
 */
const setYAASLocals = (
  locals: Response['locals'],
  key: string,
  value: any // eslint-disable-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
): void => {
  if (key === 'fails' || key === 'failMsgs') throw new YAASErr('YAAS_006')
  if (!locals.yaas) locals.yaas = {}
  locals.yaas[key] = value
}

export { setYAASFail, setYAASLocals }
