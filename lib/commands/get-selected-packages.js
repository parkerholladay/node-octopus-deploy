'use strict'

const { logger } = require('../utils/logger')
const octopus = require('../octopus-deploy')

const getSelectedPackages = async (deploymentProcessId, version) => {
  logger.info(`Preparing deployment process '${deploymentProcessId}' with package verion '${version}'`)

  const process = await octopus.processes.find(deploymentProcessId)
  if (!process.hasValue) {
    logger.error(`Deployment process '${deploymentProcessId}' not found`)
    return []
  }

  const selectedPackages = process.value.steps.reduce((packages, step) => {
    return packages.concat(step.actions.map(action => ({
      stepName: action.name,
      version
    })))
  }, [])

  if (!selectedPackages.length) {
    logger.error(`No packages selected for deployment process '${deploymentProcessId}'`)
  }

  return selectedPackages
}

module.exports.execute = getSelectedPackages
