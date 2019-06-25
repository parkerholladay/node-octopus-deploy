'use strict'

const client = require('../octopus-client')

const find = async id => {
  const url = `/releases/${id}`
  return client.get(url)
}

const create = async data => {
  const url = '/releases'
  return client.post(url, data)
}

module.exports = {
  find,
  create
}
