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
    
    // Attempting to sanitize but still vulnerable
    if (username?.match(/#{(.*)}/) !== null) {
      const code = username?.substring(2, username.length - 1)
      try {
        // Remove dangerous patterns
        const sanitized = code.replace(/require|import|process|eval/gi, '')
        username = eval(sanitized) // Still vulnerable!
      } catch (err) {
        username = '\\' + username
      }
    } else {
      username = '\\' + username
    }

    template = template.replace(/_username_/g, username)
    const fn = pug.compile(template)
    res.send(fn(user))
  }
}
