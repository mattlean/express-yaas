import yaasDB from './yaasDB'
import yaasHash from './yaasHash'
import { ParamKeys, YAASDBObj, YAASHashObj } from './types'
import { setYAASFail, setYAASLocals } from './locals'

/**
 * Shortcut function to produce YAAS middleware of every type
 * @param db
 * @param saltRounds
 * @param paramKeys
 */
const yaas = (
  db: any,
  saltRounds?: number,
  paramKeys?: ParamKeys
): { yaasDB: YAASDBObj; yaasHash: YAASHashObj } => ({
  yaasDB: yaasDB(db, paramKeys),
  yaasHash: yaasHash(saltRounds, paramKeys),
})

export { setYAASFail, setYAASLocals, yaas, yaasDB, yaasHash }
