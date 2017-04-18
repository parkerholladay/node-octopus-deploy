'use strict'

module.exports = class Deployment {
  constructor(client) {
    this._client = client
  }

  find(id) {
    const url = `/deployments/${id}`
    return this._client.get(url)
  }

  create(environmentId, releaseId, comments, formValues) {
    const url = '/deployments'
    const data = {
      EnvironmentId: environmentId,
      ReleaseId: releaseId,
      Comments: comments
    }
    if (formValues) data.FormValues = formValues

    return this._client.post(url, data)
  }
}
