'use strict'

const client = require('../octopus-client')

const findAll = async () => {
  const url = '/machines/all'
  const result = await client.get(url)

  return result.valueOrDefault([])
}

const deleteMachine = async id => {
  const url = `/machines/${id}`
  return client.delete(url)
}

module.exports = {
  delete: deleteMachine,
  findAll
}
