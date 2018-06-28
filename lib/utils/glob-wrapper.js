'use strict'

const gs = require('glob-stream')

const getGlobStream = (globs, options) => {
  return gs(globs, options)
}

module.exports = { getGlobStream }
