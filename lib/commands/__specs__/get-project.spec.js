'use strict'

const { execute: subject } = require('../get-project')
require('../../../test/init-api')
const { generateProject } = require('../../../test/mocks')
const octopus = require('../../octopus-deploy')
const { sandbox } = require('../../../test/sandbox')
const { Maybe } = require('../../utils')

describe('commands/get-project', () => {
  describe('#execute', () => {
    let project

    beforeEach(() => {
      project = generateProject()
      sandbox.stub(octopus.projects, 'find').callsFake(async () => Maybe.some(project))
    })

    describe('when the project has required dependencies', () => {
      it('returns the project', async () => {
        const actual = await subject(project.id)
        expect(actual.value).to.deep.equal(project)
        expect(octopus.projects.find).to.be.calledWith(project.id)
      })
    })

    describe('when the project is missing a variable set', () => {
      it('returns none', async () => {
        project = { ...project, variableSetId: null }
        const actual = await subject(project.id)
        expect(actual.hasValue).to.be.false
      })
    })

    describe('when the project is missing a deployment process', () => {
      it('returns none', async () => {
        project = { ...project, deploymentProcessId: null }
        const actual = await subject(project.id)
        expect(actual.hasValue).to.be.false
      })
    })

    describe('when the project does not exist', () => {
      it('returns none', async () => {
        project = null
        const actual = await subject('does-not-exist')
        expect(actual.hasValue).to.be.false
      })
    })
  })
})
