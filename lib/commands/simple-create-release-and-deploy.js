'use strict'

const createReleaseAndDeploy = require('./create-release-and-deploy')
const getEnvironmentId = require('./get-environment-id')
const getFormValues = require('./get-form-values')
const getProject = require('./get-project')
const getSelectedPackages = require('./get-selected-packages')
const octopusApi = require('../octopus-deploy')

const simpleCreateReleaseAndDeploy = (simpleReleaseParams, simpleDeployParams) => {
  const { projectSlugOrId, version, releaseNotes } = simpleReleaseParams
  const packageVersion = simpleReleaseParams.packageVersion || version
  const { environmentName, comments, variables, machineIds } = simpleDeployParams

  let projectId
  let selectedPackages

  let variableSetId
  let variableSet
  let environmentId

  return getProject.execute(projectSlugOrId)
    .then(project => {
      projectId = project.Id
      variableSetId = project.VariableSetId

      return getSelectedPackages.execute(project.DeploymentProcessId, packageVersion)
    })
    .then(packages => {
      selectedPackages = packages

      return octopusApi.variables.find(variableSetId)
    })
    .then(variables => {
      variableSet = variables

      return getEnvironmentId.execute(variableSet, projectSlugOrId, environmentName)
    })
    .then(foundEnvironmentId => {
      environmentId = foundEnvironmentId

      return getFormValues.execute(variables, variableSet, environmentId, environmentName)
    })
    .then(formValues => {
      const releaseParams = { projectId, version, releaseNotes, selectedPackages }
      const deployParams = { environmentId, comments, formValues, machineIds }

      return createReleaseAndDeploy.execute(releaseParams, deployParams)
    })
}

module.exports = simpleCreateReleaseAndDeploy
