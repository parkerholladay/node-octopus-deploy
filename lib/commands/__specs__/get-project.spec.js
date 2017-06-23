'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const subject = require('../get-project').execute
const mockProject = require('../../../test/mocks/mock-project')
const octopusApi = require('../../octopus-deploy')

describe('commands/get-project', () => {
  const projectId = 'projects-123'

  afterEach(() => {
    octopusApi.projects.find.restore()
  })

  describe('when the project has required dependencies', () => {
    it('returns the project', () => {
      sinon.stub(octopusApi.projects, 'find').callsFake(() => BPromise.resolve(mockProject))

      return subject(projectId).then(project => {
        expect(project).to.eql(mockProject)
        return expect(octopusApi.projects.find).to.be.calledWith(projectId)
      })
    })
  })

  describe('when the project is missing a variable set', () => {
    it('rejects with an error', () => {
      const invalidProject = Object.assign({}, mockProject, { VariableSetId: null })
      sinon.stub(octopusApi.projects, 'find').callsFake(() => BPromise.resolve(invalidProject))

      return subject(projectId).catch(err => {
        expect(err.message).to.be.eql(`VariableSetId is not set on project '${projectId}'`)
      })
    })
  })

  describe('when the project is missing a deployment process', () => {
    it('rejects with an error', () => {
      const invalidProject = Object.assign({}, mockProject, { DeploymentProcessId: null })
      sinon.stub(octopusApi.projects, 'find').callsFake(() => BPromise.resolve(invalidProject))

      return subject(projectId).catch(err => {
        expect(err.message).to.eql(`DeploymentProcessId is not set on project '${projectId}'`)
      })
    })
  })
})
