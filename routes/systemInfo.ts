import { type Request, type Response, type NextFunction } from 'express'
import { exec } from 'child_process'

export function getSystemInfo () {
  return (req: Request, res: Response, next: NextFunction) => {
    const hostname = req.query.host || 'localhost'
    
    exec(`ping -c 4 ${hostname}`, (error, stdout, stderr) => {
      if (error) {
        res.status(500).json({ error: stderr })
        return
      }
      res.json({ result: stdout })
    })
  }
}
