'use strict'

module.exports = class Release {
  constructor(client) {
    this._client = client
  }

  find(id) {
    const url = `/releases/${id}`
    return this._client.get(url)
  }

  create(projectId, version, releaseNotes, selectedPackages) {
    const url = '/releases'
    const data = {
      ProjectId: projectId,
      ReleaseNotes: releaseNotes,
      Version: version,
      SelectedPackages: selectedPackages
    }

    return this._client.post(url, data)
  }
}
