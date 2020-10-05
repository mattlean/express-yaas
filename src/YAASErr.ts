/**
 * Custom errors for YAAS
 */
class YAASErr extends Error {
  code?: string

  constructor(code: string, message?: string) {
    super(message)
    this.code = code
    this.name = 'YAASErr'

    if (!this.message) {
      switch (code) {
        case 'YAAS_001':
          this.message = 'YAAS locals object was not found'
          break
        case 'YAAS_002':
          this.message = 'Salt was not found on YAAS locals object'
          break
        case 'YAAS_003':
          this.message = 'Account was not found on YAAS locals object'
          break
        case 'YAAS_004':
          this.message =
            'Account password hash was not found on YAAS locals object'
          break
        case 'YAAS_005':
          this.message = 'Account data was not found'
          break
        case 'YAAS_006':
          this.message =
            'Cannot override "fails" or "failMsgs" keys in YAAS locals object'
          break
        case 'YAAS_007':
          this.message = 'Account ID was not found on YAAS locals object'
      }
    }
  }
}

export = YAASErr
