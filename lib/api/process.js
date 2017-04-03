'use strict'

module.exports = class Process {
  constructor(client) {
    this._client = client
  }

  find(id) {
    const url = `/deploymentProcesses/${id}`
    return this._client.get(url)
  }
}
