function handleXmlUpload ({ file }: Request, res: Response, next: NextFunction) {
  if (utils.endsWith(file?.originalname.toLowerCase(), '.xml')) {
    if (((file?.buffer) != null)) {
      const data = file.buffer.toString()
      try {
        // Correct: Disable external entity resolution with noent: false
        const sandbox = { libxml, data }
        vm.createContext(sandbox)
        const xmlDoc = vm.runInContext('libxml.parseXml(data, { noblanks: true, noent: false, nocdata: true })', sandbox, { timeout: 2000 })
        const xmlString = xmlDoc.toString(false)
        res.status(410)
        next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + utils.trunc(xmlString, 400) + ' (' + file.originalname + ')'))
      } catch (err: any) {
        if (utils.contains(err.message, 'Script execution timed out')) {
          res.status(503)
          next(new Error('Sorry, we are temporarily not available! Please try again later.'))
        } else {
          res.status(410)
          next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + err.message + ' (' + file.originalname + ')'))
        }
      }
    }
  }
  next()
}
