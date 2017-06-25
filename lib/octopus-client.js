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

    this._request = request.defaults({
      baseUrl: config.host + '/api',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Octopus-ApiKey': config.apiKey
      },
      json: true
    })
  }

  get(url) {
    return new BPromise((resolve, reject) => {
      this._request.get(url)
        .then(data => resolve(JSONCasing.toCamel(data)))
        .catch(err => {
          logger.error(`Failed to get from '${url}'. Error: ${err.message}`)
          if (err.options) {
            const { baseUrl, headers, method, uri } = err.options
            logger.info({ baseUrl, headers, method, uri })
          }

          reject(err)
        })
    })
  }

  post(url, data) {
    const options = {
      uri: url,
      body: data
    }

    return new BPromise((resolve, reject) => {
      this._request.post(options)
        .then(data => resolve(JSONCasing.toCamel(data)))
        .catch(err => {
          logger.error(`Failed to post to '${url}'. Error: ${err.message}`)
          if (err.options) {
            const { baseUrl, headers, method, uri, body } = err.options
            logger.info({ baseUrl, headers, method, uri, body })
          }

          reject(err)
        })
    })
  }

  delete(url) {
    return new BPromise((resolve, reject) => {
      this._request.delete(url)
        .then(data => resolve(JSONCasing.toCamel(data)))
        .catch(err => {
          logger.error(`Failed to delete from '${url}'. Error: ${err.message}`)
          if (err.options) {
            const { baseUrl, headers, method, uri } = err.options
            logger.info({ baseUrl, headers, method, uri })
          }

          reject(err)
        })
    })
  }
}
