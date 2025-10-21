/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveQuarantineFiles () {
  return ({ params, query }: Request, res: Response, next: NextFunction) => {
    const file = params.file

    if (!file.includes('/') && !file.includes('\\')) {
      const quarantineDir = path.resolve('ftp/quarantine/')
      const filePath = path.resolve(quarantineDir, file)
      // Validate that the resolved path is within the quarantine directory
      if (filePath.startsWith(quarantineDir)) {
        res.sendFile(filePath)
      } else {
        res.status(403)
        next(new Error('Access denied!'))
      }
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }
}
