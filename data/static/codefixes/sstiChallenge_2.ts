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
    
    // Encoding but still has eval and template injection
    if (username?.match(/#{(.*)}/) !== null) {
      const code = username?.substring(2, username.length - 1)
      try {
        username = eval(code)
      } catch (err) {
        username = entities.encode(username)
      }
    } else {
      username = entities.encode(username)
    }

    template = template.replace(/_username_/g, username)
    const fn = pug.compile(template)
    res.send(fn(user))
  }
}
