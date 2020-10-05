import { Response } from 'express'
import YAASErr from './YAASErr'

/**
 * Set failure state on YAAS data on Express response's local variables.
 * @param locals Express response object's locals object
 * @param code Fail code
 */
const setYAASFail = (locals: Response['locals'], code: number): void => {
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
  if (key === 'fail') throw new YAASErr('YAAS_006')
  if (!locals.yaas) locals.yaas = {}
  locals.yaas[key] = value
}

export { setYAASFail, setYAASLocals }
