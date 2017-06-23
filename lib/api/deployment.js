'use strict'

module.exports = class Deployment {
  constructor(client) {
    this._client = client
  }

  find(id) {
    const url = `/deployments/${id}`
    return this._client.get(url)
  }

  create(releaseId, params) {
    const url = '/deployments'
    const data = {
      ReleaseId: releaseId,
      EnvironmentId: params.environmentId,
      Comments: params.comments
    }
    if (params.formValues) data.FormValues = params.formValues
    if (params.machineIds) data.SpecificMachineIds = params.machineIds

    return this._client.post(url, data)
  }
}
