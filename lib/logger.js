module.exports.log = (...args) => {
  if (!global.logToConsoleDisabled)
    console.log.apply(console, args)
}
