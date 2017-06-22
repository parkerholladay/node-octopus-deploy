'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const mockProject = require('../../../test/mocks/mock-project')
const mockProjectRelease = require('../../../test/mocks/mock-project-release')
const OctopusClient = require('../../octopus-client')
const Project = require('../project')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Project(client)

describe('api/project', () => {
  afterEach(() => {
    client.get.restore()
  })

  describe('#find', () => {
    beforeEach(() => {
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve(mockProject))
    })

    it('finds a project by id', () => {
      const projectId = Math.floor(Math.random() * 100)

      return subject.find(projectId).then(project => {
        expect(project).to.eql(mockProject)
        return expect(client.get).to.be.calledWith(`/projects/${projectId}`)
      })
    })

    it('finds a project by slug', () => {
      const slug = 'my-project-name'

      return subject.find(slug).then(project => {
        expect(project).to.eql(mockProject)
        return expect(client.get).to.be.calledWith(`/projects/${slug}`)
      })
    })
  })

  describe('#getReleasesByProject', () => {
    it('returns releases', () => {
      const projectId = Math.floor(Math.random() * 100)
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve([mockProjectRelease]))

      return subject.getReleaseByProject(projectId).then(releases => {
        expect(releases).to.eql([mockProjectRelease])
        return expect(client.get).to.be.calledWith(`/projects/${projectId}/releases`)
      })
    })
  })

  describe('#getReleasesByProjectAndVersion', () => {
    it('returns releases', () => {
      const projectId = Math.floor(Math.random() * 100)
      const version = '1.0.' + Math.floor(Math.random() * 100)
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve(mockProjectRelease))

      return subject.getReleaseByProjectAndVersion(projectId, version).then(releases => {
        expect(releases).to.eql(mockProjectRelease)
        return expect(client.get).to.be.calledWith(`/projects/${projectId}/releases/${version}`)
      })
    })
  })
})
