const sinon = require('sinon')

const sandbox = sinon.createSandbox({ injectInto: null, properties: ['stub'] })

afterEach(() => {
  sandbox.restore()
})

module.exports = sandbox
