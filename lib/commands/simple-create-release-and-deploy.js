'use strict'

const createReleaseAndDeploy = require('./create-release-and-deploy')
const getEnvironmentId = require('./get-environment-id')
const getFormValues = require('./get-form-values')
const getProject = require('./get-project')
const getSelectedPackages = require('./get-selected-packages')
const { logger } = require('../utils/logger')
const { Maybe } = require('../utils/maybe')
const octopus = require('../octopus-deploy')

const simpleCreateReleaseAndDeploy = async (simpleReleaseParams, simpleDeployParams) => {
  const { projectSlugOrId, version, releaseNotes } = simpleReleaseParams
  const packageVersion = simpleReleaseParams.packageVersion || version
  const { environmentName, comments, variables, machineIds } = simpleDeployParams

  const project = await getProject.execute(projectSlugOrId)
  if (!project.hasValue) {
    return Maybe.none()
  }

  const { id: projectId, deploymentProcessId, variableSetId } = project.value

  const selectedPackages = await getSelectedPackages.execute(deploymentProcessId, packageVersion)
  if (!selectedPackages.length) {
    return Maybe.none()
  }

  const maybeVariableSet = await octopus.variables.find(variableSetId)
  if (!maybeVariableSet.hasValue) {
    logger.error(`Variable set '${variableSetId}' not found`)
    return Maybe.none()
  }

  const variableSet = maybeVariableSet.value

  const maybeEnvironmentId = getEnvironmentId.execute(variableSet, projectSlugOrId, environmentName)
  if (!maybeEnvironmentId.hasValue) {
    return Maybe.none()
  }

  const environmentId = maybeEnvironmentId.value

  const maybeFormValues = getFormValues.execute(variables, variableSet, environmentId, environmentName)
  if (!maybeFormValues.hasValue) {
    return Maybe.none()
  }

  const formValues = maybeFormValues.value

  const releaseParams = { projectId, version, releaseNotes, selectedPackages }
  const deployParams = { environmentId, comments, formValues, machineIds }

  return createReleaseAndDeploy.execute(releaseParams, deployParams)
}

module.exports.execute = simpleCreateReleaseAndDeploy
