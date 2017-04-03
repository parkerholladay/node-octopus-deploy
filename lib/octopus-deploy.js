'use strict'

const Deployment = require('./api/deployment')
const Environment = require('./api/environment')
const OctopusClient = require('./octopus-client')
const Project = require('./api/project')
const Process = require('./api/process')
const Release = require('./api/release')
const Variable = require('./api/variable')

class OctopusDeploy {
  constructor() {
    this._client = null
  }

  init(config) {
    if (this._client)
      throw new Error('The octopus api client has already been initialized')
    this._client = new OctopusClient(config)
  }

  close() {
    this._client = null
    this._deployments = null
    this._environments = null
    this._processes = null
    this._projects = null
    this._releases = null
    this._variables = null
  }

  _validateClient() {
    if (!this._client)
      throw new Error(`The configuration for the api must be set by calling 'init' before making requests`)
  }

  get deployments() {
    this._validateClient()
    return this._deployments = this._deployments || new Deployment(this._client)
  }
  get environments() {
    this._validateClient()
    return this._environments = this._environments || new Environment(this._client)
  }
  get processes() {
    this._validateClient()
    return this._processes = this._processes || new Process(this._client)
  }
  get projects() {
    this._validateClient()
    return this._projects = this._projects || new Project(this._client)
  }
  get releases() {
    this._validateClient()
    return this._releases = this._releases || new Release(this._client)
  }
  get variables() {
    this._validateClient()
    return this._variables = this._variables || new Variable(this._client)
  }
}

module.exports = new OctopusDeploy()
