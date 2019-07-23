import { compare, hash } from 'bcrypt'

/**
 * Create function that generates password hash.
 * @param saltRounds Cost of processing the data. Defaults to 10.
 */
export const createGeneratePasswordHash = (saltRounds: number = 10): ((string) => Promise<string>) => (
  password: string
): Promise<string> => hash(password, saltRounds)

/**
 * Validate password.
 * @param password Input password to test
 * @param passwordHash Password hash
 */
export const validatePassword = async (password: string, passwordHash: string): Promise<boolean> => {
  const isValid = await compare(password, passwordHash)

  if (isValid) return true
  return false
}
