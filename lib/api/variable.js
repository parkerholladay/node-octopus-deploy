'use strict'

module.exports = class Variable {
  constructor(client) {
    this._client = client
  }

  async find(id) {
    const url = `/variables/${id}`
    return this._client.get(url)
  }
}
