'use strict'

const Deployment = require('./api/deployment')
const Environment = require('./api/environment')
const Machine = require('./api/machine')
const OctopusClient = require('./utils/octopus-client')
const Package = require('./api/package')
const Project = require('./api/project')
const Process = require('./api/process')
const Release = require('./api/release')
const Variable = require('./api/variable')

class OctopusDeploy {
  constructor() {
    this._client = null
  }

  init(config) {
    if (this._client) {
      throw new Error('The octopus api client has already been initialized')
    }

    this._client = new OctopusClient(config)
  }

  close() {
    this._client = null
    this._deployments = null
    this._environments = null
    this._machines = null
    this._packages = null
    this._processes = null
    this._projects = null
    this._releases = null
    this._variables = null
  }

  _validateClient() {
    if (!this._client) {
      throw new Error(`The configuration for the api must be set by calling 'init' before making requests`)
    }
  }

  _getApi(apiType, ApiClass) {
    this._validateClient()

    const api = `_${apiType}`
    if (!this[api]) {
      this[api] = new ApiClass(this._client)
    }

    return this[api]
  }

  get deployments() {
    return this._getApi('deployments', Deployment)
  }
  get environments() {
    return this._getApi('environments', Environment)
  }
  get machines() {
    return this._getApi('machines', Machine)
  }
  get packages() {
    return this._getApi('packages', Package)
  }
  get processes() {
    return this._getApi('processes', Process)
  }
  get projects() {
    return this._getApi('projects', Project)
  }
  get releases() {
    return this._getApi('releases', Release)
  }
  get variables() {
    return this._getApi('variables', Variable)
  }
}

module.exports = new OctopusDeploy()
