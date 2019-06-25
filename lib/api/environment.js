'use strict'

const client = require('../octopus-client')

const find = async id => {
  const url = `/environments/${id}`
  return client.get(url)
}

const findAll = async () => {
  const url = '/environments/all'
  const result = await client.get(url)

  return result.valueOrDefault([])
}

module.exports = {
  find,
  findAll
}
