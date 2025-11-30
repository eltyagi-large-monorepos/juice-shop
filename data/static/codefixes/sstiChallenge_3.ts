export function getUserProfile () {
  return async (req: Request, res: Response, next: NextFunction) => {
    let template: string
    try {
      template = await fs.readFile('views/userProfile.pug', { encoding: 'utf-8' })
    } catch (err) {
      next(err)
      return
    }

    const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
    if (!loggedInUser) {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress)); return
    }

    let user: UserModel | null
    try {
      user = await UserModel.findByPk(loggedInUser.data.id)
    } catch (error) {
      next(error)
      return
    }

    let username = user.username
    
    // CSP doesn't prevent SSTI or eval
    if (username?.match(/#{(.*)}/) !== null) {
      const code = username?.substring(2, username.length - 1)
      try {
        username = eval(code) // Still vulnerable!
      } catch (err) {
        username = '\\' + username
      }
    } else {
      username = '\\' + username
    }

    template = template.replace(/_username_/g, username)
    const fn = pug.compile(template)
    
    // Adding CSP doesn't fix the server-side vulnerability
    const CSP = `default-src 'self'; script-src 'self'`
    res.set({ 'Content-Security-Policy': CSP })
    res.send(fn(user))
  }
}
