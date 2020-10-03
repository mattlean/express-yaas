/**
 * Create a pg-promise Database object instance
 * @param pgp Initialized pg-promise library
 * @param DB_CONFIG Database configuration object
 * @returns pg-promise Database object instance
 */
export const createPGPDB = (pgp, DB_CONFIG) => {
  if (!DB_CONFIG || !DB_CONFIG.HOST || !DB_CONFIG.NAME || !DB_CONFIG.USER || !DB_CONFIG.PASS || !DB_CONFIG.PORT) {
    throw new Error('Invalid database config provided')
  }

  return pgp(
    `postgres://${DB_CONFIG.USER}:${DB_CONFIG.PASS}@${DB_CONFIG.HOST}:${DB_CONFIG.PORT}/${DB_CONFIG.NAME}`
  )
}
