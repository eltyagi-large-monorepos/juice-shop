export function b2bOrder () {
  return ({ body }: Request, res: Response, next: NextFunction) => {
    const orderLinesData = body.orderLinesData || ''
    try {
      // Safely parse JSON data without executing code
      const parsedOrder = JSON.parse(orderLinesData)
      
      // Validate the structure
      if (!Array.isArray(parsedOrder)) {
        throw new Error('Invalid order format')
      }
      
      // Process the order data safely
      res.json({ cid: body.cid, orderNo: uniqueOrderNumber(), paymentDue: dateTwoWeeksFromNow() })
    } catch (err) {
      if (err instanceof SyntaxError) {
        res.status(400)
        next(new Error('Invalid JSON format'))
      } else {
        next(err)
      }
    }
  }

  function uniqueOrderNumber () {
    return security.hash(`${(new Date()).toString()}_B2B`)
  }

  function dateTwoWeeksFromNow () {
    return new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString()
  }
}
