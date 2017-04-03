'use strict'

module.exports = class Environment {
  constructor(client) {
    this._client = client
  }

  find(id) {
    const url = `/environments/${id}`
    return this._client.get(url)
  }
}
