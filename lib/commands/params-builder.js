'use strict'

const getEnvironmentId = require('./get-environment-id')
const getFormValues = require('./get-form-values')
const getProject = require('./get-project')
const getSelectedPackages = require('./get-selected-packages')
const getVariableSet = require('./get-variable-set')
const { Maybe } = require('../utils')

const buildReleaseParams = async (simpleReleaseParams, project = null) => {
  const { projectSlugOrId, version, releaseNotes, packageVersion: pkgVersion } = simpleReleaseParams
  const packageVersion = pkgVersion || version

  project = project
    ? Maybe.some(project)
    : await getProject.execute(projectSlugOrId)
  if (!project.hasValue) {
    return Maybe.none()
  }

  const { id: projectId, deploymentProcessId } = project.value

  const selectedPackages = await getSelectedPackages.execute(deploymentProcessId, packageVersion)
  if (!selectedPackages.length) {
    return Maybe.none()
  }

  return Maybe.some({ projectId, version, releaseNotes, selectedPackages })
}

const buildDeployParams = async (simpleDeployParams, project) => {
  const { environmentName, comments, variables, machineIds } = simpleDeployParams
  const { id: projectId, variableSetId } = project

  const maybeVariableSet = await getVariableSet.execute(variableSetId)
  if (!maybeVariableSet.hasValue) {
    return Maybe.none()
  }

  const variableSet = maybeVariableSet.value

  const maybeEnvironmentId = getEnvironmentId.execute(variableSet, projectId, environmentName)
  if (!maybeEnvironmentId.hasValue) {
    return Maybe.none()
  }

  const environmentId = maybeEnvironmentId.value

  const maybeFormValues = getFormValues.execute(variables, variableSet, environmentId, environmentName)
  if (!maybeFormValues.hasValue) {
    return Maybe.none()
  }

  const formValues = maybeFormValues.value

  return Maybe.some({ environmentId, comments, formValues, machineIds })
}

module.exports = {
  buildDeployParams,
  buildReleaseParams
}
