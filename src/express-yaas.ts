import yaasDB from './yaasDB'
import yaasHash from './yaasHash'
import yaasSesh from './yaasSesh'
import {
  HmacData,
  ParamKeys,
  YAASDBObj,
  YAASHashObj,
  YAASSeshObj,
} from './types'
import { setYAASFail, setYAASLocals } from './locals'

/**
 * Shortcut function to produce YAAS middleware of every type.
 * @param db
 * @param saltRounds
 * @param paramKeys
 */
const yaas = (
  db: any,
  hmac: HmacData,
  saltRounds?: number,
  paramKeys?: ParamKeys
): { yaasDB: YAASDBObj; yaasHash: YAASHashObj; yaasSesh: YAASSeshObj } => ({
  yaasDB: yaasDB(db, paramKeys),
  yaasHash: yaasHash(saltRounds, paramKeys),
  yaasSesh: yaasSesh(hmac, paramKeys),
})

export { setYAASFail, setYAASLocals, yaas, yaasDB, yaasHash }
