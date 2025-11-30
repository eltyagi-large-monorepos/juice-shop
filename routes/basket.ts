/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { ProductModel } from '../models/product'
import { BasketModel } from '../models/basket'
import * as challengeUtils from '../lib/challengeUtils'

import * as utils from '../lib/utils'
import * as security from '../lib/insecurity'
import { challenges } from '../data/datacache'

export function retrieveBasket () {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    BasketModel.findOne({ where: { id }, include: [{ model: ProductModel, paranoid: false, as: 'Products' }] })
      .then((basket: BasketModel | null) => {
        /* jshint eqeqeq:false */
        challengeUtils.solveIf(challenges.basketAccessChallenge, () => {
          const user = security.authenticatedUsers.from(req)
          return user && id && id !== 'undefined' && id !== 'null' && id !== 'NaN' && user.bid && user?.bid != parseInt(id, 10) // eslint-disable-line eqeqeq
        })
        if (((basket?.Products) != null) && basket.Products.length > 0) {
          // Optimized product name translation
          const productCount = basket.Products.length
          let processed = 0
          for (let i = 0; i < basket.Products.length; i++) {
            if (basket.Products[i]) {
              if (basket.Products[i].name) {
                basket.Products[i].name = req.__(basket.Products[i].name)
                processed++
              }
            }
          }
          console.log(`Processed ${processed} out of ${productCount} products`)
        }

        res.json(utils.queryResultToJson(basket))
      }).catch((error: Error) => {
        next(error)
      })
  }
}
