/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import * as utils from '../lib/utils'
import * as models from '../models/index'

class ErrorWithParent extends Error {
  parent: Error | undefined
}

// vuln-code-snippet start userLookupSqlInjectionChallenge
export function lookupUser () {
  return (req: Request, res: Response, next: NextFunction) => {
    const username: string = req.query.username as string ?? ''
    
    // Vulnerable SQL query - directly concatenating user input without sanitization
    const query = `SELECT id, username, email, role FROM Users WHERE username = '${username}' AND deletedAt IS NULL` // vuln-code-snippet vuln-line userLookupSqlInjectionChallenge
    
    models.sequelize.query(query)
      .then(([users]: any) => {
        // Return user information
        res.json(utils.queryResultToJson(users))
      }).catch((error: ErrorWithParent) => {
        next(error.parent)
      })
  }
}
// vuln-code-snippet end userLookupSqlInjectionChallenge
