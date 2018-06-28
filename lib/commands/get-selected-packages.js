'use strict'

const octo = require('../')
const logger = require('../utils/logger')

const getSelectedPackages = (deploymentProcessId, version) => {
  logger.info(`Preparing deployment process '${deploymentProcessId}' with package verion '${version}'`)
  return octo.api.processes.find(deploymentProcessId)
    .then(process => {
      const selectedPackages = process.steps.reduce((packages, step) => {
        return packages.concat(step.actions.map(action => {
          return { stepName: action.name, version }
        }))
      }, [])

      return selectedPackages
    })
}

module.exports.execute = getSelectedPackages
