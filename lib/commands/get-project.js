'use strict'

const BPromise = require('bluebird')
const logger = require('../logger')
const octopusApi = require('../octopus-deploy')

const getProject = (projectSlugOrId) => {
  return new BPromise((resolve, reject) => {
    return octopusApi.projects.find(projectSlugOrId)
      .then(project => {
        if (!project.VariableSetId)
          reject(Error(`VariableSetId is not set on project '${projectSlugOrId}'`))
        if (!project.DeploymentProcessId)
          reject(Error(`DeploymentProcessId is not set on project '${projectSlugOrId}'`))

        logger.info(`Found project '${project.Id}'`)
        return resolve(project)
      })
  })
}

module.exports.execute = getProject
