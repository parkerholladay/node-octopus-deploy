'use strict'

module.exports = class Release {
  constructor(client) {
    this._client = client
  }

  find(id) {
    const url = `/releases/${id}`
    return this._client.get(url)
  }

  create(data) {
    const url = '/releases'
    return this._client.post(url, data)
  }
}
