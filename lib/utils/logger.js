'use strict'
/* eslint-disable no-console */

const consoleLog = (func, args) => {
  if (!global.logToConsoleDisabled) {
    func.apply(console, args)
  }
}

const logger = {
  info: (...args) => consoleLog(console.log, args),
  error: (...args) => consoleLog(console.error, args)
}

module.exports = { logger }

/* eslint-enable no-console */
