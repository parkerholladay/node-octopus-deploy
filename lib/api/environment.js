'use strict'

module.exports = class Environment {
  constructor(client) {
    this._client = client
  }

  async find(id) {
    const url = `/environments/${id}`
    return this._client.get(url)
  }

  async findAll() {
    const url = '/environments/all'
    const result = await this._client.get(url)

    return result.valueOrDefault([])
  }
}
