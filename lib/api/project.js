'use strict'

module.exports = class Project {
  constructor(client) {
    this._client = client
  }

  async find(idOrSlug) {
    const url = `/projects/${idOrSlug}`
    return this._client.get(url)
  }

  async getReleaseByProject(id) {
    const url = `/projects/${id}/releases`
    return this._client.get(url)
  }

  async getReleaseByProjectAndVersion(id, version) {
    const url = `/projects/${id}/releases/${version}`
    return this._client.get(url)
  }
}
