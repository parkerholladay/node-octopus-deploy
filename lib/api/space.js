'use strict'

const client = require('../octopus-client')

const getAll = async (take, skip) => {
  const url = `/spaces?${take ? `&take=${take}` : ''}${
    skip ? `&skip=${skip}` : ''
  }`

  return client.get(url)
}

module.exports = {
  getAll
}
