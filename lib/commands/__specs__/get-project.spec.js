'use strict'

const BPromise = require('bluebird')

const { execute: subject } = require('../get-project')
require('../../../test/init-api')
const { generateProject } = require('../../../test/mocks')
const octopus = require('../../octopus-deploy')
const { sandbox } = require('../../../test/sandbox')

describe('commands/get-project', () => {
  describe('#execute', () => {
    const project = generateProject()

    let projectsResult

    beforeEach(() => {
      projectsResult = BPromise.resolve(project)
      sandbox.stub(octopus.projects, 'find').callsFake(() => projectsResult)
    })

    describe('when the project has required dependencies', () => {
      it('returns the project', () => {
        return subject(project.id).then(actual => {
          expect(octopus.projects.find).to.be.calledWith(project.id)
          return expect(actual).to.deep.equal(project)
        })
      })
    })

    describe('when the project is missing a variable set', () => {
      it('rejects with an error', () => {
        const invalidProject = Object.assign({}, project, { variableSetId: null })
        projectsResult = BPromise.resolve(invalidProject)

        return expect(subject(project.id)).to.eventually.be.rejectedWith(`VariableSetId is not set on project '${project.id}'`)
      })
    })

    describe('when the project is missing a deployment process', () => {
      it('rejects with an error', () => {
        const invalidProject = Object.assign({}, project, { deploymentProcessId: null })
        projectsResult = BPromise.resolve(invalidProject)

        return expect(subject(project.id)).to.eventually.be.rejectedWith(`DeploymentProcessId is not set on project '${project.id}'`)
      })
    })
  })
})
