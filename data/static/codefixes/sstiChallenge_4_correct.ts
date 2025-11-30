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

    // Correct: Remove eval() and pass username as a variable to the template
    const username = entities.encode(user.username || '')
    
    // Don't interpolate user data into template string
    // Instead, pass it as a variable to the compiled function
    const fn = pug.compile(template)
    
    const templateData = {
      ...user.toJSON(),
      username: username,
      emailHash: security.hash(user?.email),
      title: entities.encode(config.get<string>('application.name')),
      favicon: utils.extractFilename(config.get('application.favicon'))
    }
    
    res.send(fn(templateData))
  }
}
