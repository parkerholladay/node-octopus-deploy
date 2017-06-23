'use strict'

module.exports = class Release {
  constructor(client) {
    this._client = client
  }

  find(id) {
    const url = `/releases/${id}`
    return this._client.get(url)
  }

  create(params) {
    const url = '/releases'
    const data = {
      ProjectId: params.projectId,
      ReleaseNotes: params.releaseNotes,
      Version: params.version,
      SelectedPackages: params.selectedPackages
    }

    return this._client.post(url, data)
  }
}
