const requestLogger = function (req, res, next) {
  if (!req.url.includes('arena')) {
    console.log('\n===== Incoming Request =====\n')
    console.log(`${new Date()}`)
    console.log(`${req.method} ${req.url}`)
    console.log(`body ${JSON.stringify(req.body)}`)
    console.log('\n============================\n')
    console.log('\n')
  }
  next()
}

module.exports = requestLogger
