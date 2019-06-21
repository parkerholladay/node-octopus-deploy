'use strict'

const { JSONCasing } = require('json-casing')
const request = require('request-promise-native')

const { logger } = require('./logger')
const { Maybe } = require('./maybe')

const methods = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE'
}

const getAction = method => {
  switch (method) {
    case methods.get:
      return request.get
    case methods.post:
      return request.post
    case methods.delete:
      return request.delete
  }
}

const executeRequest = async (method, options, logKeys) => {
  const action = getAction(method)

  try {
    const data = await action(options)
    const camelizedData = JSONCasing.toCamel(data)

    return Maybe.some(camelizedData)
  } catch (err) {
    logger.error(`Failed to execute ${method} at '${options.url}'. Error: ${err.message}`)
    if (err.options) {
      const logInfo = logKeys.reduce((logInfo, key) => {
        const [optionsKey, logKey] = key.split(': ')
        return {
          [logKey || optionsKey]: err.options[optionsKey],
          ...logInfo
        }
      }, {})

      logger.info(logInfo)
    }

    return Maybe.none()
  }
}

module.exports = class OctopusClient {
  constructor(config) {
    const requiredConfig = [
      'host',
      'apiKey'
    ]

    if (!config) {
      throw new Error(`config is required in ${this.constructor.name}`)
    }

    for (const key of requiredConfig) {
      if (!config[key]) {
        throw new Error(`${key} is required in ${this.constructor.name}`)
      }
    }

    this.fileOptions = {
      baseUrl: `${config.host}/api`,
      headers: {
        'X-Octopus-ApiKey': config.apiKey,
        'Accept': 'application/json',
        'Content-Type': 'mutlipart/form-data'
      },
      json: true
    }

    this.jsonOptions = {
      ...this.fileOptions,
      headers: {
        ...this.fileOptions.headers,
        'Content-Type': 'application/json'
      }
    }
  }

  async get(url) {
    const logKeys = ['baseUrl', 'url', 'method', 'headers']

    return executeRequest(methods.get, { ...this.jsonOptions, url }, logKeys)
  }

  async post(url, data) {
    const logKeys = ['baseUrl', 'url', 'method', 'headers', 'body: data']

    return executeRequest(methods.post, { ...this.jsonOptions, url, body: data }, logKeys)
  }

  async postFile(url, name, contents) {
    const formData = {
      file: {
        value: contents,
        options: {
          filename: name,
          contentType: 'application/octet-stream'
        }
      }
    }

    const logKeys = ['baseUrl', 'url', 'method', 'headers', 'formData']

    return executeRequest(methods.post, { ...this.fileOptions, url, formData }, logKeys)
  }

  async delete(url) {
    const logKeys = ['baseUrl', 'url', 'method', 'headers']

    return executeRequest(methods.delete, { ...this.jsonOptions, url }, logKeys)
  }
}
