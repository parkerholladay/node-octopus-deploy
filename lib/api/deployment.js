'use strict'

const client = require('../octopus-client')

const find = async id => {
  const url = `/deployments/${id}`
  return client.get(url)
}

const create = async params => {
  const url = '/deployments'

  const { formValues, machineIds, ...data } = params
  if (formValues) {
    data.formValues = formValues
  }
  if (machineIds) {
    data.specificMachineIds = machineIds
  }

  return client.post(url, data)
}

module.exports = { create, find }
