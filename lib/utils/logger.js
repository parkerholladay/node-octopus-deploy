'use strict'
/* eslint-disable no-console */

module.exports = {
  info: (...args) => {
    if (!global.logToConsoleDisabled)
      console.log.apply(console, args)
  },
  error: (...args) => {
    console.error.apply(console, args)
  }
}

/* eslint-enable no-console */
