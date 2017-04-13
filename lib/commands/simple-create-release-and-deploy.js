'use strict'

const createReleaseAndDeploy = require('./create-release-and-deploy')
const getProject = require('./get-project')
const getSelectedPackages = require('./get-selected-packages')
const octopusApi = require('../octopus-deploy')

function getVariableId(variables, variableName, environmentId, environmentName) {
  const foundVariables = variables.filter(varWithScope => {
    if (varWithScope.Name === variableName)
      return varWithScope.Scope.Environment.includes(environmentId)
  })

  if (!foundVariables || foundVariables.length === 0)
    throw new Error(`No variable '${variableName}' with scope '${environmentName}' found in variable set`)
  if (foundVariables.length > 1)
    throw new Error(`More than one variable '${variableName}' with scope '${environmentName}' found in variable set`)

  return foundVariables[0].Id
}

const simpleCreateReleaseAndDeploy = (simpleReleaseParams, simpleDeployParams) => {
  const { projectSlugOrId, version, releaseNotes, packageVersion } = simpleReleaseParams
  const { environmentName, comments, variables } = simpleDeployParams

  let projectId
  let selectedPackages
  let variableSetId

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
    .then(variableSet => {
      const environment = variableSet.ScopeValues.Environments.find(env => env.Name === environmentName)
      if (!environment)
        throw new Error(`Unable to find environment '${environmentName}' in variable set scope for project '${projectSlugOrId}'`)

      let formValues = {}
      const variableNames = Object.keys(variables)
      variableNames.map(variableName => {
        const variableId = getVariableId(variableSet.Variables, variableName, environment.Id, environmentName)
        formValues[variableId] = variables[variableName]
      })

      const releaseParams = { projectId, version, releaseNotes, selectedPackages }
      const deployParams = { environmentId: environment.Id, comments, formValues }
      return createReleaseAndDeploy.execute(releaseParams, deployParams)
    })
}

module.exports = simpleCreateReleaseAndDeploy
