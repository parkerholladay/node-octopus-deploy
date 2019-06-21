'use strict'

module.exports = class Machine {
  constructor(client) {
    this._client = client
  }

  async findAll() {
    const url = '/machines/all'
    const result = await this._client.get(url)

    return result.valueOrDefault([])
  }

  async delete(id) {
    const url = `/machines/${id}`
    return this._client.delete(url)
  }
}
