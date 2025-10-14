function handleZipFileUpload ({ file }: Request, res: Response, next: NextFunction) {
  if (utils.endsWith(file?.originalname.toLowerCase(), '.zip')) {
    if (((file?.buffer) != null)) {
      const buffer = file.buffer
      const filename = file.originalname.toLowerCase()
      const tempFile = path.join(os.tmpdir(), filename)
      const baseDir = path.resolve('uploads/complaints/')
      fs.open(tempFile, 'w', function (err, fd) {
        if (err != null) { next(err) }
        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
          if (err != null) { next(err) }
          fs.close(fd, function () {
            fs.createReadStream(tempFile)
              .pipe(unzipper.Parse())
              .on('entry', function (entry: any) {
                // Correct: Use basename to strip directory components
                const safeFileName = path.basename(entry.path)
                const absolutePath = path.resolve(baseDir, safeFileName)
                
                // Verify the resolved path is within baseDir
                if (absolutePath.startsWith(baseDir + path.sep)) {
                  entry.pipe(fs.createWriteStream(absolutePath).on('error', function (err) { next(err) }))
                } else {
                  entry.autodrain()
                }
              }).on('error', function (err: unknown) { next(err) })
          })
        })
      })
    }
    res.status(204).end()
  } else {
    next()
  }
}
