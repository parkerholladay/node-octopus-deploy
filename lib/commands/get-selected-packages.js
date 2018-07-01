'use strict'

const logger = require('../utils/logger')
const octopus = require('../octopus-deploy')

const getSelectedPackages = (deploymentProcessId, version) => {
  logger.info(`Preparing deployment process '${deploymentProcessId}' with package verion '${version}'`)
  return octopus.processes.find(deploymentProcessId)
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
