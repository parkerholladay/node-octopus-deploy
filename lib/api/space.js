'use strict'

const client = require('../octopus-client')

const findAll = async () => {
  const url = '/spaces/all'

  return client.get(url)
}

module.exports = {
  findAll
}
