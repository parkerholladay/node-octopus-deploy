'use strict'

const generateTask = (overrides = {}) => ({
  id: 'Task-123',
  arguments: {},
  canRerun: true,
  completed: 'Queued...',
  completedTime: null,
  description: null,
  duration: '736,508 days',
  errorMessage: '',
  finishedSuccessfully: false,
  hasBeenPickedUpByProcessor: false,
  hasPendingInterruptions: false,
  hasWarningsOrErrors: false,
  isCompleted: false,
  lastModifiedBy: 'email@acme.com',
  lastModified: '2017-01-01T00:00:00+0000',
  lastUpdatedTime: '2017-01-01T00:00:00+0000',
  links: {},
  name: 'Do the thing',
  queueTime: '2017-01-01T00:00:00+0000',
  serverNode: null,
  startTime: null,
  state: 'Queued',
  ...overrides
})

module.exports = { generateTask }
