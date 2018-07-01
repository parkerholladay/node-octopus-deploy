'use strict'

module.exports = class Package {
  constructor(client) {
    this._client = client
  }

  create(fileName, fileStream) {
    const url = '/packages/raw'
    return this._client.postFile(url, fileName, fileStream)
  }
}
