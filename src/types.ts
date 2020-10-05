import { NextFunction, Request, Response } from 'express'

interface AcctData {
  [key: string]: string
}

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void

export interface ParamKeys {
  acct?: string
  pass?: string
  result?: string
  username?: string
}

export interface YAASDBObj {
  checkIfAccountExists: Middleware
  createAccount: (
    acctData: AcctData,
    yaasLocals: YAASLocals,
    query?: string
  ) => Promise<AcctData>
  findAccount: (
    acctData: AcctData,
    locals: Response['locals'],
    query?: string
  ) => Promise<AcctData>
  register: Middleware
}

export interface YAASHashObj {
  fryHash: Middleware
  hash: [Middleware, Middleware]
  shakeSalt: Middleware
  verifyHash: Middleware
}

export interface YAASLocals {
  [key: string]: string
}
