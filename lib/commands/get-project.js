'use strict'

const BPromise = require('bluebird')
const logger = require('../logger')
const octopusApi = require('../octopus-deploy')

const getProject = projectSlugOrId => {
  return new BPromise((resolve, reject) => {
    return octopusApi.projects.find(projectSlugOrId)
      .then(project => {
        if (!project.variableSetId)
          reject(new Error(`VariableSetId is not set on project '${projectSlugOrId}'`))
        if (!project.deploymentProcessId)
          reject(new Error(`DeploymentProcessId is not set on project '${projectSlugOrId}'`))

        logger.info(`Found project '${project.id}'`)
        return resolve(project)
      })
  })
}

module.exports.execute = getProject
