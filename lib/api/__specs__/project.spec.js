'use strict'

const BPromise = require('bluebird')

const { generateProject, generateProjectRelease } = require('../../../test/mocks')
const OctopusClient = require('../../utils/octopus-client')
const Project = require('../project')
const { sandbox } = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Project(client)

describe('api/project', () => {
  describe('#find', () => {
    it('finds a project by id', () => {
      const project = generateProject()
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(project))

      return subject.find(project.id).then(actual => {
        expect(client.get).to.be.calledWith(`/projects/${project.id}`)
        return expect(actual).to.deep.equal(project)
      })
    })

    it('finds a project by slug', () => {
      const project = generateProject({ slug: 'abathur' })
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(project))

      return subject.find(project.slug).then(actual => {
        expect(client.get).to.be.calledWith(`/projects/${project.slug}`)
        return expect(actual).to.deep.equal(project)
      })
    })
  })

  describe('#getReleasesByProject', () => {
    it('returns releases', () => {
      const projectId = 'hanamura'
      const projectRelease = generateProjectRelease({ items: [{ projectId }] })
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve([projectRelease]))

      return subject.getReleaseByProject(projectId).then(actual => {
        expect(client.get).to.be.calledWith(`/projects/${projectId}/releases`)
        return expect(actual).to.deep.equal([projectRelease])
      })
    })
  })

  describe('#getReleasesByProjectAndVersion', () => {
    it('returns releases', () => {
      const projectId = 'the-nexus'
      const version = '2.0'
      const projectRelease = generateProjectRelease({ items: [{ projectId, version }] })
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(projectRelease))

      return subject.getReleaseByProjectAndVersion(projectId, version).then(actual => {
        expect(client.get).to.be.calledWith(`/projects/${projectId}/releases/${version}`)
        return expect(actual).to.deep.equal(projectRelease)
      })
    })
  })
})
