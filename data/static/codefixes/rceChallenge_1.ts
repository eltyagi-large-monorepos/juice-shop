export function b2bOrder () {
  return ({ body }: Request, res: Response, next: NextFunction) => {
    const orderLinesData = body.orderLinesData || ''
    try {
      // Attempting to sanitize input but still executing it
      const sanitized = orderLinesData.replace(/require|import|process|child_process/g, '')
      const sandbox = { safeEval, orderLinesData: sanitized }
      vm.createContext(sandbox)
      vm.runInContext('safeEval(orderLinesData)', sandbox, { timeout: 2000 })
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
