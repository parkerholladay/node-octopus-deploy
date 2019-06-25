'use strict'

const client = require('../octopus-client')

const find = async idOrSlug => {
  const url = `/projects/${idOrSlug}`
  return client.get(url)
}

const getReleaseByProject = async id => {
  const url = `/projects/${id}/releases`
  return client.get(url)
}

const getReleaseByProjectAndVersion = async (id, version) => {
  const url = `/projects/${id}/releases/${version}`
  return client.get(url)
}

module.exports = {
  find,
  getReleaseByProject,
  getReleaseByProjectAndVersion
}
