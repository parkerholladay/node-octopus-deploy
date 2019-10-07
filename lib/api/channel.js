'use strict'

const client = require('../octopus-client')

const getAll = async (take, skip) => {
  const url = `/channels?${take ? `take=${take}` : ''}&${skip ? `skip=${skip}` : ''}`
  return client.get(url)
}

module.exports = { getAll }
