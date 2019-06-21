'use strict'

module.exports = class Deployment {
  constructor(client) {
    this._client = client
  }

  async find(id) {
    const url = `/deployments/${id}`
    return this._client.get(url)
  }

  async create(releaseId, params) {
    const url = '/deployments'

    const { environmentId, comments, formValues, machineIds } = params
    const data = {
      releaseId,
      environmentId,
      comments
    }
    if (formValues) {
      data.formValues = formValues
    }
    if (machineIds) {
      data.specificMachineIds = machineIds
    }

    return this._client.post(url, data)
  }
}
