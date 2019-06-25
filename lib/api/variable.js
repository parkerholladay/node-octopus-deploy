'use strict'

const client = require('../octopus-client')

const find = async id => {
  const url = `/variables/${id}`
  return client.get(url)
}

module.exports = { find }
