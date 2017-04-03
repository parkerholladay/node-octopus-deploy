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
    sinon.restore(octopusApi.projects.find)
  })

  describe('when the project has required dependencies', () => {
    it('returns the project', () => {
      sinon.stub(octopusApi.projects, 'find', () => BPromise.resolve(mockProject))

      return subject(projectId).then(project => {
        expect(project).to.eql(mockProject)
        expect(octopusApi.projects.find).to.be.calledWith(projectId)
      })
    })
  })

  describe('when the project is missing a variable set', () => {
    it('throws an error', () => {
      const invalidProject = Object.assign({}, mockProject, { VariableSetId: null })
      sinon.stub(octopusApi.projects, 'find', () => BPromise.resolve(invalidProject))

      return subject(projectId).catch(err => {
        expect(err).to.be.instanceof(Error)
      })
    })
  })

  describe('when the project is missing a deployment process', () => {
    it('throws an error', () => {
      const invalidProject = Object.assign({}, mockProject, { DeploymentProcessId: null })
      sinon.stub(octopusApi.projects, 'find', () => BPromise.resolve(invalidProject))

      return subject(projectId).catch(err => {
        expect(err).to.be.instanceof(Error)
      })
    })
  })
})
