const chai = require('chai')
const sinonChai = require('sinon-chai')
require('../lib/octopus-deploy').init(require('./client-config'))

chai.use(sinonChai)

global.logToConsoleDisabled = true
