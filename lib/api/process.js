'use strict'

const client = require('../octopus-client')

const find = async id => {
  const url = `/deploymentProcesses/${id}`
  return client.get(url)
}

module.exports = { find }
