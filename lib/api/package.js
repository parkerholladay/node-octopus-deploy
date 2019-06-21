'use strict'

module.exports = class Package {
  constructor(client) {
    this._client = client
  }

  async create(fileName, replace, contents) {
    const url = `/packages/raw${replace ? '?replace=true' : ''}`
    return this._client.postFile(url, fileName, contents)
  }
}
