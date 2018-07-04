'use strict'

module.exports = class Package {
  constructor(client) {
    this._client = client
  }

  create(fileName, replace, fileStream) {
    const url = `/packages/raw${replace ? '?replace' : ''}`
    return this._client.postFile(url, fileName, fileStream)
  }
}
