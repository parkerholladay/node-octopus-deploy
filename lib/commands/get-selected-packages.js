'use strict'

const logger = require('../logger')
const octopusApi = require('../octopus-deploy')

const getSelectedPackages = (deploymentProcessId, packageVersion) => {
  logger.info(`Preparing deployment process '${deploymentProcessId}' with package verion '${packageVersion}'`)
  return octopusApi.processes.find(deploymentProcessId)
    .then(process => {
      const selectedPackages = process.Steps.reduce((packages, step) => {
        return packages.concat(step.Actions.map(action => {
          return {
            StepName: action.Name,
            Version: packageVersion
          }
        }))
      }, [])

      return selectedPackages
    })
}

module.exports.execute = getSelectedPackages
