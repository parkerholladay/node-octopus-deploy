module.exports = {
  info: (...args) => {
    if (!global.logToConsoleDisabled)
      console.log.apply(console, args)
  },
  error: (...args) => {
    console.error.apply(console, args)
  }
}
