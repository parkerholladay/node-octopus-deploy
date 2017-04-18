'use strict'

module.exports = class Machine {
  constructor(client) {
    this._client = client
  }

  findAll() {
    const url = '/machines/all'
    return this._client.get(url)
  }
}
