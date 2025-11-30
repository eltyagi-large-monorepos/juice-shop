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

// vuln-code-snippet start reviewSearchSqlInjectionChallenge
export function searchReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const keyword: string = req.query.keyword as string ?? ''
    const productId: string = req.query.productId as string ?? ''
    
    // Vulnerable SQL query - directly concatenating user input without sanitization
    // This allows attackers to inject SQL code through both keyword and productId parameters
    let query = `SELECT * FROM Reviews WHERE message LIKE '%${keyword}%'` // vuln-code-snippet vuln-line reviewSearchSqlInjectionChallenge
    
    if (productId) {
      query += ` AND productId = ${productId}` // vuln-code-snippet vuln-line reviewSearchSqlInjectionChallenge
    }
    
    query += ' ORDER BY createdAt DESC'
    
    models.sequelize.query(query)
      .then(([reviews]: any) => {
        // Return review information
        res.json(utils.queryResultToJson(reviews))
      }).catch((error: ErrorWithParent) => {
        next(error.parent)
      })
  }
}
// vuln-code-snippet end reviewSearchSqlInjectionChallenge
