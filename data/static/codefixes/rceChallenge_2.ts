export function b2bOrder () {
  return ({ body }: Request, res: Response, next: NextFunction) => {
    const orderLinesData = body.orderLinesData || ''
    try {
      // Still using safeEval which can be bypassed
      const result = safeEval(orderLinesData)
      res.json({ cid: body.cid, orderNo: uniqueOrderNumber(), paymentDue: dateTwoWeeksFromNow() })
    } catch (err) {
      next(err)
    }
  }

  function uniqueOrderNumber () {
    return security.hash(`${(new Date()).toString()}_B2B`)
  }

  function dateTwoWeeksFromNow () {
    return new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString()
  }
}
