const chai = require('chai')
const sinonChai = require('sinon-chai')
require('../lib').api.init(require('./client-config'))

chai.use(sinonChai)

global.logToConsoleDisabled = true
