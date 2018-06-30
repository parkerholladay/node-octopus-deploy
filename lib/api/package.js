'use strict'

module.exports = class Release {
  constructor(client) {
    this._client = client
  }

  create(fileName, fileStream) {
    const url = '/packages/raw'
    return this._client.postFileStream(url, fileName, fileStream)
  }
}
