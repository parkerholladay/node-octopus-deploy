'use strict'

const { Maybe } = require('../../utils/maybe')
const { generateProject, generateProjectRelease } = require('../../../test/mocks')
const OctopusClient = require('../../utils/octopus-client')
const Project = require('../project')
const { sandbox } = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Project(client)

describe('api/project', () => {
  describe('#find', () => {
    let project

    beforeEach(() => {
      project = generateProject()
      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(project))
    })

    it('finds a project by id', async () => {
      const actual = await subject.find(project.id)
      expect(actual.value).to.deep.equal(project)
      expect(client.get).to.be.calledWith(`/projects/${project.id}`)
    })

    it('finds a project by slug', async () => {
      project = generateProject({ slug: 'abathur' })

      const actual = await subject.find(project.slug)

      expect(actual.value).to.deep.equal(project)
      expect(client.get).to.be.calledWith(`/projects/${project.slug}`)
    })

    describe('when project does not exist', () => {
      it('returns none', async () => {
        project = null
        const actual = await subject.find('does-not-exist')
        expect(actual.hasValue).to.be.false
      })
    })
  })

  describe('#getReleasesByProject', () => {
    it('returns releases', async () => {
      const projectId = 'hanamura'
      const projectRelease = generateProjectRelease({ items: [{ projectId }, { projectId }] })
      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(projectRelease))

      const actual = await subject.getReleaseByProject(projectId)

      expect(actual.value).to.deep.equal(projectRelease)
      expect(client.get).to.be.calledWith(`/projects/${projectId}/releases`)
    })
  })

  describe('#getReleasesByProjectAndVersion', () => {
    it('returns releases', async () => {
      const projectId = 'the-nexus'
      const version = '2.0'
      const projectRelease = generateProjectRelease({ items: [{ projectId, version }] })
      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(projectRelease))

      const actual = await subject.getReleaseByProjectAndVersion(projectId, version)

      expect(actual.value).to.deep.equal(projectRelease)
      expect(client.get).to.be.calledWith(`/projects/${projectId}/releases/${version}`)
    })
  })
})
