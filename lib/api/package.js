'use strict'

const client = require('../octopus-client')

const create = async (fileName, contents, replace) => {
  const url = `/packages/raw${replace ? '?replace=true' : ''}`
  return client.postFile(url, fileName, contents)
}

module.exports = { create }
