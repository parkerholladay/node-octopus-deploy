'use strict'

module.exports = class Release {
  constructor(client) {
    this._client = client
  }

  async find(id) {
    const url = `/releases/${id}`
    return this._client.get(url)
  }

  async create(data) {
    const url = '/releases'
    return this._client.post(url, data)
  }
}
