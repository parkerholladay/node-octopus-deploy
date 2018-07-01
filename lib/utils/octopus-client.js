'use strict'

const BPromise = require('bluebird')
const JSONCasing = require('json-casing').JSONCasing
const request = require('request-promise')

const logger = require('./logger')

module.exports = class OctopusClient {
  constructor(config) {
    const requiredConfig = [
      'host',
      'apiKey'
    ]

    if (!config) throw new Error(`config is required in ${this.constructor.name}`)
    for (const key of requiredConfig) {
      if (!config[key])
        throw new Error(`${key} is required in ${this.constructor.name}`)
    }

    this._fileRequest = request.defaults({
      baseUrl: config.host + '/api',
      headers: {
        'X-Octopus-ApiKey': config.apiKey,
        'Content-Type': 'mutlipart/form-data'
      },
      json: true
    })
    this._jsonRequest = this._fileRequest.defaults({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
  }

  get(url) {
    return new BPromise((resolve, reject) => {
      this._jsonRequest.get(url)
        .then(data => resolve(JSONCasing.toCamel(data)))
        .catch(err => {
          logger.error(`Failed to get from '${url}'. Error: ${err.message}`)
          if (err.options) {
            const { baseUrl, uri, method, headers } = err.options
            logger.info({ baseUrl, uri, method, headers })
          }

          reject(err)
        })
    })
  }

  post(url, data) {
    const options = { uri: url, body: data }

    return new BPromise((resolve, reject) => {
      this._jsonRequest.post(options)
        .then(data => resolve(JSONCasing.toCamel(data)))
        .catch(err => {
          logger.error(`Failed to post to '${options.uri}'. Error: ${err.message}`)
          if (err.options) {
            const { baseUrl, uri, method, headers, body } = err.options
            logger.info({ baseUrl, uri, method, headers, body })
          }

          reject(err)
        })
    })
  }

  postFile(url, name, contents) {
    const options = {
      uri: url,
      formData: {
        file: {
          value: contents,
          options: {
            filename: name,
            contentType: 'application/octet-stream'
          }
        }
      }
    }

    return new BPromise((resolve, reject) => {
      this._fileRequest.post(options)
        .then(data => resolve(JSONCasing.toCamel(data)))
        .catch(err => {
          logger.error(`Failed to post file to '${options.uri}'. Error: ${err.message}`)
          if (err.options) {
            const { baseUrl, uri, method, headers, formData } = err.options
            logger.info({ baseUrl, uri, method, headers, formData })
          }

          reject(err)
        })
    })
  }

  delete(url) {
    return new BPromise((resolve, reject) => {
      this._jsonRequest.delete(url)
        .then(data => resolve(JSONCasing.toCamel(data)))
        .catch(err => {
          logger.error(`Failed to delete from '${url}'. Error: ${err.message}`)
          if (err.options) {
            const { baseUrl, uri, method, headers } = err.options
            logger.info({ baseUrl, uri, method, headers })
          }

          reject(err)
        })
    })
  }
}
